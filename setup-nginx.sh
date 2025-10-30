#!/bin/bash
set -e

# Well Asset Real Estate Platform - Nginx Setup Script
# This script installs and configures Nginx with SSL for wellassetcompany.com

echo "====== Installing Nginx ======"

# Install Nginx
sudo apt-get update
sudo apt-get install -y nginx certbot python3-certbot-nginx

echo "====== Configuring Nginx ======"

# Copy nginx configuration
sudo cp /var/www/wellasset/nginx.conf /etc/nginx/sites-available/wellasset

# Create symbolic link to enable the site
sudo ln -sf /etc/nginx/sites-available/wellasset /etc/nginx/sites-enabled/wellasset

# Remove default site if it exists
sudo rm -f /etc/nginx/sites-enabled/default

# Test nginx configuration
sudo nginx -t

# Restart nginx
sudo systemctl restart nginx
sudo systemctl enable nginx

echo "====== Setting up SSL with Let's Encrypt ======"

# Obtain SSL certificate
# Note: This requires the domain to be pointing to this server
sudo certbot --nginx -d wellassetcompany.com -d www.wellassetcompany.com --non-interactive --agree-tos --email admin@wellassetcompany.com --redirect

# Setup automatic renewal
sudo systemctl enable certbot.timer
sudo systemctl start certbot.timer

echo "====== Nginx Setup Complete ======"
echo "Your site should now be accessible at:"
echo "  https://wellassetcompany.com"
echo "  https://www.wellassetcompany.com"
