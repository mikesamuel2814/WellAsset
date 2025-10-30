#!/bin/bash
set -e

# Deployment script for Well Asset Real Estate Platform
# This script is executed on the EC2 instance via SSH from GitHub Actions

echo "====== Starting Deployment ======"
echo "Timestamp: $(date)"

# Configuration
APP_DIR="/var/www/wellasset"
DEPLOY_USER="nodejs"
BACKUP_DIR="/var/backups/wellasset"

# Create backup directory if it doesn't exist
sudo mkdir -p "$BACKUP_DIR"

# Stop the application
echo "Stopping application..."
sudo systemctl stop wellasset || pm2 stop wellasset-app || true

# Create backup of current version
if [ -d "$APP_DIR" ]; then
    BACKUP_FILE="$BACKUP_DIR/wellasset-$(date +%Y%m%d-%H%M%S).tar.gz"
    echo "Creating backup: $BACKUP_FILE"
    sudo tar -czf "$BACKUP_FILE" -C "$APP_DIR" . || true
    
    # Keep only last 5 backups
    ls -t "$BACKUP_DIR"/wellasset-*.tar.gz | tail -n +6 | xargs rm -f || true
fi

# Extract new version
echo "Extracting new version..."
cd "$APP_DIR"
tar -xzf /tmp/wellasset-deploy.tar.gz

# Set correct permissions
sudo chown -R $DEPLOY_USER:$DEPLOY_USER "$APP_DIR"

# Install dependencies
echo "Installing dependencies..."
npm ci --production

# Run database migrations
echo "Running database migrations..."
npm run db:push

# Build frontend (if not built in CI)
if [ ! -d "dist" ]; then
    echo "Building frontend..."
    npm run build
fi

# Start the application
echo "Starting application..."
sudo systemctl start wellasset

# Wait for application to be healthy
echo "Waiting for application to start..."
sleep 5

# Health check
MAX_ATTEMPTS=30
ATTEMPT=0
while [ $ATTEMPT -lt $MAX_ATTEMPTS ]; do
    if curl -f http://localhost:5000/health > /dev/null 2>&1; then
        echo "✓ Application is healthy!"
        break
    fi
    ATTEMPT=$((ATTEMPT + 1))
    echo "Waiting for health check... ($ATTEMPT/$MAX_ATTEMPTS)"
    sleep 2
done

if [ $ATTEMPT -eq $MAX_ATTEMPTS ]; then
    echo "ERROR: Application failed to start"
    echo "Rolling back to previous version..."
    
    # Rollback
    LATEST_BACKUP=$(ls -t "$BACKUP_DIR"/wellasset-*.tar.gz | head -1)
    if [ -n "$LATEST_BACKUP" ]; then
        cd "$APP_DIR"
        tar -xzf "$LATEST_BACKUP"
        sudo systemctl start wellasset
    fi
    
    exit 1
fi

# Cleanup
rm -f /tmp/wellasset-deploy.tar.gz

echo "====== Deployment Complete ======"
echo "Timestamp: $(date)"
echo "Application URL: http://$(curl -s http://169.254.169.254/latest/meta-data/public-ipv4)"
