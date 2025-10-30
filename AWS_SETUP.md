# AWS Infrastructure Setup Guide

Complete guide for setting up AWS infrastructure for the Well Asset Real Estate Platform.

## Table of Contents
- [Architecture Overview](#architecture-overview)
- [Prerequisites](#prerequisites)
- [Step-by-Step Setup](#step-by-step-setup)
- [Infrastructure as Code](#infrastructure-as-code)
- [Security Configuration](#security-configuration)

## Architecture Overview

```
┌─────────────────────────────────────────────────────┐
│                    Internet                          │
└───────────────────┬─────────────────────────────────┘
                    │
        ┌───────────▼──────────────┐
        │   Route 53 (DNS)         │
        │   CloudFront (CDN)       │
        └───────────┬──────────────┘
                    │
        ┌───────────▼──────────────┐
        │ Application Load Balancer│
        │      (Public Subnet)      │
        └───────────┬──────────────┘
                    │
    ┌───────────────┴────────────────┐
    │                                 │
┌───▼────┐                       ┌───▼────┐
│ ECS    │ ←─────────────────→  │  ECS   │
│ Task   │   (Auto Scaling)      │  Task  │
│ (App)  │                       │  (App) │
└────┬───┘                       └───┬────┘
     │      (Private Subnet)         │
     │                               │
     └───────────┬───────────────────┘
                 │
     ┌───────────▼──────────────┐
     │  RDS PostgreSQL          │
     │  (Private Subnet)        │
     │  Multi-AZ for HA         │
     └──────────────────────────┘
```

## Prerequisites

### AWS Account Setup
1. AWS Account with billing enabled
2. IAM user with administrator access
3. AWS CLI installed and configured
4. Terraform installed (optional, for IaC)

### Tools Required
```bash
# Install AWS CLI
curl "https://awscli.amazonaws.com/awscli-exe-linux-x86_64.zip" -o "awscliv2.zip"
unzip awscliv2.zip
sudo ./aws/install

# Configure AWS CLI
aws configure
# Enter: Access Key ID, Secret Access Key, Region (us-east-1), Output format (json)

# Verify configuration
aws sts get-caller-identity
```

## Step-by-Step Setup

### 1. Create VPC and Networking

```bash
# Create VPC
aws ec2 create-vpc \
  --cidr-block 10.0.0.0/16 \
  --tag-specifications 'ResourceType=vpc,Tags=[{Key=Name,Value=wellasset-vpc}]'

# Note the VPC ID from output
export VPC_ID=vpc-xxxxxxxxx

# Create Internet Gateway
aws ec2 create-internet-gateway \
  --tag-specifications 'ResourceType=internet-gateway,Tags=[{Key=Name,Value=wellasset-igw}]'

export IGW_ID=igw-xxxxxxxxx

# Attach Internet Gateway to VPC
aws ec2 attach-internet-gateway \
  --vpc-id $VPC_ID \
  --internet-gateway-id $IGW_ID

# Create Public Subnets (for ALB)
aws ec2 create-subnet \
  --vpc-id $VPC_ID \
  --cidr-block 10.0.1.0/24 \
  --availability-zone us-east-1a \
  --tag-specifications 'ResourceType=subnet,Tags=[{Key=Name,Value=wellasset-public-1a}]'

aws ec2 create-subnet \
  --vpc-id $VPC_ID \
  --cidr-block 10.0.2.0/24 \
  --availability-zone us-east-1b \
  --tag-specifications 'ResourceType=subnet,Tags=[{Key=Name,Value=wellasset-public-1b}]'

# Create Private Subnets (for ECS and RDS)
aws ec2 create-subnet \
  --vpc-id $VPC_ID \
  --cidr-block 10.0.11.0/24 \
  --availability-zone us-east-1a \
  --tag-specifications 'ResourceType=subnet,Tags=[{Key=Name,Value=wellasset-private-1a}]'

aws ec2 create-subnet \
  --vpc-id $VPC_ID \
  --cidr-block 10.0.12.0/24 \
  --availability-zone us-east-1b \
  --tag-specifications 'ResourceType=subnet,Tags=[{Key=Name,Value=wellasset-private-1b}]'
```

### 2. Set Up RDS PostgreSQL

```bash
# Create DB Subnet Group
aws rds create-db-subnet-group \
  --db-subnet-group-name wellasset-db-subnet-group \
  --db-subnet-group-description "Subnet group for Well Asset DB" \
  --subnet-ids subnet-xxxxxxxx subnet-yyyyyyyy

# Create Security Group for RDS
aws ec2 create-security-group \
  --group-name wellasset-rds-sg \
  --description "Security group for Well Asset RDS" \
  --vpc-id $VPC_ID

export RDS_SG_ID=sg-xxxxxxxxx

# Allow PostgreSQL access from ECS security group
aws ec2 authorize-security-group-ingress \
  --group-id $RDS_SG_ID \
  --protocol tcp \
  --port 5432 \
  --source-group $ECS_SG_ID

# Create RDS Instance
aws rds create-db-instance \
  --db-instance-identifier wellasset-db \
  --db-instance-class db.t3.micro \
  --engine postgres \
  --engine-version 16.1 \
  --master-username postgres \
  --master-user-password YOUR_STRONG_PASSWORD \
  --allocated-storage 20 \
  --vpc-security-group-ids $RDS_SG_ID \
  --db-subnet-group-name wellasset-db-subnet-group \
  --backup-retention-period 7 \
  --preferred-backup-window "03:00-04:00" \
  --preferred-maintenance-window "mon:04:00-mon:05:00" \
  --multi-az \
  --storage-encrypted \
  --publicly-accessible false

# Wait for RDS instance to be available (takes 5-10 minutes)
aws rds wait db-instance-available --db-instance-identifier wellasset-db

# Get RDS endpoint
aws rds describe-db-instances \
  --db-instance-identifier wellasset-db \
  --query 'DBInstances[0].Endpoint.Address' \
  --output text
```

### 3. Create ECR Repository

```bash
# Create ECR repository for Docker images
aws ecr create-repository \
  --repository-name wellasset-realestate \
  --image-scanning-configuration scanOnPush=true \
  --encryption-configuration encryptionType=AES256

# Get repository URI
aws ecr describe-repositories \
  --repository-names wellasset-realestate \
  --query 'repositories[0].repositoryUri' \
  --output text
```

### 4. Set Up ECS Cluster

```bash
# Create ECS cluster
aws ecs create-cluster \
  --cluster-name wellasset-cluster \
  --capacity-providers FARGATE FARGATE_SPOT \
  --default-capacity-provider-strategy capacityProvider=FARGATE,weight=1,base=1

# Create CloudWatch Log Group
aws logs create-log-group \
  --log-group-name /aws/ecs/wellasset-service
```

### 5. Create IAM Roles

#### ECS Task Execution Role
```bash
# Create trust policy file
cat > ecs-task-execution-trust-policy.json <<EOF
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Principal": {
        "Service": "ecs-tasks.amazonaws.com"
      },
      "Action": "sts:AssumeRole"
    }
  ]
}
EOF

# Create role
aws iam create-role \
  --role-name wellasset-ecs-execution-role \
  --assume-role-policy-document file://ecs-task-execution-trust-policy.json

# Attach AWS managed policy
aws iam attach-role-policy \
  --role-name wellasset-ecs-execution-role \
  --policy-arn arn:aws:iam::aws:policy/service-role/AmazonECSTaskExecutionRolePolicy

# Attach Secrets Manager access
aws iam attach-role-policy \
  --role-name wellasset-ecs-execution-role \
  --policy-arn arn:aws:iam::aws:policy/SecretsManagerReadWrite
```

#### ECS Task Role (for application)
```bash
cat > ecs-task-role-trust-policy.json <<EOF
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Principal": {
        "Service": "ecs-tasks.amazonaws.com"
      },
      "Action": "sts:AssumeRole"
    }
  ]
}
EOF

aws iam create-role \
  --role-name wellasset-ecs-task-role \
  --assume-role-policy-document file://ecs-task-role-trust-policy.json
```

### 6. Create ECS Task Definition

```bash
# Create task definition JSON
cat > task-definition.json <<EOF
{
  "family": "wellasset-task",
  "networkMode": "awsvpc",
  "requiresCompatibilities": ["FARGATE"],
  "cpu": "512",
  "memory": "1024",
  "executionRoleArn": "arn:aws:iam::YOUR_ACCOUNT_ID:role/wellasset-ecs-execution-role",
  "taskRoleArn": "arn:aws:iam::YOUR_ACCOUNT_ID:role/wellasset-ecs-task-role",
  "containerDefinitions": [
    {
      "name": "wellasset-container",
      "image": "YOUR_ECR_URI:latest",
      "portMappings": [
        {
          "containerPort": 5000,
          "protocol": "tcp"
        }
      ],
      "essential": true,
      "environment": [
        {
          "name": "NODE_ENV",
          "value": "production"
        },
        {
          "name": "PORT",
          "value": "5000"
        }
      ],
      "secrets": [
        {
          "name": "DATABASE_URL",
          "valueFrom": "arn:aws:secretsmanager:us-east-1:YOUR_ACCOUNT_ID:secret:wellasset/database-url"
        },
        {
          "name": "SESSION_SECRET",
          "valueFrom": "arn:aws:secretsmanager:us-east-1:YOUR_ACCOUNT_ID:secret:wellasset/session-secret"
        }
      ],
      "logConfiguration": {
        "logDriver": "awslogs",
        "options": {
          "awslogs-group": "/aws/ecs/wellasset-service",
          "awslogs-region": "us-east-1",
          "awslogs-stream-prefix": "ecs"
        }
      },
      "healthCheck": {
        "command": ["CMD-SHELL", "curl -f http://localhost:5000/health || exit 1"],
        "interval": 30,
        "timeout": 5,
        "retries": 3,
        "startPeriod": 60
      }
    }
  ]
}
EOF

# Register task definition
aws ecs register-task-definition --cli-input-json file://task-definition.json
```

### 7. Create Application Load Balancer

```bash
# Create security group for ALB
aws ec2 create-security-group \
  --group-name wellasset-alb-sg \
  --description "Security group for Well Asset ALB" \
  --vpc-id $VPC_ID

export ALB_SG_ID=sg-xxxxxxxxx

# Allow HTTP/HTTPS traffic
aws ec2 authorize-security-group-ingress \
  --group-id $ALB_SG_ID \
  --protocol tcp --port 80 --cidr 0.0.0.0/0

aws ec2 authorize-security-group-ingress \
  --group-id $ALB_SG_ID \
  --protocol tcp --port 443 --cidr 0.0.0.0/0

# Create ALB
aws elbv2 create-load-balancer \
  --name wellasset-alb \
  --subnets subnet-xxxxxxxx subnet-yyyyyyyy \
  --security-groups $ALB_SG_ID \
  --scheme internet-facing \
  --type application

# Create target group
aws elbv2 create-target-group \
  --name wellasset-tg \
  --protocol HTTP \
  --port 5000 \
  --vpc-id $VPC_ID \
  --target-type ip \
  --health-check-path /health \
  --health-check-interval-seconds 30 \
  --health-check-timeout-seconds 5 \
  --healthy-threshold-count 2 \
  --unhealthy-threshold-count 3

# Create listener
aws elbv2 create-listener \
  --load-balancer-arn YOUR_ALB_ARN \
  --protocol HTTP \
  --port 80 \
  --default-actions Type=forward,TargetGroupArn=YOUR_TG_ARN
```

### 8. Create ECS Service

```bash
# Create security group for ECS tasks
aws ec2 create-security-group \
  --group-name wellasset-ecs-sg \
  --description "Security group for Well Asset ECS tasks" \
  --vpc-id $VPC_ID

export ECS_SG_ID=sg-xxxxxxxxx

# Allow traffic from ALB
aws ec2 authorize-security-group-ingress \
  --group-id $ECS_SG_ID \
  --protocol tcp --port 5000 \
  --source-group $ALB_SG_ID

# Create ECS service
aws ecs create-service \
  --cluster wellasset-cluster \
  --service-name wellasset-service \
  --task-definition wellasset-task:1 \
  --desired-count 2 \
  --launch-type FARGATE \
  --network-configuration "awsvpcConfiguration={subnets=[subnet-xxxxxxxx,subnet-yyyyyyyy],securityGroups=[$ECS_SG_ID],assignPublicIp=DISABLED}" \
  --load-balancers "targetGroupArn=YOUR_TG_ARN,containerName=wellasset-container,containerPort=5000" \
  --health-check-grace-period-seconds 60
```

### 9. Store Secrets in AWS Secrets Manager

```bash
# Store database URL
aws secretsmanager create-secret \
  --name wellasset/database-url \
  --description "Database connection string" \
  --secret-string "postgresql://username:password@your-rds-endpoint:5432/wellasset_db"

# Store session secret
aws secretsmanager create-secret \
  --name wellasset/session-secret \
  --description "Session secret for JWT" \
  --secret-string "$(openssl rand -base64 32)"
```

### 10. Set Up Auto Scaling

```bash
# Register scalable target
aws application-autoscaling register-scalable-target \
  --service-namespace ecs \
  --scalable-dimension ecs:service:DesiredCount \
  --resource-id service/wellasset-cluster/wellasset-service \
  --min-capacity 2 \
  --max-capacity 10

# Create scaling policy
aws application-autoscaling put-scaling-policy \
  --service-namespace ecs \
  --scalable-dimension ecs:service:DesiredCount \
  --resource-id service/wellasset-cluster/wellasset-service \
  --policy-name wellasset-cpu-scaling \
  --policy-type TargetTrackingScaling \
  --target-tracking-scaling-policy-configuration file://scaling-policy.json

# scaling-policy.json
cat > scaling-policy.json <<EOF
{
  "TargetValue": 70.0,
  "PredefinedMetricSpecification": {
    "PredefinedMetricType": "ECSServiceAverageCPUUtilization"
  },
  "ScaleInCooldown": 300,
  "ScaleOutCooldown": 60
}
EOF
```

## Security Configuration

### Security Group Rules Summary

| Component | Inbound | Outbound |
|-----------|---------|----------|
| ALB | 80, 443 from 0.0.0.0/0 | All |
| ECS Tasks | 5000 from ALB SG | All |
| RDS | 5432 from ECS SG | None needed |

### Best Practices
1. Use AWS Secrets Manager for all sensitive data
2. Enable encryption at rest for RDS
3. Use Multi-AZ deployment for RDS
4. Enable CloudTrail for audit logging
5. Use VPC endpoints for AWS services
6. Enable AWS WAF on ALB for DDoS protection

## Monitoring Setup

```bash
# Create CloudWatch alarms
aws cloudwatch put-metric-alarm \
  --alarm-name wellasset-high-cpu \
  --alarm-description "Alert when CPU exceeds 80%" \
  --metric-name CPUUtilization \
  --namespace AWS/ECS \
  --statistic Average \
  --period 300 \
  --threshold 80 \
  --comparison-operator GreaterThanThreshold \
  --evaluation-periods 2 \
  --dimensions Name=ServiceName,Value=wellasset-service Name=ClusterName,Value=wellasset-cluster
```

## Cost Estimate

### Monthly Costs (Approximate)

| Service | Configuration | Est. Cost |
|---------|--------------|-----------|
| ECS Fargate | 2 tasks (0.5 vCPU, 1GB) | $30 |
| RDS PostgreSQL | db.t3.micro, Multi-AZ | $30 |
| ALB | Standard | $20 |
| Data Transfer | 100GB | $10 |
| CloudWatch | Logs + Metrics | $10 |
| **Total** | | **~$100/month** |

## Next Steps

1. Configure custom domain with Route 53
2. Set up SSL certificate with ACM
3. Configure CloudFront for static assets
4. Set up backup and disaster recovery
5. Configure monitoring and alerting
6. Implement Blue/Green deployment

## Cleanup (Development/Testing)

To avoid charges, delete resources in this order:

```bash
# Delete ECS service
aws ecs delete-service --cluster wellasset-cluster --service wellasset-service --force

# Delete ECS cluster
aws ecs delete-cluster --cluster wellasset-cluster

# Delete RDS instance
aws rds delete-db-instance --db-instance-identifier wellasset-db --skip-final-snapshot

# Delete ALB and target groups
# Delete ECR repository
# Delete CloudWatch log groups
# Delete VPC and all associated resources
```
