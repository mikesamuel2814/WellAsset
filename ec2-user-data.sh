#!/bin/bash
set -e

# Log everything to file for debugging
exec > >(tee /var/log/user-data.log)
exec 2>&1

echo "====== EC2 User Data Script Started ======"
echo "Timestamp: $(date)"

# Update system packages
echo "Updating system packages..."
yum update -y

# Install Docker
echo "Installing Docker..."
yum install -y docker
systemctl start docker
systemctl enable docker
usermod -aG docker ec2-user

echo "Docker installed successfully"
docker --version

# Install Docker Compose
echo "Installing Docker Compose..."
curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
chmod +x /usr/local/bin/docker-compose
docker-compose --version

# Install AWS CLI v2
echo "Installing AWS CLI v2..."
curl "https://awscli.amazonaws.com/awscli-exe-linux-x86_64.zip" -o "awscliv2.zip"
unzip -q awscliv2.zip
./aws/install
rm -rf awscliv2.zip aws

echo "AWS CLI installed successfully"
aws --version

# Install CodeDeploy agent
echo "Installing CodeDeploy agent..."
yum install -y ruby wget

cd /home/ec2-user
wget https://aws-codedeploy-us-east-1.s3.us-east-1.amazonaws.com/latest/install
chmod +x ./install
./install auto

# Start and enable CodeDeploy agent
systemctl start codedeploy-agent
systemctl enable codedeploy-agent

echo "CodeDeploy agent installed successfully"
systemctl status codedeploy-agent --no-pager

# Create application directory
echo "Creating application directory..."
mkdir -p /home/ec2-user/wellasset
chown -R ec2-user:ec2-user /home/ec2-user/wellasset

# Install CloudWatch agent (optional but recommended)
echo "Installing CloudWatch agent..."
wget https://s3.amazonaws.com/amazoncloudwatch-agent/amazon_linux/amd64/latest/amazon-cloudwatch-agent.rpm
rpm -U ./amazon-cloudwatch-agent.rpm
rm -f ./amazon-cloudwatch-agent.rpm

# Configure CloudWatch agent for application logs
cat > /opt/aws/amazon-cloudwatch-agent/etc/amazon-cloudwatch-agent.json <<'CWEOF'
{
  "logs": {
    "logs_collected": {
      "files": {
        "collect_list": [
          {
            "file_path": "/var/log/user-data.log",
            "log_group_name": "/aws/ec2/wellasset",
            "log_stream_name": "{instance_id}/user-data"
          },
          {
            "file_path": "/var/log/aws/codedeploy-agent/codedeploy-agent.log",
            "log_group_name": "/aws/ec2/wellasset",
            "log_stream_name": "{instance_id}/codedeploy-agent"
          }
        ]
      }
    }
  }
}
CWEOF

# Start CloudWatch agent
/opt/aws/amazon-cloudwatch-agent/bin/amazon-cloudwatch-agent-ctl \
    -a fetch-config \
    -m ec2 \
    -s \
    -c file:/opt/aws/amazon-cloudwatch-agent/etc/amazon-cloudwatch-agent.json

# Configure Docker log rotation
cat > /etc/docker/daemon.json <<'DEOF'
{
  "log-driver": "json-file",
  "log-opts": {
    "max-size": "10m",
    "max-file": "3"
  }
}
DEOF

systemctl restart docker

# Set timezone (optional)
timedatectl set-timezone America/New_York

# Performance tuning for Node.js applications
echo "Configuring system for Node.js..."
cat >> /etc/sysctl.conf <<'SYSEOF'
# Increase max open files
fs.file-max = 65536

# Increase network buffer sizes
net.core.rmem_max = 16777216
net.core.wmem_max = 16777216
net.ipv4.tcp_rmem = 4096 87380 16777216
net.ipv4.tcp_wmem = 4096 65536 16777216
SYSEOF

sysctl -p

# Increase ulimit for ec2-user
cat >> /home/ec2-user/.bashrc <<'BASHEOF'
ulimit -n 65536
BASHEOF

echo "====== EC2 User Data Script Completed Successfully ======"
echo "Timestamp: $(date)"
echo "Instance is ready for CodeDeploy deployments"
