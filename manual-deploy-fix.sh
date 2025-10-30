#!/bin/bash

# Manual deployment fix script
# This uploads the corrected server/index.ts to EC2 and rebuilds

EC2_HOST="ec2-54-254-253-106.ap-southeast-1.compute.amazonaws.com"
KEY_FILE="api-server-key.pem"

echo "Uploading corrected server/index.ts to EC2..."
scp -i "$KEY_FILE" server/index.ts ubuntu@$EC2_HOST:/tmp/

echo "Rebuilding application on EC2..."
ssh -i "$KEY_FILE" ubuntu@$EC2_HOST << 'EOF'
  # Copy the corrected file
  sudo -u nodejs cp /tmp/index.ts /var/www/wellasset/server/index.ts
  
  # Rebuild just the server
  cd /var/www/wellasset
  sudo -u nodejs npx esbuild server/index.ts \
    --platform=node \
    --packages=external \
    --bundle \
    --format=esm \
    --outdir=dist
  
  # Restart PM2
  sudo -u nodejs /home/nodejs/node_modules/.bin/pm2 kill
  sudo -u nodejs bash -c "cd /var/www/wellasset && source .env.production && /home/nodejs/node_modules/.bin/pm2 start ecosystem.config.cjs --env production"
  
  # Wait and test
  sleep 5
  curl http://localhost:5000/health
  
  echo ""
  echo "Deployment complete!"
EOF
