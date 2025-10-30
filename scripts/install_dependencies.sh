#!/bin/bash
set -e

echo "===== Installing Dependencies ====="

# Get the deployment bundle directory (current directory when script runs)
DEPLOYMENT_DIR="$(pwd)"
echo "Deployment bundle directory: $DEPLOYMENT_DIR"

# Read image tag from deployment bundle
if [ -f "$DEPLOYMENT_DIR/IMAGE_TAG" ]; then
    IMAGE_TAG=$(cat "$DEPLOYMENT_DIR/IMAGE_TAG")
    echo "Using image tag from deployment: ${IMAGE_TAG}"
else
    IMAGE_TAG="latest"
    echo "No IMAGE_TAG file found, using: latest"
fi

# Ensure application directory exists
APP_DIR="/home/ec2-user/wellasset"
mkdir -p "$APP_DIR"

# Copy IMAGE_TAG to application directory for reference
cp "$DEPLOYMENT_DIR/IMAGE_TAG" "$APP_DIR/IMAGE_TAG" 2>/dev/null || echo "$IMAGE_TAG" > "$APP_DIR/IMAGE_TAG"

cd "$APP_DIR"

# Get AWS region from multiple sources with fallback
AWS_REGION="${AWS_REGION:-$(aws configure get region 2>/dev/null || true)}"
if [ -z "$AWS_REGION" ]; then
    # Try to get from EC2 metadata
    AWS_REGION=$(curl -s http://169.254.169.254/latest/meta-data/placement/region || echo "us-east-1")
fi
echo "Using AWS region: $AWS_REGION"

# Get AWS account ID
AWS_ACCOUNT_ID=$(aws sts get-caller-identity --query Account --output text --region "$AWS_REGION")
ECR_REGISTRY="${AWS_ACCOUNT_ID}.dkr.ecr.${AWS_REGION}.amazonaws.com"
IMAGE_URI="${ECR_REGISTRY}/wellasset-realestate:${IMAGE_TAG}"

echo "Pulling Docker image: ${IMAGE_URI}"

# Login to ECR with explicit region
aws ecr get-login-password --region "${AWS_REGION}" | docker login --username AWS --password-stdin "${ECR_REGISTRY}"

# Pull the latest Docker image
docker pull ${IMAGE_URI}

# Tag as latest for easier reference
docker tag ${IMAGE_URI} wellasset-app:latest

echo "Docker image pulled successfully"

# Create .env file from AWS Secrets Manager
echo "Fetching secrets from AWS Secrets Manager..."

DATABASE_URL=$(aws secretsmanager get-secret-value --secret-id wellasset/database-url --query SecretString --output text 2>/dev/null || echo "")
SESSION_SECRET=$(aws secretsmanager get-secret-value --secret-id wellasset/session-secret --query SecretString --output text 2>/dev/null || echo "")

if [ -z "$DATABASE_URL" ] || [ -z "$SESSION_SECRET" ]; then
    echo "Warning: Some secrets not found in Secrets Manager"
fi

# Create .env file
cat > .env << EOF
NODE_ENV=production
PORT=5000
DATABASE_URL=${DATABASE_URL}
SESSION_SECRET=${SESSION_SECRET}
EOF

chmod 600 .env

echo "Environment file created"
echo "Dependencies installation complete"
