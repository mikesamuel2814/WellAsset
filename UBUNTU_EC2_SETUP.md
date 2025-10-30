# Ubuntu EC2 Setup Guide

Quick setup guide for deploying Well Asset Real Estate Platform on Ubuntu 24.04 EC2.

## Step 1: Run Setup Script

SSH into your EC2 instance:
```bash
ssh -i "api-server-key.pem" ubuntu@ec2-54-254-253-106.ap-southeast-1.compute.amazonaws.com
```

Download and run the setup script:
```bash
# Download the setup script
wget https://raw.githubusercontent.com/YOUR_REPO/main/setup-ubuntu.sh
chmod +x setup-ubuntu.sh

# Or copy the script content directly:
nano setup-ubuntu.sh
# Paste the content, save (Ctrl+O, Enter, Ctrl+X)
chmod +x setup-ubuntu.sh

# Run the setup
./setup-ubuntu.sh
```

## Step 2: Configure PostgreSQL

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
# Edit pg_hba.conf (Ubuntu location)
sudo nano /etc/postgresql/16/main/pg_hba.conf
```

Add these lines **before** the other rules:

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

## Step 3: Configure Environment Variables

Create environment file:

```bash
sudo nano /var/www/wellasset/.env.production
```

Add (replace YOUR_PASSWORD with the one you set in Step 2):

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

## Step 4: Configure Nginx

Create Nginx configuration:

```bash
sudo nano /etc/nginx/sites-available/wellasset
```

Paste the content from `nginx.conf` (from your repository), then:

```bash
# Update the domain in the config
sudo nano /etc/nginx/sites-available/wellasset
# Replace 'your-domain.com' with your actual domain

# Enable the site
sudo ln -s /etc/nginx/sites-available/wellasset /etc/nginx/sites-enabled/

# Remove default site
sudo rm /etc/nginx/sites-enabled/default

# Test configuration
sudo nginx -t

# Start Nginx
sudo systemctl start nginx
sudo systemctl enable nginx
```

## Step 5: Setup SSL Certificate

Install Certbot:

```bash
sudo apt install -y certbot python3-certbot-nginx
```

Get SSL certificate:

```bash
sudo certbot --nginx -d your-domain.com -d www.your-domain.com
```

Auto-renewal (already configured):

```bash
# Test renewal
sudo certbot renew --dry-run
```

## Step 6: Setup Systemd Service

Create service file:

```bash
sudo nano /etc/systemd/system/wellasset.service
```

Paste this content:

```ini
[Unit]
Description=Well Asset Real Estate Platform
Documentation=https://github.com/yourusername/wellasset
After=network.target postgresql.service

[Service]
Type=forking
User=nodejs
WorkingDirectory=/var/www/wellasset
Environment=NODE_ENV=production
Environment=PORT=5000

# Load environment variables from file
EnvironmentFile=/var/www/wellasset/.env.production

# PM2 commands
ExecStart=/usr/bin/pm2 start ecosystem.config.cjs --env production
ExecStop=/usr/bin/pm2 stop ecosystem.config.cjs
ExecReload=/usr/bin/pm2 reload ecosystem.config.cjs

# Restart policy
Restart=on-failure
RestartSec=10s

# Resource limits
LimitNOFILE=65536
LimitNPROC=65536

# Security
NoNewPrivileges=true
PrivateTmp=true

[Install]
WantedBy=multi-user.target
```

Enable the service:

```bash
sudo systemctl daemon-reload
sudo systemctl enable wellasset
```

## Step 7: Configure GitHub Actions

### Add GitHub Secrets

Go to your GitHub repository: `Settings → Secrets and variables → Actions`

Add these secrets:

| Secret Name | Value |
|-------------|-------|
| `EC2_HOST` | `ec2-54-254-253-106.ap-southeast-1.compute.amazonaws.com` |
| `EC2_USER` | `ubuntu` |
| `EC2_SSH_KEY` | Contents of `api-server-key.pem` |
| `DATABASE_URL` | `postgresql://wellasset_user:PASSWORD@localhost:5432/wellasset` |

### Allow SSH Access for Deployment

