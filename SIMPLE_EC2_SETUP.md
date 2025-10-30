# Simple EC2 Setup Guide

Complete guide for deploying the Well Asset Real Estate Platform to a single AWS EC2 instance with PostgreSQL RDS and Nginx.

## Overview

**What you'll set up:**
- 1 EC2 instance (t3.small) running Node.js with PM2
- 1 RDS PostgreSQL database  
- Nginx as reverse proxy
- SSL certificate with Let's Encrypt
- Automated deployment via GitHub Actions

**Estimated monthly cost:** ~$25-30
- EC2 t3.small: ~$15/month
- RDS db.t3.micro PostgreSQL: ~$15/month

## Prerequisites

- AWS account
- Domain name (for SSL certificate)
- GitHub repository

## Step 1: Create RDS PostgreSQL Database

### Via AWS Console

1. Go to [AWS RDS Console](https://console.aws.amazon.com/rds/)
2. Click **Create database**
3. Choose:
   - **Engine**: PostgreSQL 16
   - **Template**: Free tier (or Production if needed)
   - **DB instance class**: db.t3.micro
   - **Storage**: 20 GB gp3
   - **DB instance identifier**: `wellasset-db`
   - **Master username**: `postgres`
   - **Master password**: Create a strong password
   - **Public access**: No (we'll connect from EC2 only)
4. Click **Create database**
5. Wait 5-10 minutes for database to be available
6. Note the **Endpoint** (e.g., `wellasset-db.abc123.us-east-1.rds.amazonaws.com`)

### Via AWS CLI

```bash
aws rds create-db-instance \
  --db-instance-identifier wellasset-db \
  --db-instance-class db.t3.micro \
  --engine postgres \
  --engine-version 16.1 \
  --master-username postgres \
  --master-user-password YOUR_STRONG_PASSWORD \
  --allocated-storage 20 \
  --backup-retention-period 7 \
  --storage-encrypted \
  --publicly-accessible false
```

## Step 2: Launch EC2 Instance

### Via AWS Console

1. Go to [AWS EC2 Console](https://console.aws.amazon.com/ec2/)
2. Click **Launch Instance**
3. Configure:
   - **Name**: `wellasset-server`
   - **AMI**: Amazon Linux 2023 (or Ubuntu 22.04)
   - **Instance type**: t3.small (2 vCPU, 2 GB RAM)
   - **Key pair**: Create new or select existing
   - **Network settings**: 
     - Allow HTTP (80)
     - Allow HTTPS (443)
     - Allow SSH (22) from your IP only
   - **Storage**: 20 GB gp3
4. Click **Launch instance**

### Get Instance IP

```bash
# Get public IP
aws ec2 describe-instances \
  --filters "Name=tag:Name,Values=wellasset-server" \
  --query 'Reservations[0].Instances[0].PublicIpAddress' \
  --output text
```

## Step 3: Configure Security Groups

Allow EC2 to connect to RDS:

```bash
# Get EC2 security group ID
EC2_SG=$(aws ec2 describe-instances \
  --filters "Name=tag:Name,Values=wellasset-server" \
  --query 'Reservations[0].Instances[0].SecurityGroups[0].GroupId' \
  --output text)

# Get RDS security group ID
RDS_SG=$(aws rds describe-db-instances \
  --db-instance-identifier wellasset-db \
  --query 'DBInstances[0].VpcSecurityGroups[0].VpcSecurityGroupId' \
  --output text)

# Allow EC2 to access RDS on port 5432
aws ec2 authorize-security-group-ingress \
  --group-id $RDS_SG \
  --protocol tcp \
  --port 5432 \
  --source-group $EC2_SG
```

## Step 4: Setup EC2 Instance

SSH into your EC2 instance:

```bash
ssh -i your-key.pem ec2-user@YOUR_EC2_IP
```

Run the setup script:

```bash
#!/bin/bash
set -e

echo "Setting up Well Asset server..."

# Update system
sudo yum update -y

# Install Node.js 20
curl -fsSL https://rpm.nodesource.com/setup_20.x | sudo bash -
sudo yum install -y nodejs

# Install PM2 globally
sudo npm install -g pm2

# Install Nginx
sudo yum install -y nginx

# Install Git
sudo yum install -y git

# Create application user
sudo useradd -m -s /bin/bash nodejs

# Create application directory
sudo mkdir -p /var/www/wellasset
sudo chown nodejs:nodejs /var/www/wellasset

# Create log directory
sudo mkdir -p /var/log/wellasset
sudo chown nodejs:nodejs /var/log/wellasset

# Create backup directory
sudo mkdir -p /var/backups/wellasset
sudo chown nodejs:nodejs /var/backups/wellasset

echo "Basic setup complete!"
```

## Step 5: Configure Environment Variables

Create environment file:

```bash
sudo nano /var/www/wellasset/.env.production
```

Add:

```env
NODE_ENV=production
PORT=5000
DATABASE_URL=postgresql://postgres:YOUR_PASSWORD@wellasset-db.abc123.us-east-1.rds.amazonaws.com:5432/wellasset
SESSION_SECRET=GENERATE_RANDOM_SECRET_HERE
```

Generate session secret:

```bash
openssl rand -base64 32
```

Set permissions:

```bash
sudo chown nodejs:nodejs /var/www/wellasset/.env.production
sudo chmod 600 /var/www/wellasset/.env.production
```

## Step 6: Configure Nginx

```bash
# Copy nginx config
sudo cp nginx.conf /etc/nginx/conf.d/wellasset.conf

# Edit with your domain
sudo nano /etc/nginx/conf.d/wellasset.conf
# Replace 'your-domain.com' with your actual domain

# Test configuration
sudo nginx -t

# Start Nginx
sudo systemctl start nginx
sudo systemctl enable nginx
```

## Step 7: Setup SSL Certificate

Install Certbot:

```bash
# Amazon Linux 2023
sudo dnf install -y certbot python3-certbot-nginx

# Ubuntu
# sudo apt install -y certbot python3-certbot-nginx
```

Get SSL certificate:

```bash
sudo certbot --nginx -d your-domain.com -d www.your-domain.com
```

Auto-renewal:

```bash
# Test renewal
sudo certbot renew --dry-run

# Certbot automatically sets up a cron job
```

## Step 8: Setup Systemd Service

```bash
# Copy service file
sudo cp wellasset.service /etc/systemd/system/

# Reload systemd
sudo systemctl daemon-reload

# Enable service
sudo systemctl enable wellasset

# The service will be started by the deployment script
```

## Step 9: Configure GitHub Actions

### Add GitHub Secrets

Go to your GitHub repository: `Settings → Secrets and variables → Actions`

Add these secrets:

| Secret Name | Value | Description |
|-------------|-------|-------------|
| `EC2_HOST` | Your EC2 public IP or domain | Server address |
| `EC2_USER` | `ec2-user` | SSH user |
| `EC2_SSH_KEY` | Your private SSH key | Copy from `.pem` file |
| `DATABASE_URL` | PostgreSQL connection string | For migrations in CI |

Example SSH key format:

```
-----BEGIN RSA PRIVATE KEY-----
MIIEpAIBAAKCAQEA...
...
-----END RSA PRIVATE KEY-----
```

### Allow SSH Access

```bash
# On your EC2 instance, ensure nodejs user can deploy
sudo mkdir -p /home/nodejs/.ssh
sudo cp ~/.ssh/authorized_keys /home/nodejs/.ssh/
sudo chown -R nodejs:nodejs /home/nodejs/.ssh
sudo chmod 700 /home/nodejs/.ssh
sudo chmod 600 /home/nodejs/.ssh/authorized_keys

# Give nodejs user sudo for systemctl
echo "nodejs ALL=(ALL) NOPASSWD: /bin/systemctl start wellasset, /bin/systemctl stop wellasset, /bin/systemctl restart wellasset, /bin/systemctl status wellasset" | sudo tee /etc/sudoers.d/nodejs
```

## Step 10: Initial Deployment

### Manual First Deployment

On your local machine:

```bash
# Build the application
npm install
npm run build

# Create deployment package
tar -czf wellasset-deploy.tar.gz \
  client server shared migrations dist \
  package.json package-lock.json \
  ecosystem.config.cjs

# Upload to EC2
scp -i your-key.pem wellasset-deploy.tar.gz ec2-user@YOUR_EC2_IP:/tmp/

# SSH and deploy
ssh -i your-key.pem ec2-user@YOUR_EC2_IP

# Extract and setup
cd /var/www/wellasset
sudo tar -xzf /tmp/wellasset-deploy.tar.gz
sudo chown -R nodejs:nodejs /var/www/wellasset

# Install dependencies
sudo -u nodejs npm ci --production

# Run migrations
sudo -u nodejs npm run db:push

# Start application
sudo systemctl start wellasset

# Check status
sudo systemctl status wellasset
curl http://localhost:5000/health
```

### Automatic Deployments

Now push to `main` branch will auto-deploy:

```bash
git add .
git commit -m "Deploy to EC2"
git push origin main
```

## Step 11: Domain Configuration

Point your domain to EC2:

```bash
# Get EC2 public IP
aws ec2 describe-instances \
  --filters "Name=tag:Name,Values=wellasset-server" \
  --query 'Reservations[0].Instances[0].PublicIpAddress'
```

In your DNS provider (Route 53, Cloudflare, etc.):

- Add **A record**: `your-domain.com` → EC2 IP
- Add **A record**: `www.your-domain.com` → EC2 IP

Or use AWS Route 53:

```bash
# Create hosted zone
aws route53 create-hosted-zone --name your-domain.com --caller-reference $(date +%s)

# Add A record (get zone ID first)
aws route53 change-resource-record-sets \
  --hosted-zone-id YOUR_ZONE_ID \
  --change-batch file://dns-change.json
```

## Monitoring & Maintenance

### Check Application Status

```bash
# Application status
sudo systemctl status wellasset

# PM2 status
sudo -u nodejs pm2 status

# View logs
sudo -u nodejs pm2 logs wellasset-app

# Nginx logs
sudo tail -f /var/log/nginx/wellasset_access.log
sudo tail -f /var/log/nginx/wellasset_error.log
```

### Database Backups

Setup automated backups:

```bash
# Create backup script
sudo nano /usr/local/bin/backup-wellasset-db.sh
```

```bash
#!/bin/bash
BACKUP_DIR="/var/backups/wellasset/db"
mkdir -p $BACKUP_DIR

# Backup database
pg_dump $DATABASE_URL | gzip > $BACKUP_DIR/wellasset-$(date +%Y%m%d-%H%M%S).sql.gz

# Keep only last 7 days
find $BACKUP_DIR -name "wellasset-*.sql.gz" -mtime +7 -delete
```

```bash
sudo chmod +x /usr/local/bin/backup-wellasset-db.sh

# Add to crontab (daily at 2 AM)
echo "0 2 * * * /usr/local/bin/backup-wellasset-db.sh" | sudo crontab -
```

### Update Application

```bash
# Just push to main branch - GitHub Actions will deploy
git push origin main

# Or manually:
ssh -i your-key.pem ec2-user@YOUR_EC2_IP
cd /var/www/wellasset
git pull
npm install
npm run build
sudo systemctl restart wellasset
```

## Troubleshooting

### Application won't start

```bash
# Check logs
sudo journalctl -u wellasset -n 50
sudo -u nodejs pm2 logs wellasset-app --lines 50

# Check if port is already in use
sudo netstat -tlnp | grep 5000

# Restart
sudo systemctl restart wellasset
```

### Database connection failed

```bash
# Test connection from EC2
psql "$DATABASE_URL"

# Check security group
aws ec2 describe-security-groups --group-ids $RDS_SG
```

### Nginx errors

```bash
# Test config
sudo nginx -t

# Check error log
sudo tail -f /var/log/nginx/error.log

# Restart Nginx
sudo systemctl restart nginx
```

## Cost Optimization

1. **Use Reserved Instances**: Save 30-40% by committing to 1 year
2. **Stop during off-hours**: Use Lambda to stop/start EC2 when not needed
3. **Monitor usage**: Set up CloudWatch billing alerts
4. **Optimize RDS**: Use db.t3.micro for low traffic

## Next Steps

1. ✅ EC2 instance running
2. ✅ RDS database configured
3. ✅ Nginx with SSL
4. ✅ GitHub Actions deployment
5. ⬜ Configure CloudWatch monitoring
6. ⬜ Set up automated backups to S3
7. ⬜ Configure custom domain
8. ⬜ Add monitoring/alerting

## Support

For issues:
1. Check application logs: `sudo -u nodejs pm2 logs`
2. Check system logs: `sudo journalctl -u wellasset`
3. Check Nginx logs: `sudo tail -f /var/log/nginx/wellasset_error.log`
4. Test database: `psql "$DATABASE_URL"`
