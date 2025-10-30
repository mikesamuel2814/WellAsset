#!/bin/bash
set -e

echo "Setting up Well Asset server on Ubuntu..."

# Update system
sudo apt update -y
sudo apt upgrade -y

# Install Node.js 20
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs

# Verify Node.js installation
node --version
npm --version

# Install PM2 globally
sudo npm install -g pm2

# Install Nginx
sudo apt install -y nginx

# Install Git
sudo apt install -y git

# Install PostgreSQL 16
sudo apt install -y wget ca-certificates
wget --quiet -O - https://www.postgresql.org/media/keys/ACCC4CF8.asc | sudo apt-key add -
echo "deb http://apt.postgresql.org/pub/repos/apt $(lsb_release -cs)-pgdg main" | sudo tee /etc/apt/sources.list.d/pgdg.list
sudo apt update
sudo apt install -y postgresql-16 postgresql-contrib-16

# PostgreSQL is automatically started and enabled on Ubuntu
sudo systemctl status postgresql --no-pager

# Create application user
sudo useradd -m -s /bin/bash nodejs || echo "User nodejs already exists"

# Create application directory
sudo mkdir -p /var/www/wellasset
sudo chown nodejs:nodejs /var/www/wellasset

# Create log directory
sudo mkdir -p /var/log/wellasset
sudo chown nodejs:nodejs /var/log/wellasset

# Create backup directory
sudo mkdir -p /var/backups/wellasset
sudo chown nodejs:nodejs /var/backups/wellasset

echo ""
echo "✅ Basic setup complete!"
echo ""
echo "Next steps:"
echo "1. Configure PostgreSQL (run the commands below)"
echo "2. Set up environment variables"
echo "3. Configure Nginx"
