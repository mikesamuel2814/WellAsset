# Deployment Guide - Well Asset Real Estate Platform

This guide covers deploying the Well Asset Real Estate platform to AWS using GitHub Actions for CI/CD.

## Table of Contents
- [Prerequisites](#prerequisites)
- [Deployment Options](#deployment-options)
- [Quick Start](#quick-start)
- [GitHub Actions CI/CD](#github-actions-cicd)
- [Local Testing](#local-testing)
- [Troubleshooting](#troubleshooting)

## Prerequisites

### Required Tools
- Node.js 20.x or higher
- Docker (for containerized deployment)
- AWS CLI configured with appropriate credentials
- GitHub account with repository access

### AWS Services Required
- **Amazon EC2** - Virtual servers running Docker containers
- **Auto Scaling Group** - Automatic scaling based on demand
- **AWS CodeDeploy** - Automated deployment service
- **Amazon ECR (Elastic Container Registry)** - Docker image storage
- **Amazon RDS for PostgreSQL** - Database
- **Application Load Balancer (ALB)** - Load balancing and health checks
- **AWS Secrets Manager** - Secure credential storage
- **Amazon S3** - Deployment artifact storage
- **Amazon CloudWatch** - Logging and monitoring

## Deployment Options

### Option 1: AWS EC2 with Auto Scaling (Current Implementation)
Docker-based deployment on EC2 instances with Auto Scaling and CodeDeploy for zero-downtime updates.

**Pros:**
- Cost-effective (~$90/month)
- Full control over instances
- Auto-scaling based on demand
- Zero-downtime deployments with CodeDeploy
- Flexible configuration

**Cons:**
- Requires initial infrastructure setup
- More operational overhead than serverless

**Current Status:** ✅ Fully configured with GitHub Actions

### Option 2: AWS ECS Fargate
Serverless container deployment (alternative approach).

**Pros:**
- No server management
- Automatic scaling
- Pay only for resources used

**Cons:**
- Higher cost (~$100-150/month)
- Less control over infrastructure

### Option 3: AWS Elastic Beanstalk
Easiest AWS deployment option with automatic environment setup.

**Pros:**
- Simple setup
- Automatic environment management
- Built-in monitoring

**Cons:**
- Less control
- Higher abstraction
- Limited customization

## Quick Start

### 1. Set Up AWS Infrastructure

See [AWS_SETUP_EC2.md](./AWS_SETUP_EC2.md) for detailed EC2 infrastructure setup instructions.

**Quick summary:**
- VPC with public and private subnets
- Auto Scaling Group with 2+ EC2 instances
- Application Load Balancer
- RDS PostgreSQL database
- CodeDeploy for deployments
- ECR for Docker images

### 2. Configure Environment Variables

See [ENVIRONMENT.md](./ENVIRONMENT.md) for all required environment variables.

### 3. Configure GitHub Secrets

Add the following secrets to your GitHub repository:

1. Go to: `Repository Settings → Secrets and variables → Actions`
2. Add these secrets:

```
AWS_ACCESS_KEY_ID          # Your AWS access key
AWS_SECRET_ACCESS_KEY      # Your AWS secret key
DATABASE_URL               # PostgreSQL connection string
SESSION_SECRET             # Random string for session encryption
```

### 4. Deploy

Push to the `main` branch to trigger automatic deployment:

```bash
git add .
git commit -m "Deploy to production"
git push origin main
```

Monitor the deployment in the GitHub Actions tab.

## GitHub Actions CI/CD

### Workflow Files

Two workflows are configured:

#### 1. CI Workflow (`.github/workflows/ci.yml`)
Runs on every push and pull request:
- Installs dependencies
- Runs database migrations in test environment
- Builds the application
- Runs tests (if available)
- Uploads build artifacts

#### 2. Deployment Workflow (`.github/workflows/deploy-aws.yml`)
Runs on push to `main` or manual trigger:
- Builds Docker image
- Pushes to Amazon ECR
- Runs database migrations on production
- Creates deployment package (appspec.yml + scripts)
- Uploads package to S3
- Triggers CodeDeploy deployment
- Waits for deployment completion
- Verifies all instances are healthy

### Manual Deployment

Trigger deployment manually for specific environments:

1. Go to: `Actions → Deploy to AWS → Run workflow`
2. Select environment: `staging` or `production`
3. Click "Run workflow"

## Local Testing

### Using Docker Compose

Test the production Docker setup locally:

```bash
# Build and start services
docker-compose up --build

# Access the application at http://localhost:5000
```

### Environment Setup

Create a `.env` file:

```bash
cp .env.example .env
# Edit .env with your local configuration
```

### Build Production Locally

```bash
# Install dependencies
npm ci

# Build the application
npm run build

# Run database migrations
npm run db:push

# Start in production mode
npm start
```

## Health Checks

The application includes a health check endpoint:

```bash
curl http://localhost:5000/health
# Response: {"status":"ok","timestamp":"2025-10-30T12:00:00.000Z"}
```

Docker health check runs every 30 seconds.

## Database Migrations

### Development
```bash
npm run db:push
```

### Production (via CI/CD)
Migrations run automatically during deployment before the new version is deployed.

### Manual Migration
```bash
# Set production DATABASE_URL
export DATABASE_URL="postgresql://user:pass@host:5432/db"

# Run migration
npm run db:push
```

## Monitoring

### CloudWatch Logs
- EC2 instance logs: `/aws/ec2/wellasset`
- Application logs (Docker): View via `docker logs wellasset-app`
- CodeDeploy logs: `/var/log/aws/codedeploy-agent/`
- User data logs: `/var/log/user-data.log`

### Health Monitoring
- ALB Target Group health checks on `/health` endpoint
- Auto Scaling Group instance health
- CodeDeploy deployment status
- CloudWatch alarms for CPU, memory, failed health checks

## Rollback

### Via AWS Console (CodeDeploy)
1. Go to CodeDeploy Console
2. Select your deployment group
3. Create new deployment with previous revision from S3
4. Monitor deployment progress

### Via GitHub Actions
1. Revert the commit that caused issues
2. Push to trigger new deployment
3. Or manually trigger workflow with specific branch

### Via Auto Scaling Group
1. Go to EC2 Auto Scaling Console
2. Terminate unhealthy instances
3. Auto Scaling will launch new instances
4. CodeDeploy will deploy latest successful revision

## Security Best Practices

1. **Never commit secrets** - Use GitHub Secrets and AWS Secrets Manager
2. **Use HTTPS** - Configure ALB with ACM certificate
3. **Database Security** - RDS in private subnet, security groups configured
4. **Container Security** - Non-root user, minimal image, regular updates
5. **IAM Roles** - Use least privilege principle

## Performance Optimization

1. **Enable CloudFront** - For static asset caching
2. **Database Connection Pooling** - Configure in production
3. **Container Resources** - Optimize CPU/Memory allocation
4. **Auto Scaling** - Configure ECS auto scaling policies

## Cost Optimization

1. **Use Fargate Spot** - For non-critical workloads (30-50% savings)
2. **Reserved Instances** - For RDS if running 24/7
3. **CloudWatch Log Retention** - Set appropriate retention periods
4. **Unused Resources** - Clean up development environments

## Support

For deployment issues:
1. Check CloudWatch logs
2. Review GitHub Actions workflow logs
3. Verify all secrets are configured
4. Check AWS service quotas

## Next Steps

1. [Set up AWS EC2 infrastructure](./AWS_SETUP_EC2.md)
2. [Configure environment variables](./ENVIRONMENT.md)
3. [Set up GitHub Actions](./CICD_SETUP.md)
4. Review security settings
5. Set up monitoring alerts
6. Configure auto-scaling policies
7. Set up custom domain and SSL
