# Deployment Fix Guide

## Issues Identified

1. ✅ **GitHub Actions**: Missing `migrations` directory causing deployment to fail
2. 🔧 **EC2 PM2 Error**: `nodejs` user cannot spawn PM2 daemon (EACCES error)

## Fix Steps

### Step 1: Fix GitHub Actions (Already Done)

The workflow has been updated to handle missing migrations directory. Commit and push:

```bash
git add .
git commit -m "Fix deployment: handle missing migrations, add EC2 PM2 fix script"
git push origin main
```

### Step 2: Fix PM2 on EC2

SSH into your EC2 instance and run the fix script:

```bash
# SSH into EC2
ssh -i "api-server-key.pem" ubuntu@ec2-54-254-253-106.ap-southeast-1.compute.amazonaws.com

# Download and run the fix script
cat > fix-ec2-pm2.sh << 'EOF'
#!/bin/bash
# Script to fix PM2 EACCES issues on EC2

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

# Install PM2 locally for the nodejs user
echo "Installing PM2 locally for nodejs user..."
sudo -u nodejs bash -c "cd /home/nodejs && npm install pm2@latest"

# Update systemd service to use local PM2
echo "Updating systemd service..."
sudo tee /etc/systemd/system/wellasset.service > /dev/null << 'EOFSERVICE'
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
EOFSERVICE

# Reload systemd
sudo systemctl daemon-reload

echo ""
echo "✅ PM2 permissions fixed!"
echo ""
echo "Next steps:"
echo "1. Deploy your application via GitHub Actions"
echo "2. Or manually start with: sudo systemctl start wellasset"
EOF

chmod +x fix-ec2-pm2.sh
./fix-ec2-pm2.sh
```

### Step 3: Deploy via GitHub Actions

Once the PM2 fix is applied, push your code to trigger deployment:

```bash
git push origin main
```

The GitHub Actions workflow will:
1. ✅ Build the application
2. ✅ Create deployment package
3. ✅ Upload to EC2
4. ✅ Run deployment script
5. ✅ Start application with PM2
6. ✅ Verify health check

### Step 4: Verify Deployment

After deployment completes, verify:

```bash
# Check application status
sudo systemctl status wellasset

# Check PM2 processes
sudo -u nodejs /home/nodejs/node_modules/.bin/pm2 status

# Test health endpoint
curl http://localhost:5000/health

# Check Nginx
curl http://ec2-54-254-253-106.ap-southeast-1.compute.amazonaws.com
```

## Why This Happened

### PM2 EACCES Error
The global PM2 installation couldn't create the daemon process for the `nodejs` user due to permission restrictions. The solution is to:
- Install PM2 locally in the `nodejs` user's home directory
- Update the systemd service to use the local PM2 binary
- Ensure proper PATH configuration

### Missing Migrations Directory
The Drizzle ORM setup doesn't require a migrations directory since we use `db:push` for schema changes. The workflow now handles this gracefully.

## Alternative: Direct Node.js Without PM2

If PM2 continues to cause issues, you can run the app directly with Node.js:

```bash
# Update systemd service
sudo tee /etc/systemd/system/wellasset.service > /dev/null << 'EOF'
[Unit]
Description=Well Asset Real Estate Platform
After=network.target postgresql.service

[Service]
Type=simple
User=nodejs
WorkingDirectory=/var/www/wellasset
Environment=NODE_ENV=production
Environment=PORT=5000
EnvironmentFile=/var/www/wellasset/.env.production

# Run with tsx (TypeScript execution)
ExecStart=/usr/bin/npx tsx server/index.ts

Restart=always
RestartSec=10s

StandardOutput=append:/var/log/wellasset/out.log
StandardError=append:/var/log/wellasset/error.log

LimitNOFILE=65536
NoNewPrivileges=true
PrivateTmp=true

[Install]
WantedBy=multi-user.target
EOF

sudo systemctl daemon-reload
sudo systemctl start wellasset
```

## Summary

✅ Fixed GitHub Actions workflow to handle missing migrations  
🔧 Created fix script for PM2 permissions on EC2  
📝 Updated systemd service to use local PM2 installation  
🚀 Ready to deploy via `git push origin main`