```bash
# On your EC2 instance
sudo mkdir -p /home/nodejs/.ssh
sudo cp ~/.ssh/authorized_keys /home/nodejs/.ssh/
sudo chown -R nodejs:nodejs /home/nodejs/.ssh
sudo chmod 700 /home/nodejs/.ssh
sudo chmod 600 /home/nodejs/.ssh/authorized_keys

# Give nodejs user sudo for systemctl
echo "nodejs ALL=(ALL) NOPASSWD: /bin/systemctl start wellasset, /bin/systemctl stop wellasset, /bin/systemctl restart wellasset, /bin/systemctl status wellasset" | sudo tee /etc/sudoers.d/nodejs
sudo chmod 440 /etc/sudoers.d/nodejs
```

## Step 8: Initial Deployment

### Manual First Deployment

On your local machine, create the deployment package and upload:

```bash
# Build the application
npm install
npm run build

# Create deployment package
tar -czf wellasset-deploy.tar.gz \
  client server shared migrations dist \
  package.json package-lock.json \
  ecosystem.config.cjs deploy.sh

# Upload to EC2
scp -i "api-server-key.pem" wellasset-deploy.tar.gz ubuntu@ec2-54-254-253-106.ap-southeast-1.compute.amazonaws.com:/tmp/
```

On EC2, deploy:

```bash
# SSH into EC2
ssh -i "api-server-key.pem" ubuntu@ec2-54-254-253-106.ap-southeast-1.compute.amazonaws.com

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

## Step 9: Setup Database Backups

Create backup script:

```bash
sudo nano /usr/local/bin/backup-wellasset-db.sh
```

Add:

```bash
#!/bin/bash
BACKUP_DIR="/var/backups/wellasset/db"
mkdir -p $BACKUP_DIR

# Backup database (using local PostgreSQL)
sudo -u postgres pg_dump wellasset | gzip > $BACKUP_DIR/wellasset-$(date +%Y%m%d-%H%M%S).sql.gz

# Keep only last 7 days
find $BACKUP_DIR -name "wellasset-*.sql.gz" -mtime +7 -delete
```

Make executable and schedule:

```bash
sudo chmod +x /usr/local/bin/backup-wellasset-db.sh

# Add to crontab (daily at 2 AM)
echo "0 2 * * * /usr/local/bin/backup-wellasset-db.sh" | sudo crontab -
```

## Troubleshooting

### Check Application Status

```bash
# Application status
sudo systemctl status wellasset

# PM2 status
sudo -u nodejs pm2 status

# View logs
sudo -u nodejs pm2 logs wellasset-app

# Nginx logs
sudo tail -f /var/log/nginx/access.log
sudo tail -f /var/log/nginx/error.log
```

### Database Issues

```bash
# Test connection
psql -U wellasset_user -d wellasset -h localhost

# Check PostgreSQL status
sudo systemctl status postgresql

# PostgreSQL logs (Ubuntu location)
sudo tail -f /var/log/postgresql/postgresql-16-main.log
```

### Restart Services

```bash
# Restart application
sudo systemctl restart wellasset

# Restart Nginx
sudo systemctl restart nginx

# Restart PostgreSQL
sudo systemctl restart postgresql
```

## Key Differences from Amazon Linux

| Aspect | Amazon Linux | Ubuntu |
|--------|--------------|--------|
| Package Manager | `yum`/`dnf` | `apt` |
| PostgreSQL Config | `/var/lib/pgsql/16/data/` | `/etc/postgresql/16/main/` |
| PostgreSQL Logs | `/var/lib/pgsql/16/data/log/` | `/var/log/postgresql/` |
| Setup Command | `postgresql-setup --initdb` | Auto-initialized |
| Service User | `ec2-user` | `ubuntu` |

## Summary

Your EC2 instance is now set up with:
- ✅ Node.js 20
- ✅ PostgreSQL 16
- ✅ PM2 process manager
- ✅ Nginx reverse proxy
- ✅ SSL certificate
- ✅ Automated deployments
- ✅ Database backups

**Monthly Cost:** ~$15

**Next:** Push to GitHub `main` branch to deploy! 🚀
