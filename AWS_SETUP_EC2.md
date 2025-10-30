# AWS EC2 Setup Guide

Complete guide for setting up AWS EC2 infrastructure with Auto Scaling and CodeDeploy for the Well Asset Real Estate Platform.

## Table of Contents
- [Architecture Overview](#architecture-overview)
- [Prerequisites](#prerequisites)
- [Step-by-Step Setup](#step-by-step-setup)
- [Cost Optimization](#cost-optimization)
- [Troubleshooting](#troubleshooting)

## Architecture Overview

```
┌─────────────────────────────────────────────────────┐
│                    Internet                          │
└───────────────────┬─────────────────────────────────┘
                    │
        ┌───────────▼──────────────┐
        │   Route 53 (DNS)         │
        │   Optional CloudFront    │
        └───────────┬──────────────┘
                    │
        ┌───────────▼──────────────┐
        │ Application Load Balancer│
        │      (Public Subnet)      │
        └───────────┬──────────────┘
                    │
    ┌───────────────┴────────────────┐
    │                                 │
┌───▼────────┐                  ┌────▼───────┐
│  EC2       │                  │  EC2       │
│  Instance  │                  │  Instance  │
│  (Docker)  │                  │  (Docker)  │
│  AZ-1a     │                  │  AZ-1b     │
└────┬───────┘                  └───┬────────┘
     │      (Private Subnet)        │
     │     Auto Scaling Group        │
     └───────────┬──────────────────┘
                 │
     ┌───────────▼──────────────┐
     │  RDS PostgreSQL          │
     │  (Private Subnet)        │
     │  Multi-AZ for HA         │
     └──────────────────────────┘
         
         CodeDeploy ←→ S3
              │
         GitHub Actions
```

## Prerequisites

### AWS Account Setup
1. AWS Account with billing enabled
2. IAM user with administrator access
3. AWS CLI installed and configured
4. SSH key pair for EC2 instances

### Tools Required
```bash
# Install AWS CLI
curl "https://awscli.amazonaws.com/awscli-exe-linux-x86_64.zip" -o "awscliv2.zip"
unzip awscliv2.zip
sudo ./aws/install

# Configure AWS CLI
aws configure
# Enter: Access Key ID, Secret Access Key, Region (us-east-1), Output format (json)

# Verify configuration
aws sts get-caller-identity
```

## Step-by-Step Setup

### 1. Create VPC and Networking

```bash
# Set your variables
export VPC_CIDR="10.0.0.0/16"
export PROJECT_NAME="wellasset"

# Create VPC
VPC_ID=$(aws ec2 create-vpc \
  --cidr-block $VPC_CIDR \
  --tag-specifications "ResourceType=vpc,Tags=[{Key=Name,Value=${PROJECT_NAME}-vpc}]" \
  --query 'Vpc.VpcId' --output text)

echo "VPC created: $VPC_ID"

# Enable DNS hostnames
aws ec2 modify-vpc-attribute --vpc-id $VPC_ID --enable-dns-hostnames

# Create Internet Gateway
IGW_ID=$(aws ec2 create-internet-gateway \
  --tag-specifications "ResourceType=internet-gateway,Tags=[{Key=Name,Value=${PROJECT_NAME}-igw}]" \
  --query 'InternetGateway.InternetGatewayId' --output text)

# Attach Internet Gateway to VPC
aws ec2 attach-internet-gateway --vpc-id $VPC_ID --internet-gateway-id $IGW_ID

# Create Public Subnets (for ALB)
PUBLIC_SUBNET_1=$(aws ec2 create-subnet \
  --vpc-id $VPC_ID \
  --cidr-block 10.0.1.0/24 \
  --availability-zone us-east-1a \
  --tag-specifications "ResourceType=subnet,Tags=[{Key=Name,Value=${PROJECT_NAME}-public-1a}]" \
  --query 'Subnet.SubnetId' --output text)

PUBLIC_SUBNET_2=$(aws ec2 create-subnet \
  --vpc-id $VPC_ID \
  --cidr-block 10.0.2.0/24 \
  --availability-zone us-east-1b \
  --tag-specifications "ResourceType=subnet,Tags=[{Key=Name,Value=${PROJECT_NAME}-public-1b}]" \
  --query 'Subnet.SubnetId' --output text)

# Enable auto-assign public IP for public subnets
aws ec2 modify-subnet-attribute --subnet-id $PUBLIC_SUBNET_1 --map-public-ip-on-launch
aws ec2 modify-subnet-attribute --subnet-id $PUBLIC_SUBNET_2 --map-public-ip-on-launch

# Create Private Subnets (for EC2 and RDS)
PRIVATE_SUBNET_1=$(aws ec2 create-subnet \
  --vpc-id $VPC_ID \
  --cidr-block 10.0.11.0/24 \
  --availability-zone us-east-1a \
  --tag-specifications "ResourceType=subnet,Tags=[{Key=Name,Value=${PROJECT_NAME}-private-1a}]" \
  --query 'Subnet.SubnetId' --output text)

PRIVATE_SUBNET_2=$(aws ec2 create-subnet \
  --vpc-id $VPC_ID \
  --cidr-block 10.0.12.0/24 \
  --availability-zone us-east-1b \
  --tag-specifications "ResourceType=subnet,Tags=[{Key=Name,Value=${PROJECT_NAME}-private-1b}]" \
  --query 'Subnet.SubnetId' --output text)

# Create NAT Gateway for private subnet internet access
ELASTIC_IP=$(aws ec2 allocate-address --domain vpc --query 'AllocationId' --output text)

NAT_GATEWAY=$(aws ec2 create-nat-gateway \
  --subnet-id $PUBLIC_SUBNET_1 \
  --allocation-id $ELASTIC_IP \
  --tag-specifications "ResourceType=natgateway,Tags=[{Key=Name,Value=${PROJECT_NAME}-nat}]" \
  --query 'NatGateway.NatGatewayId' --output text)

echo "Waiting for NAT Gateway to be available..."
aws ec2 wait nat-gateway-available --nat-gateway-ids $NAT_GATEWAY

# Create Route Tables
PUBLIC_RT=$(aws ec2 create-route-table \
  --vpc-id $VPC_ID \
  --tag-specifications "ResourceType=route-table,Tags=[{Key=Name,Value=${PROJECT_NAME}-public-rt}]" \
  --query 'RouteTable.RouteTableId' --output text)

PRIVATE_RT=$(aws ec2 create-route-table \
  --vpc-id $VPC_ID \
  --tag-specifications "ResourceType=route-table,Tags=[{Key=Name,Value=${PROJECT_NAME}-private-rt}]" \
  --query 'RouteTable.RouteTableId' --output text)

# Add routes
aws ec2 create-route --route-table-id $PUBLIC_RT --destination-cidr-block 0.0.0.0/0 --gateway-id $IGW_ID
aws ec2 create-route --route-table-id $PRIVATE_RT --destination-cidr-block 0.0.0.0/0 --nat-gateway-id $NAT_GATEWAY

# Associate subnets with route tables
aws ec2 associate-route-table --subnet-id $PUBLIC_SUBNET_1 --route-table-id $PUBLIC_RT
aws ec2 associate-route-table --subnet-id $PUBLIC_SUBNET_2 --route-table-id $PUBLIC_RT
aws ec2 associate-route-table --subnet-id $PRIVATE_SUBNET_1 --route-table-id $PRIVATE_RT
aws ec2 associate-route-table --subnet-id $PRIVATE_SUBNET_2 --route-table-id $PRIVATE_RT

echo "VPC setup complete!"
```

### 2. Set Up RDS PostgreSQL

```bash
# Create DB Subnet Group
aws rds create-db-subnet-group \
  --db-subnet-group-name ${PROJECT_NAME}-db-subnet-group \
  --db-subnet-group-description "Subnet group for Well Asset DB" \
  --subnet-ids $PRIVATE_SUBNET_1 $PRIVATE_SUBNET_2

# Create Security Group for RDS
RDS_SG=$(aws ec2 create-security-group \
  --group-name ${PROJECT_NAME}-rds-sg \
  --description "Security group for RDS PostgreSQL" \
  --vpc-id $VPC_ID \
  --query 'GroupId' --output text)

# Create RDS Instance
aws rds create-db-instance \
  --db-instance-identifier ${PROJECT_NAME}-db \
  --db-instance-class db.t3.micro \
  --engine postgres \
  --engine-version 16.1 \
  --master-username postgres \
  --master-user-password "CHANGE_THIS_PASSWORD" \
  --allocated-storage 20 \
  --vpc-security-group-ids $RDS_SG \
  --db-subnet-group-name ${PROJECT_NAME}-db-subnet-group \
  --backup-retention-period 7 \
  --preferred-backup-window "03:00-04:00" \
  --preferred-maintenance-window "mon:04:00-mon:05:00" \
  --storage-encrypted \
  --publicly-accessible false

echo "Waiting for RDS instance to be available (5-10 minutes)..."
aws rds wait db-instance-available --db-instance-identifier ${PROJECT_NAME}-db

# Get RDS endpoint
RDS_ENDPOINT=$(aws rds describe-db-instances \
  --db-instance-identifier ${PROJECT_NAME}-db \
  --query 'DBInstances[0].Endpoint.Address' \
  --output text)

echo "RDS endpoint: $RDS_ENDPOINT"
```

### 3. Create ECR Repository

```bash
# Create ECR repository
aws ecr create-repository \
  --repository-name wellasset-realestate \
  --image-scanning-configuration scanOnPush=true \
  --encryption-configuration encryptionType=AES256

ECR_URI=$(aws ecr describe-repositories \
  --repository-names wellasset-realestate \
  --query 'repositories[0].repositoryUri' \
  --output text)

echo "ECR Repository: $ECR_URI"
```

### 4. Create IAM Roles

#### EC2 Instance Role
```bash
# Create trust policy
cat > ec2-trust-policy.json <<EOF
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Principal": {
        "Service": "ec2.amazonaws.com"
      },
      "Action": "sts:AssumeRole"
    }
  ]
}
EOF

# Create role
aws iam create-role \
  --role-name ${PROJECT_NAME}-ec2-role \
  --assume-role-policy-document file://ec2-trust-policy.json

# Create instance profile
aws iam create-instance-profile \
  --instance-profile-name ${PROJECT_NAME}-ec2-profile

# Attach role to instance profile
aws iam add-role-to-instance-profile \
  --instance-profile-name ${PROJECT_NAME}-ec2-profile \
  --role-name ${PROJECT_NAME}-ec2-role

# Create EC2 permissions policy
cat > ec2-permissions.json <<EOF
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "ecr:GetAuthorizationToken",
        "ecr:BatchCheckLayerAvailability",
        "ecr:GetDownloadUrlForLayer",
        "ecr:BatchGetImage"
      ],
      "Resource": "*"
    },
    {
      "Effect": "Allow",
      "Action": [
        "secretsmanager:GetSecretValue"
      ],
      "Resource": "arn:aws:secretsmanager:*:*:secret:wellasset/*"
    },
    {
      "Effect": "Allow",
      "Action": [
        "s3:Get*",
        "s3:List*"
      ],
      "Resource": [
        "arn:aws:s3:::${PROJECT_NAME}-codedeploy-artifacts/*"
      ]
    },
    {
      "Effect": "Allow",
      "Action": [
        "logs:CreateLogGroup",
        "logs:CreateLogStream",
        "logs:PutLogEvents",
        "logs:DescribeLogStreams"
      ],
      "Resource": "arn:aws:logs:*:*:*"
    }
  ]
}
EOF

# Attach policies
aws iam put-role-policy \
  --role-name ${PROJECT_NAME}-ec2-role \
  --policy-name ${PROJECT_NAME}-ec2-permissions \
  --policy-document file://ec2-permissions.json

# Attach managed policies for SSM (optional, for easier debugging)
aws iam attach-role-policy \
  --role-name ${PROJECT_NAME}-ec2-role \
  --policy-arn arn:aws:iam::aws:policy/AmazonSSMManagedInstanceCore
```

#### CodeDeploy Service Role
```bash
# Create trust policy
cat > codedeploy-trust-policy.json <<EOF
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "",
      "Effect": "Allow",
      "Principal": {
        "Service": "codedeploy.amazonaws.com"
      },
      "Action": "sts:AssumeRole"
    }
  ]
}
EOF

# Create role
aws iam create-role \
  --role-name ${PROJECT_NAME}-codedeploy-role \
  --assume-role-policy-document file://codedeploy-trust-policy.json

# Attach AWS managed policy
aws iam attach-role-policy \
  --role-name ${PROJECT_NAME}-codedeploy-role \
  --policy-arn arn:aws:iam::aws:policy/AWSCodeDeployRole
```

### 5. Create Security Groups

```bash
# Security group for ALB
ALB_SG=$(aws ec2 create-security-group \
  --group-name ${PROJECT_NAME}-alb-sg \
  --description "Security group for ALB" \
  --vpc-id $VPC_ID \
  --query 'GroupId' --output text)

# Allow HTTP and HTTPS
aws ec2 authorize-security-group-ingress \
  --group-id $ALB_SG \
  --protocol tcp --port 80 --cidr 0.0.0.0/0

aws ec2 authorize-security-group-ingress \
  --group-id $ALB_SG \
  --protocol tcp --port 443 --cidr 0.0.0.0/0

# Security group for EC2 instances
EC2_SG=$(aws ec2 create-security-group \
  --group-name ${PROJECT_NAME}-ec2-sg \
  --description "Security group for EC2 instances" \
  --vpc-id $VPC_ID \
  --query 'GroupId' --output text)

# Allow traffic from ALB to EC2 on port 5000
aws ec2 authorize-security-group-ingress \
  --group-id $EC2_SG \
  --protocol tcp --port 5000 --source-group $ALB_SG

# Allow SSH from your IP (optional, for debugging)
# MY_IP=$(curl -s ifconfig.me)
# aws ec2 authorize-security-group-ingress \
#   --group-id $EC2_SG \
#   --protocol tcp --port 22 --cidr ${MY_IP}/32

# Allow EC2 to access RDS
aws ec2 authorize-security-group-ingress \
  --group-id $RDS_SG \
  --protocol tcp --port 5432 --source-group $EC2_SG
```

### 6. Create User Data Script

```bash
cat > user-data.sh <<'EOF'
#!/bin/bash
set -e

# Log everything
exec > >(tee /var/log/user-data.log)
exec 2>&1

echo "Starting user data script..."

# Update system
yum update -y

# Install Docker
yum install -y docker
systemctl start docker
systemctl enable docker
usermod -aG docker ec2-user

# Install Docker Compose
curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
chmod +x /usr/local/bin/docker-compose

# Install AWS CLI v2
curl "https://awscli.amazonaws.com/awscli-exe-linux-x86_64.zip" -o "awscliv2.zip"
unzip awscliv2.zip
./aws/install
rm -rf awscliv2.zip aws

# Install CodeDeploy agent
yum install -y ruby wget
cd /home/ec2-user
wget https://aws-codedeploy-us-east-1.s3.us-east-1.amazonaws.com/latest/install
chmod +x ./install
./install auto
systemctl start codedeploy-agent
systemctl enable codedeploy-agent

# Create application directory
mkdir -p /home/ec2-user/wellasset
chown -R ec2-user:ec2-user /home/ec2-user/wellasset

echo "User data script complete!"
EOF
```

### 7. Create Launch Template

```bash
# First, get the latest Amazon Linux 2023 AMI
AMI_ID=$(aws ec2 describe-images \
  --owners amazon \
  --filters "Name=name,Values=al2023-ami-2023.*-x86_64" \
  --query 'Images | sort_by(@, &CreationDate) | [-1].ImageId' \
  --output text)

# Base64 encode user data
USER_DATA_BASE64=$(base64 -w 0 user-data.sh)

# Create launch template
aws ec2 create-launch-template \
  --launch-template-name ${PROJECT_NAME}-template \
  --version-description "Initial version" \
  --launch-template-data "{
    \"ImageId\": \"$AMI_ID\",
    \"InstanceType\": \"t3.micro\",
    \"IamInstanceProfile\": {
      \"Name\": \"${PROJECT_NAME}-ec2-profile\"
    },
    \"SecurityGroupIds\": [\"$EC2_SG\"],
    \"UserData\": \"$USER_DATA_BASE64\",
    \"TagSpecifications\": [{
      \"ResourceType\": \"instance\",
      \"Tags\": [{\"Key\": \"Name\", \"Value\": \"${PROJECT_NAME}-instance\"}]
    }],
    \"Monitoring\": {
      \"Enabled\": true
    }
  }"
```

### 8. Create Application Load Balancer

```bash
# Create ALB
ALB_ARN=$(aws elbv2 create-load-balancer \
  --name ${PROJECT_NAME}-alb \
  --subnets $PUBLIC_SUBNET_1 $PUBLIC_SUBNET_2 \
  --security-groups $ALB_SG \
  --scheme internet-facing \
  --type application \
  --query 'LoadBalancers[0].LoadBalancerArn' \
  --output text)

# Get ALB DNS name
ALB_DNS=$(aws elbv2 describe-load-balancers \
  --load-balancer-arns $ALB_ARN \
  --query 'LoadBalancers[0].DNSName' \
  --output text)

echo "ALB DNS: $ALB_DNS"

# Create target group
TG_ARN=$(aws elbv2 create-target-group \
  --name ${PROJECT_NAME}-tg \
  --protocol HTTP \
  --port 5000 \
  --vpc-id $VPC_ID \
  --target-type instance \
  --health-check-path /health \
  --health-check-interval-seconds 30 \
  --health-check-timeout-seconds 5 \
  --healthy-threshold-count 2 \
  --unhealthy-threshold-count 3 \
  --query 'TargetGroups[0].TargetGroupArn' \
  --output text)

# Create listener
aws elbv2 create-listener \
  --load-balancer-arn $ALB_ARN \
  --protocol HTTP \
  --port 80 \
  --default-actions Type=forward,TargetGroupArn=$TG_ARN
```

### 9. Create Auto Scaling Group

```bash
aws autoscaling create-auto-scaling-group \
  --auto-scaling-group-name ${PROJECT_NAME}-asg \
  --launch-template "LaunchTemplateName=${PROJECT_NAME}-template,Version=\$Latest" \
  --min-size 2 \
  --max-size 6 \
  --desired-capacity 2 \
  --target-group-arns $TG_ARN \
  --vpc-zone-identifier "$PRIVATE_SUBNET_1,$PRIVATE_SUBNET_2" \
  --health-check-type ELB \
  --health-check-grace-period 300 \
  --tags "Key=Name,Value=${PROJECT_NAME}-asg-instance,PropagateAtLaunch=true"

# Set up auto-scaling policies
aws autoscaling put-scaling-policy \
  --auto-scaling-group-name ${PROJECT_NAME}-asg \
  --policy-name cpu-scale-up \
  --policy-type TargetTrackingScaling \
  --target-tracking-configuration "{
    \"PredefinedMetricSpecification\": {
      \"PredefinedMetricType\": \"ASGAverageCPUUtilization\"
    },
    \"TargetValue\": 70.0
  }"
```

### 10. Create S3 Bucket for CodeDeploy

```bash
aws s3 mb s3://${PROJECT_NAME}-codedeploy-artifacts

# Enable versioning
aws s3api put-bucket-versioning \
  --bucket ${PROJECT_NAME}-codedeploy-artifacts \
  --versioning-configuration Status=Enabled

# Add lifecycle policy to clean up old deployments
cat > lifecycle-policy.json <<EOF
{
  "Rules": [
    {
      "Id": "DeleteOldDeployments",
      "Status": "Enabled",
      "ExpirationInDays": 30,
      "NoncurrentVersionExpirationInDays": 7
    }
  ]
}
EOF

aws s3api put-bucket-lifecycle-configuration \
  --bucket ${PROJECT_NAME}-codedeploy-artifacts \
  --lifecycle-configuration file://lifecycle-policy.json
```

### 11. Create CodeDeploy Application and Deployment Group

```bash
# Create CodeDeploy application
aws deploy create-application \
  --application-name ${PROJECT_NAME}-app \
  --compute-platform Server

# Get CodeDeploy service role ARN
CODEDEPLOY_ROLE_ARN=$(aws iam get-role \
  --role-name ${PROJECT_NAME}-codedeploy-role \
  --query 'Role.Arn' --output text)

# Create deployment group
aws deploy create-deployment-group \
  --application-name ${PROJECT_NAME}-app \
  --deployment-group-name ${PROJECT_NAME}-deployment-group \
  --service-role-arn $CODEDEPLOY_ROLE_ARN \
  --deployment-config-name CodeDeployDefault.AllAtOnce \
  --auto-scaling-groups ${PROJECT_NAME}-asg \
  --load-balancer-info "targetGroupInfoList=[{name=${PROJECT_NAME}-tg}]" \
  --deployment-style "deploymentType=IN_PLACE,deploymentOption=WITH_TRAFFIC_CONTROL"
```

### 12. Store Secrets in AWS Secrets Manager

```bash
# Store database URL
aws secretsmanager create-secret \
  --name wellasset/database-url \
  --description "Database connection string" \
  --secret-string "postgresql://postgres:CHANGE_PASSWORD@$RDS_ENDPOINT:5432/wellasset"

# Store session secret
SESSION_SECRET=$(openssl rand -base64 32)
aws secretsmanager create-secret \
  --name wellasset/session-secret \
  --description "Session secret for JWT" \
  --secret-string "$SESSION_SECRET"
```

## Verify Setup

```bash
# Check Auto Scaling Group
aws autoscaling describe-auto-scaling-groups \
  --auto-scaling-group-names ${PROJECT_NAME}-asg

# Check Target Group health
aws elbv2 describe-target-health \
  --target-group-arn $TG_ARN

# Check CodeDeploy Agent on instances (after they launch)
# Use Systems Manager Session Manager to connect to instances
aws ssm start-session --target <instance-id>
# Then run: systemctl status codedeploy-agent
```

## Cost Optimization

### Monthly Cost Estimate

| Service | Configuration | Est. Cost |
|---------|--------------|-----------|
| EC2 (2× t3.micro) | Reserved, 24/7 | $12 |
| NAT Gateway | Standard | $32 |
| RDS (db.t3.micro) | Single-AZ | $15 |
| ALB | Standard | $20 |
| Data Transfer | 100GB | $10 |
| S3 Storage | < 10GB | $1 |
| **Total** | | **~$90/month** |

### Savings Tips

1. **Use Reserved Instances** - Save up to 40% on EC2/RDS
2. **Stop non-prod environments** - Use Lambda to start/stop on schedule
3. **Use t3.nano for staging** - Smaller instances for testing
4. **Enable S3 lifecycle policies** - Auto-delete old deployments
5. **Consider Savings Plans** - Commit to 1-3 years for best rates

## Troubleshooting

### EC2 Instances Not Healthy

```bash
# Check instance status
aws autoscaling describe-auto-scaling-instances

# Check target health
aws elbv2 describe-target-health --target-group-arn $TG_ARN

# Connect to instance via SSM
aws ssm start-session --target <instance-id>

# Check Docker container
docker ps
docker logs wellasset-app

# Check CodeDeploy agent
systemctl status codedeploy-agent
cat /var/log/aws/codedeploy-agent/codedeploy-agent.log
```

### Deployment Failures

```bash
# Check deployment status
aws deploy get-deployment --deployment-id <deployment-id>

# List recent deployments
aws deploy list-deployments \
  --application-name ${PROJECT_NAME}-app \
  --max-results 5

# Get deployment logs
aws deploy get-deployment-instance \
  --deployment-id <deployment-id> \
  --instance-id <instance-id>

# Check logs on EC2 instance
# /opt/codedeploy-agent/deployment-root/<deployment-id>/logs/scripts.log
```

### Database Connection Issues

```bash
# Test from EC2 instance
psql -h $RDS_ENDPOINT -U postgres -d wellasset

# Check security group rules
aws ec2 describe-security-groups --group-ids $RDS_SG

# Verify RDS endpoint
aws rds describe-db-instances \
  --db-instance-identifier ${PROJECT_NAME}-db \
  --query 'DBInstances[0].Endpoint'
```

## Next Steps

1. Configure custom domain with Route 53
2. Set up SSL certificate with ACM
3. Update ALB listener to use HTTPS
4. Configure CloudWatch alarms
5. Set up automated backups
6. Configure log aggregation
7. Set up monitoring dashboards
8. Create disaster recovery plan

## Cleanup (Development/Testing)

To avoid charges, delete resources in this order:

```bash
# Delete Auto Scaling Group
aws autoscaling delete-auto-scaling-group \
  --auto-scaling-group-name ${PROJECT_NAME}-asg \
  --force-delete

# Delete Launch Template
aws ec2 delete-launch-template \
  --launch-template-name ${PROJECT_NAME}-template

# Delete Load Balancer
aws elbv2 delete-load-balancer --load-balancer-arn $ALB_ARN
aws elbv2 delete-target-group --target-group-arn $TG_ARN

# Delete CodeDeploy
aws deploy delete-deployment-group \
  --application-name ${PROJECT_NAME}-app \
  --deployment-group-name ${PROJECT_NAME}-deployment-group
aws deploy delete-application --application-name ${PROJECT_NAME}-app

# Delete RDS
aws rds delete-db-instance \
  --db-instance-identifier ${PROJECT_NAME}-db \
  --skip-final-snapshot

# Delete S3 bucket
aws s3 rb s3://${PROJECT_NAME}-codedeploy-artifacts --force

# Delete NAT Gateway
aws ec2 delete-nat-gateway --nat-gateway-id $NAT_GATEWAY
aws ec2 release-address --allocation-id $ELASTIC_IP

# Delete VPC and all associated resources (wait for NAT Gateway deletion first)
aws ec2 delete-vpc --vpc-id $VPC_ID
```
