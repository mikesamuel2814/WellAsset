#!/bin/bash
# Script to fix PM2 EACCES issues on EC2
# Run this on the EC2 instance as ubuntu user

echo "Fixing PM2 permissions for nodejs user..."

# Stop any existing PM2 instances
sudo -u nodejs pm2 kill 2>/dev/null || true

# Remove old PM2 directory
sudo rm -rf /home/nodejs/.pm2

# Fix home directory permissions
sudo chown -R nodejs:nodejs /home/nodejs
sudo chmod 755 /home/nodejs

# Create .pm2 directory with correct permissions
sudo -u nodejs mkdir -p /home/nodejs/.pm2
sudo -u nodejs chmod 755 /home/nodejs/.pm2

# Install PM2 locally for the nodejs user instead of globally
echo "Installing PM2 locally for nodejs user..."
sudo -u nodejs bash -c "cd /home/nodejs && npm install pm2@latest"

# Update the PATH for nodejs user to use local PM2
echo 'export PATH="/home/nodejs/node_modules/.bin:$PATH"' | sudo tee -a /home/nodejs/.bashrc

# Update systemd service to use local PM2
echo "Updating systemd service..."
sudo tee /etc/systemd/system/wellasset.service > /dev/null << 'EOF'
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
Environment=PATH=/home/nodejs/node_modules/.bin:/usr/bin:/bin

# Load environment variables from file
EnvironmentFile=/var/www/wellasset/.env.production

# PM2 commands using local installation
ExecStart=/home/nodejs/node_modules/.bin/pm2 start ecosystem.config.cjs --env production
ExecStop=/home/nodejs/node_modules/.bin/pm2 stop ecosystem.config.cjs
ExecReload=/home/nodejs/node_modules/.bin/pm2 reload ecosystem.config.cjs

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
EOF

# Reload systemd
sudo systemctl daemon-reload

echo ""
echo "✅ PM2 permissions fixed!"
echo ""
echo "Next steps:"
echo "1. Deploy your application files to /var/www/wellasset"
echo "2. Run: sudo systemctl start wellasset"
echo "3. Check status: sudo systemctl status wellasset"
