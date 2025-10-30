# CI/CD Setup Guide

Quick start guide for setting up CI/CD pipeline with GitHub Actions for the Well Asset Real Estate Platform.

## Overview

This project uses GitHub Actions for automated testing, building, and deployment to AWS.

## What's Included

### Workflow Files

1. **`.github/workflows/ci.yml`** - Continuous Integration
   - Runs on: Every push and pull request
   - Actions:
     - Sets up Node.js 20
     - Installs dependencies
     - Runs database migrations (test DB)
     - Builds application
     - Runs linting
     - Uploads build artifacts

2. **`.github/workflows/deploy-aws.yml`** - AWS Deployment
   - Runs on: Push to `main` or manual trigger
   - Actions:
     - Builds Docker image
     - Pushes to Amazon ECR
     - Runs database migrations (production)
     - Deploys to Amazon ECS
     - Verifies deployment

## Quick Setup Steps

### 1. Prerequisites

- GitHub repository connected to Replit ✅ (You mentioned this is done)
- AWS account with appropriate permissions
- Domain name (optional, for production)

### 2. Configure GitHub Repository Secrets

Go to your GitHub repository:
`Settings → Secrets and variables → Actions → New repository secret`

Add the following secrets:

| Secret Name | Description | Example |
|-------------|-------------|---------|
| `AWS_ACCESS_KEY_ID` | AWS IAM access key | `AKIAIOSFODNN7EXAMPLE` |
| `AWS_SECRET_ACCESS_KEY` | AWS IAM secret key | `wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY` |
| `DATABASE_URL` | Production PostgreSQL URL | `postgresql://user:pass@host:5432/db` |
| `SESSION_SECRET` | Random secret for sessions | Generate with `openssl rand -base64 32` |

### 3. AWS Infrastructure Setup

You have two options:

#### Option A: Manual Setup (Recommended for learning)
Follow the detailed guide in [AWS_SETUP.md](./AWS_SETUP.md)

#### Option B: Quick Setup with AWS Console
1. Create RDS PostgreSQL instance
2. Create ECS Cluster (Fargate)
3. Create ECR repository
4. Create Application Load Balancer
5. Configure security groups
6. Create ECS service

**Estimated time:** 1-2 hours

### 4. Update Workflow Configuration

Edit `.github/workflows/deploy-aws.yml` and update:

```yaml
env:
  AWS_REGION: us-east-1           # Your AWS region
  ECR_REPOSITORY: wellasset-realestate  # Your ECR repo name
  ECS_SERVICE: wellasset-service  # Your ECS service name
  ECS_CLUSTER: wellasset-cluster  # Your ECS cluster name
  ECS_TASK_DEFINITION: wellasset-task   # Your task definition name
```

### 5. Test the CI Pipeline

Push any change to test the CI workflow:

```bash
git add .
git commit -m "Test CI pipeline"
git push origin develop  # Or any branch
```

Go to: `GitHub → Actions` tab to watch the workflow run.

### 6. Deploy to Production

#### Automatic Deployment
Push to the `main` branch:

```bash
git checkout main
git merge develop
git push origin main
```

#### Manual Deployment
1. Go to: `GitHub → Actions`
2. Select: `Deploy to AWS`
3. Click: `Run workflow`
4. Choose environment: `production` or `staging`
5. Click: `Run workflow`

### 7. Monitor Deployment

1. **GitHub Actions**:
   - Go to `Actions` tab
   - Click on the running workflow
   - Watch each step execute

2. **AWS Console**:
   - Go to ECS Console
   - Select your cluster
   - Monitor service events

3. **CloudWatch Logs**:
   - Go to CloudWatch
   - Navigate to `/aws/ecs/wellasset-service`
   - View application logs

## Workflow Diagram

```
┌─────────────────────────────────────────────────────────┐
│  Developer pushes code to GitHub                        │
└────────────────────┬────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────┐
│  GitHub Actions: CI Workflow (.github/workflows/ci.yml) │
│  ├─ Checkout code                                       │
│  ├─ Setup Node.js 20                                    │
│  ├─ Install dependencies (npm ci)                       │
│  ├─ Run database migrations (test DB)                   │
│  ├─ Build application                                   │
│  └─ Upload artifacts                                    │
└────────────────────┬────────────────────────────────────┘
                     │
                     ▼  (If main branch)
┌─────────────────────────────────────────────────────────┐
│  GitHub Actions: Deploy Workflow                        │
│  ├─ Configure AWS credentials                           │
│  ├─ Login to Amazon ECR                                 │
│  ├─ Build Docker image                                  │
│  ├─ Push image to ECR                                   │
│  ├─ Run database migrations (production)                │
│  ├─ Update ECS task definition                          │
│  └─ Deploy to ECS Fargate                               │
└────────────────────┬────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────┐
│  AWS Infrastructure                                      │
│  ├─ ECS pulls new image from ECR                        │
│  ├─ Starts new tasks with updated image                 │
│  ├─ Health checks pass                                  │
│  ├─ Drains old tasks                                    │
│  └─ Application running on new version                  │
└─────────────────────────────────────────────────────────┘
```

## Environment Strategy

### Branches and Environments

| Branch | Environment | Auto-Deploy | Description |
|--------|-------------|-------------|-------------|
| `develop` | Development | No | Development work |
| `staging` | Staging | Manual | Pre-production testing |
| `main` | Production | Yes | Live application |

### Recommended Workflow

