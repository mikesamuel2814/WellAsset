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
sudo systemctl stop wellasset || true

# Create backup of current version
if [ -d "$APP_DIR" ] && [ "$(ls -A $APP_DIR)" ]; then
    BACKUP_FILE="$BACKUP_DIR/wellasset-$(date +%Y%m%d-%H%M%S).tar.gz"
    echo "Creating backup: $BACKUP_FILE"
    sudo tar -czf "$BACKUP_FILE" -C "$APP_DIR" . || true
    
    # Keep only last 5 backups
    sudo find "$BACKUP_DIR" -name "wellasset-*.tar.gz" -type f | sort -r | tail -n +6 | xargs -r sudo rm -f
fi

# Extract new version
echo "Extracting new version..."
sudo mkdir -p "$APP_DIR"
cd "$APP_DIR"

# Preserve start.sh if it exists (it's not in the deployment package)
if [ -f "$APP_DIR/start.sh" ]; then
    sudo cp "$APP_DIR/start.sh" /tmp/start.sh.backup
fi

sudo tar -xzf /tmp/wellasset-deploy.tar.gz --overwrite

# Restore start.sh if it was backed up
if [ -f "/tmp/start.sh.backup" ]; then
    sudo mv /tmp/start.sh.backup "$APP_DIR/start.sh"
    sudo chmod +x "$APP_DIR/start.sh"
fi

# Set correct permissions
sudo chown -R $DEPLOY_USER:$DEPLOY_USER "$APP_DIR"

# Copy and enable systemd service file
echo "Updating systemd service..."
sudo cp "$APP_DIR/wellasset.service" /etc/systemd/system/wellasset.service
sudo systemctl daemon-reload

# Install dependencies as nodejs user (including devDependencies for migrations)
echo "Installing dependencies..."
sudo -u $DEPLOY_USER bash -c "cd $APP_DIR && npm ci"

# Run database migrations as nodejs user (with environment variables loaded)
echo "Running database migrations..."
sudo -u $DEPLOY_USER bash -c "set -a && source $APP_DIR/.env.production && set +a && cd $APP_DIR && npm run db:push"

# Remove devDependencies after migrations
echo "Removing devDependencies..."
sudo -u $DEPLOY_USER bash -c "cd $APP_DIR && npm prune --production"

# Verify .env.production file exists
if [ ! -f "$APP_DIR/.env.production" ]; then
    echo "ERROR: .env.production file not found!"
    echo "Please create .env.production on the server with required environment variables:"
    echo "  - DATABASE_URL"
    echo "  - SESSION_SECRET"
    echo "  - PGHOST, PGPORT, PGUSER, PGPASSWORD, PGDATABASE"
    exit 1
fi

echo "✓ .env.production file found"

# Start the application
echo "Starting application..."
sudo systemctl start wellasset

# Wait for application to be healthy
echo "Waiting for application to start..."
sleep 10

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
    echo "Checking logs..."
    sudo journalctl -u wellasset -n 50 --no-pager || true
    
    echo "Rolling back to previous version..."
    
    # Rollback
    LATEST_BACKUP=$(sudo find "$BACKUP_DIR" -name "wellasset-*.tar.gz" -type f | sort -r | head -1)
    if [ -n "$LATEST_BACKUP" ]; then
        echo "Restoring from: $LATEST_BACKUP"
        cd "$APP_DIR"
        sudo tar -xzf "$LATEST_BACKUP"
        sudo chown -R $DEPLOY_USER:$DEPLOY_USER "$APP_DIR"
        sudo systemctl start wellasset
    fi
    
    exit 1
fi

# Cleanup
rm -f /tmp/wellasset-deploy.tar.gz

echo "====== Deployment Complete ======"
echo "Timestamp: $(date)"
echo "Application URL: http://$(curl -s http://169.254.169.254/latest/meta-data/public-ipv4)"
