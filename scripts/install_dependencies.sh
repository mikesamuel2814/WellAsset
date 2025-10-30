#!/bin/bash
set -e

echo "===== Installing Dependencies ====="

# Navigate to application directory
cd /home/ec2-user/wellasset

# Get AWS account ID and region for ECR
AWS_ACCOUNT_ID=$(aws sts get-caller-identity --query Account --output text)
AWS_REGION=$(aws configure get region || echo "us-east-1")
ECR_REGISTRY="${AWS_ACCOUNT_ID}.dkr.ecr.${AWS_REGION}.amazonaws.com"

# Read image tag from deployment file
if [ -f IMAGE_TAG ]; then
    IMAGE_TAG=$(cat IMAGE_TAG)
    echo "Using image tag from deployment: ${IMAGE_TAG}"
else
    IMAGE_TAG="latest"
    echo "No IMAGE_TAG file found, using: latest"
fi

IMAGE_URI="${ECR_REGISTRY}/wellasset-realestate:${IMAGE_TAG}"

echo "Pulling Docker image: ${IMAGE_URI}"

# Login to ECR
aws ecr get-login-password --region ${AWS_REGION} | docker login --username AWS --password-stdin ${ECR_REGISTRY}

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
