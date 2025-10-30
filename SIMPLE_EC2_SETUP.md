# Simple EC2 Setup Guide

Complete guide for deploying the Well Asset Real Estate Platform to a single AWS EC2 instance with PostgreSQL, Node.js, and Nginx.

## Overview

**What you'll set up:**
- 1 EC2 instance (t3.small) running Node.js, PostgreSQL, and PM2
- Nginx as reverse proxy
- SSL certificate with Let's Encrypt
- Automated deployment via GitHub Actions

**Estimated monthly cost:** ~$15/month
- EC2 t3.small: ~$15/month (includes PostgreSQL on the same instance)

## Prerequisites

- AWS account
- Domain name (for SSL certificate)
- GitHub repository

## Step 1: Launch EC2 Instance

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

## Step 2: Setup EC2 Instance

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

# Install PostgreSQL 16
sudo dnf install -y postgresql16 postgresql16-server postgresql16-contrib

# Initialize PostgreSQL
sudo postgresql-setup --initdb

# Start and enable PostgreSQL
sudo systemctl start postgresql
sudo systemctl enable postgresql

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

## Step 3: Configure PostgreSQL

After the basic setup, configure PostgreSQL:

```bash
# Switch to postgres user
sudo -i -u postgres

# Create database and user
psql << EOF
CREATE DATABASE wellasset;
CREATE USER wellasset_user WITH ENCRYPTED PASSWORD 'CHANGE_THIS_PASSWORD';
GRANT ALL PRIVILEGES ON DATABASE wellasset TO wellasset_user;
\c wellasset
GRANT ALL ON SCHEMA public TO wellasset_user;
ALTER DATABASE wellasset OWNER TO wellasset_user;
EOF

# Exit postgres user
exit
```

Configure PostgreSQL to allow local connections:

```bash
# Edit pg_hba.conf
sudo nano /var/lib/pgsql/16/data/pg_hba.conf
```

Add this line before the other rules:

```
# Allow wellasset_user to connect locally
local   wellasset       wellasset_user                          md5
host    wellasset       wellasset_user  127.0.0.1/32            md5
```

Restart PostgreSQL:

```bash
sudo systemctl restart postgresql
```

Test the connection:

```bash
# Test with the new user
psql -U wellasset_user -d wellasset -h localhost
# Enter password when prompted
# If successful, you'll see the PostgreSQL prompt
\q  # to quit
```

## Step 4: Configure Environment Variables

Create environment file:

```bash
sudo nano /var/www/wellasset/.env.production
```

Add (replace YOUR_PASSWORD with the one you set in Step 3):

```env
NODE_ENV=production
PORT=5000
DATABASE_URL=postgresql://wellasset_user:YOUR_PASSWORD@localhost:5432/wellasset
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

## Step 5: Configure Nginx

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

## Step 6: Setup SSL Certificate

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

## Step 7: Setup Systemd Service

```bash
# Copy service file
sudo cp wellasset.service /etc/systemd/system/

# Reload systemd
sudo systemctl daemon-reload

# Enable service
sudo systemctl enable wellasset

# The service will be started by the deployment script
```

## Step 8: Configure GitHub Actions

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

## Step 9: Initial Deployment

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

## Step 10: Domain Configuration

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

# Backup database (using local PostgreSQL)
sudo -u postgres pg_dump wellasset | gzip > $BACKUP_DIR/wellasset-$(date +%Y%m%d-%H%M%S).sql.gz

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
# Test connection
psql -U wellasset_user -d wellasset -h localhost

# Check if PostgreSQL is running
sudo systemctl status postgresql

# Check PostgreSQL logs
sudo tail -f /var/lib/pgsql/16/data/log/postgresql-*.log
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
4. **Increase storage if needed**: Add EBS volume for database growth

## Next Steps

1. ✅ EC2 instance running
2. ✅ PostgreSQL installed and configured
3. ✅ Nginx with SSL
4. ✅ GitHub Actions deployment
5. ⬜ Configure CloudWatch monitoring
6. ⬜ Set up automated backups to S3
7. ⬜ Configure custom domain
8. ⬜ Add monitoring/alerting

## Benefits of This Setup

**Pros:**
- Very cost-effective (~$15/month)
- Simple architecture - everything on one instance
- Easy to understand and maintain
- Perfect for small to medium traffic sites
- No network latency between app and database

**Cons:**
- Single point of failure (can be mitigated with EBS snapshots)
- Manual database management (backups, updates)
- Scaling requires vertical scaling (larger instance)
- No automatic failover

**When to upgrade:**
- Traffic exceeds 1000+ concurrent users
- Need high availability (99.9%+ uptime)
- Database size exceeds 100GB
- Require read replicas or multi-region
- → Then consider separating database to RDS

## Support

For issues:
1. Check application logs: `sudo -u nodejs pm2 logs`
2. Check system logs: `sudo journalctl -u wellasset`
3. Check Nginx logs: `sudo tail -f /var/log/nginx/wellasset_error.log`
4. Test database: `psql "$DATABASE_URL"`
