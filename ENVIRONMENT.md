# Environment Variables Documentation

Complete reference for all environment variables required to run the Well Asset Real Estate Platform.

## Table of Contents
- [Required Variables](#required-variables)
- [Optional Variables](#optional-variables)
- [Environment-Specific Configuration](#environment-specific-configuration)
- [Setting Up Environments](#setting-up-environments)

## Required Variables

### Database Configuration

#### `DATABASE_URL`
**Type:** String (Connection URI)  
**Required:** Yes  
**Example:** `postgresql://username:password@hostname:5432/database_name`  
**Description:** PostgreSQL database connection string. Used by Drizzle ORM to connect to the database.

**Format:**
```
postgresql://[user]:[password]@[host]:[port]/[database]?[params]
```

**Production Example:**
```
postgresql://wellasset_user:SecurePassword123@wellasset-db.us-east-1.rds.amazonaws.com:5432/wellasset_prod
```

**Local Development Example:**
```
postgresql://postgres:postgres@localhost:5432/wellasset_dev
```

#### Individual PostgreSQL Variables (Alternative)
If not using `DATABASE_URL`, you can use these individual variables:

- `PGHOST` - Database host (e.g., `localhost`, `rds-endpoint.amazonaws.com`)
- `PGPORT` - Database port (default: `5432`)
- `PGUSER` - Database username
- `PGPASSWORD` - Database password
- `PGDATABASE` - Database name

### Authentication & Security

#### `SESSION_SECRET`
**Type:** String  
**Required:** Yes  
**Example:** `your-super-secret-random-string-change-this-in-production`  
**Description:** Secret key used for session encryption and JWT token signing.

**Generation:**
```bash
# Generate a secure random string
openssl rand -base64 32
```

**Security Notes:**
- Must be at least 32 characters
- Should be different for each environment
- Never commit to version control
- Rotate periodically in production

### Application Configuration

#### `NODE_ENV`
**Type:** String  
**Required:** Yes  
**Values:** `development`, `production`, `test`  
**Default:** `development`  
**Description:** Determines the application runtime environment.

**Effects:**
- `development`: Enables Vite dev server, verbose logging, hot reload
- `production`: Serves static build, optimized performance, minimal logging
- `test`: Used during automated testing, uses test database

#### `PORT`
**Type:** Number  
**Required:** No  
**Default:** `5000`  
**Description:** Port number the server listens on.

**Important Notes:**
- In production (AWS, etc.), this is usually set by the platform
- Must be `5000` on Replit due to firewall configuration
- Docker containers typically use `5000` internally

## Optional Variables

### Frontend Configuration

#### `VITE_API_URL`
**Type:** String (URL)  
**Required:** No  
**Default:** Same origin  
**Example:** `https://api.wellasset.com`  
**Description:** Backend API URL for frontend requests. Only needed if API is on a different domain.

### File Upload Configuration

#### `UPLOAD_DIR`
**Type:** String (Path)  
**Required:** No  
**Default:** `./uploads`  
**Description:** Directory for storing uploaded files (property images, etc.)

#### `MAX_FILE_SIZE`
**Type:** Number (bytes)  
**Required:** No  
**Default:** `52428800` (50MB)  
**Description:** Maximum file size for uploads in bytes.

### Email Configuration (If Implemented)

#### `SMTP_HOST`
**Type:** String  
**Example:** `smtp.gmail.com`  

#### `SMTP_PORT`
**Type:** Number  
**Example:** `587`  

#### `SMTP_USER`
**Type:** String  
**Example:** `noreply@wellasset.com`  

#### `SMTP_PASS`
**Type:** String (Password)  
**Description:** SMTP password or app-specific password

#### `EMAIL_FROM`
**Type:** String (Email)  
**Example:** `Well Asset <noreply@wellasset.com>`  
**Description:** Default "from" address for system emails

### AWS Configuration (Production)

#### `AWS_REGION`
**Type:** String  
**Example:** `us-east-1`  
**Description:** AWS region for services

#### `AWS_ACCESS_KEY_ID`
**Type:** String  
**Description:** AWS access key (only if not using IAM roles)

#### `AWS_SECRET_ACCESS_KEY`
**Type:** String  
**Description:** AWS secret key (only if not using IAM roles)

**Note:** In ECS/EC2 with IAM roles, these are not needed.

## Environment-Specific Configuration

### Development Environment

```bash
# .env.development
NODE_ENV=development
PORT=5000
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/wellasset_dev
SESSION_SECRET=dev-secret-change-in-production
```

### Test Environment

```bash
# .env.test
NODE_ENV=test
PORT=5001
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/wellasset_test
SESSION_SECRET=test-secret
```

### Staging Environment

```bash
# .env.staging
NODE_ENV=production
PORT=5000
DATABASE_URL=postgresql://user:pass@staging-db.us-east-1.rds.amazonaws.com:5432/wellasset_staging
SESSION_SECRET=staging-secret-from-secrets-manager
```

### Production Environment

```bash
# .env.production (Use AWS Secrets Manager instead)
NODE_ENV=production
PORT=5000
DATABASE_URL=<from-aws-secrets-manager>
SESSION_SECRET=<from-aws-secrets-manager>
```

## Setting Up Environments

### Local Development

1. Copy the example file:
```bash
cp .env.example .env
```

2. Edit `.env` with your local values:
```bash
# Use local PostgreSQL
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/wellasset_dev
SESSION_SECRET=$(openssl rand -base64 32)
```

3. Initialize database:
```bash
npm run db:push
```

### GitHub Actions

Set these as **Repository Secrets**:

1. Go to: `Settings → Secrets and variables → Actions`
2. Add secrets:
   - `AWS_ACCESS_KEY_ID`
   - `AWS_SECRET_ACCESS_KEY`
   - `DATABASE_URL` (production)
   - `SESSION_SECRET`

### AWS ECS/Fargate

#### Using AWS Secrets Manager (Recommended)

1. Store secrets:
```bash
# Database URL
aws secretsmanager create-secret \
  --name wellasset/database-url \
  --secret-string "postgresql://user:pass@host:5432/db"

# Session secret
aws secretsmanager create-secret \
  --name wellasset/session-secret \
  --secret-string "$(openssl rand -base64 32)"
```

2. Reference in ECS task definition:
```json
"secrets": [
  {
    "name": "DATABASE_URL",
    "valueFrom": "arn:aws:secretsmanager:region:account:secret:wellasset/database-url"
  },
  {
    "name": "SESSION_SECRET",
    "valueFrom": "arn:aws:secretsmanager:region:account:secret:wellasset/session-secret"
  }
]
```

#### Using Environment Variables in Task Definition

```json
"environment": [
  {
    "name": "NODE_ENV",
    "value": "production"
  },
  {
    "name": "PORT",
    "value": "5000"
  }
]
```

### Docker Compose

Create `.env` file:
```bash
DATABASE_URL=postgresql://postgres:postgres@postgres:5432/wellasset_db
SESSION_SECRET=docker-secret-change-this
NODE_ENV=production
```

Then run:
```bash
docker-compose up
```

### Replit

Replit automatically provides:
- `DATABASE_URL`
- `PGHOST`, `PGPORT`, `PGUSER`, `PGPASSWORD`, `PGDATABASE`

Add in Secrets (lock icon):
- `SESSION_SECRET`

## Environment Variable Validation

The application validates required environment variables on startup:

```typescript
// server/config.ts
const requiredEnvVars = [
  'DATABASE_URL',
  'SESSION_SECRET',
];

for (const envVar of requiredEnvVars) {
  if (!process.env[envVar]) {
    throw new Error(`Missing required environment variable: ${envVar}`);
  }
}
```

## Security Best Practices

### DO:
✅ Use AWS Secrets Manager in production  
✅ Rotate secrets regularly  
✅ Use different secrets for each environment  
✅ Generate cryptographically secure random secrets  
✅ Use IAM roles instead of access keys when possible  
✅ Encrypt environment variables in CI/CD  

### DON'T:
❌ Commit `.env` files to version control  
❌ Use the same secrets across environments  
❌ Share secrets in plain text (email, Slack, etc.)  
❌ Use weak or predictable secrets  
❌ Log environment variables  
❌ Include secrets in error messages  

## Troubleshooting

### Database Connection Issues

```bash
# Test database connection
psql $DATABASE_URL

# Or using individual variables
psql -h $PGHOST -p $PGPORT -U $PGUSER -d $PGDATABASE
```

### Missing Environment Variables

Check if all required variables are set:
```bash
# List all environment variables
printenv | grep -E '(DATABASE_URL|SESSION_SECRET|NODE_ENV)'
```

### ECS Task Not Starting

1. Check CloudWatch logs: `/aws/ecs/wellasset-service`
2. Verify Secrets Manager permissions on task execution role
3. Confirm secret ARNs are correct in task definition

## Reference Files

- `.env.example` - Template for local development
- `.github/workflows/deploy-aws.yml` - GitHub Actions secrets usage
- `docker-compose.yml` - Docker environment configuration
- `Dockerfile` - Container environment setup

## Support

For environment configuration issues:
1. Verify all required variables are set
2. Check variable format (especially DATABASE_URL)
3. Ensure secrets are properly encrypted in CI/CD
4. Review AWS Secrets Manager permissions
5. Check CloudWatch logs for startup errors