1. **Feature Development**:
   ```bash
   git checkout -b feature/new-feature develop
   # Make changes
   git push origin feature/new-feature
   # Create pull request to develop
   ```

2. **Testing in Staging**:
   ```bash
   git checkout staging
   git merge develop
   git push origin staging
   # Manually trigger deploy to staging environment
   ```

3. **Production Release**:
   ```bash
   git checkout main
   git merge staging
   git tag -a v1.0.0 -m "Release v1.0.0"
   git push origin main --tags
   # Auto-deploys to production
   ```

## Troubleshooting

### CI Workflow Fails

**Problem**: Dependencies fail to install
```
Solution: 
- Check package.json is committed
- Verify node version compatibility
- Clear npm cache and retry
```

**Problem**: Database migration fails
```
Solution:
- Check DATABASE_URL secret is set
- Verify PostgreSQL service is running
- Check schema compatibility
```

### Deploy Workflow Fails

**Problem**: AWS credentials invalid
```
Solution:
- Verify AWS_ACCESS_KEY_ID and AWS_SECRET_ACCESS_KEY secrets
- Check IAM permissions
- Ensure credentials are not expired
```

**Problem**: ECR push fails
```
Solution:
- Verify ECR repository exists
- Check ECR_REPOSITORY name in workflow
- Ensure AWS region is correct
```

**Problem**: ECS deployment fails
```
Solution:
- Check ECS service exists
- Verify task definition is correct
- Review ECS service events in AWS Console
- Check CloudWatch logs
```

## Best Practices

### 1. Branch Protection

Set up branch protection for `main`:
- Go to: `Settings → Branches → Add rule`
- Require pull request reviews
- Require status checks to pass
- Require branches to be up to date

### 2. Secret Rotation

Rotate secrets periodically:
```bash
# Generate new session secret
openssl rand -base64 32

# Update in GitHub Secrets
# Update in AWS Secrets Manager
```

### 3. Deployment Notifications

Add Slack/Discord webhook for notifications:
```yaml
- name: Notify deployment
  uses: 8398a7/action-slack@v3
  with:
    status: ${{ job.status }}
    webhook_url: ${{ secrets.SLACK_WEBHOOK }}
```

### 4. Automated Testing

Add test step in CI workflow:
```yaml
- name: Run tests
  run: npm test
```

### 5. Database Backup Before Deploy

```yaml
- name: Backup database
  run: |
    aws rds create-db-snapshot \
      --db-instance-identifier wellasset-db \
      --db-snapshot-identifier backup-$(date +%Y%m%d-%H%M%S)
```

## Advanced Features

### Blue/Green Deployment

Configure in ECS service for zero-downtime:
```yaml
deploymentConfiguration:
  deploymentCircuitBreaker:
    enable: true
    rollback: true
  maximumPercent: 200
  minimumHealthyPercent: 100
```

### Canary Deployment

Deploy to 10% of traffic first:
```yaml
- name: Deploy canary
  run: |
    aws ecs update-service \
      --cluster $ECS_CLUSTER \
      --service $ECS_SERVICE \
      --desired-count 1
    sleep 300  # Monitor for 5 minutes
    # If healthy, scale to full capacity
```

### Multi-Region Deployment

Add region matrix:
```yaml
strategy:
  matrix:
    region: [us-east-1, eu-west-1]
```

## Cost Optimization

### GitHub Actions Minutes

- Free tier: 2,000 minutes/month
- Current usage: ~10 minutes per deployment
- Estimated capacity: ~200 deployments/month

### AWS Costs

Monitor with AWS Cost Explorer:
- Set up billing alerts
- Use Fargate Spot for staging (30-50% savings)
- Enable ECS auto-scaling

## Security Checklist

- [ ] All secrets stored in GitHub Secrets (never in code)
- [ ] AWS IAM uses least privilege principle
- [ ] Database in private subnet
- [ ] RDS encryption at rest enabled
- [ ] Container runs as non-root user
- [ ] Security groups properly configured
- [ ] CloudTrail enabled for audit logs
- [ ] Regular dependency updates

## Next Steps

1. ✅ GitHub repository connected
2. ⬜ AWS infrastructure set up ([AWS_SETUP.md](./AWS_SETUP.md))
3. ⬜ GitHub secrets configured
4. ⬜ Test CI pipeline
5. ⬜ First production deployment
6. ⬜ Set up monitoring and alerts
7. ⬜ Configure custom domain
8. ⬜ Set up SSL certificate
9. ⬜ Enable CloudFront CDN

## Support Resources

- [GitHub Actions Documentation](https://docs.github.com/en/actions)
- [AWS ECS Documentation](https://docs.aws.amazon.com/ecs/)
- [Docker Documentation](https://docs.docker.com/)
- Project-specific docs:
  - [DEPLOYMENT.md](./DEPLOYMENT.md)
  - [AWS_SETUP.md](./AWS_SETUP.md)
  - [ENVIRONMENT.md](./ENVIRONMENT.md)

## Success Metrics

Track these metrics to ensure successful CI/CD:

| Metric | Target | Current |
|--------|--------|---------|
| Build time | < 5 minutes | - |
| Deployment time | < 10 minutes | - |
| Success rate | > 95% | - |
| Mean time to deploy | < 15 minutes | - |
| Rollback time | < 5 minutes | - |

---

**Ready to deploy?** Start with [AWS_SETUP.md](./AWS_SETUP.md) to configure your AWS infrastructure!
