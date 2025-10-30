# Production Setup Guide for Well Asset Real Estate Platform

This guide will help you complete the production deployment on your EC2 instance with Nginx and SSL.

## Prerequisites

✅ EC2 instance running Ubuntu (already configured)
✅ Domain `wellassetcompany.com` pointing to EC2 IP via Cloudflare DNS (already done)
✅ PostgreSQL database running on EC2
✅ SSH access to EC2 instance

## Step 1: Create .env.production on EC2

SSH into your EC2 instance and create the production environment file:

```bash
# SSH into EC2
ssh -i your-key.pem ubuntu@ec2-54-254-253-106.ap-southeast-1.compute.amazonaws.com

# Switch to the application directory
cd /var/www/wellasset

# Create .env.production file
sudo nano .env.production
```

Add the following content (replace with your actual values):

```env
# Node Environment
NODE_ENV=production

# Server Configuration
PORT=5000

# Database Configuration (PostgreSQL on same server)
DATABASE_URL=postgresql://wellasset_user:YOUR_DB_PASSWORD@localhost:5432/wellasset_db
PGHOST=localhost
PGPORT=5432
PGUSER=wellasset_user
PGPASSWORD=YOUR_DB_PASSWORD
PGDATABASE=wellasset_db

# Session Secret (generate a secure random string)
SESSION_SECRET=YOUR_SECURE_RANDOM_SECRET_HERE
```

Save the file (Ctrl+O, Enter, Ctrl+X in nano).

Set proper permissions:

```bash
sudo chown nodejs:nodejs /var/www/wellasset/.env.production
sudo chmod 600 /var/www/wellasset/.env.production
```

## Step 2: Install and Configure Nginx with SSL

Make the setup script executable and run it:

```bash
# Make setup script executable
sudo chmod +x /var/www/wellasset/setup-nginx.sh

# Run the Nginx setup script
sudo /var/www/wellasset/setup-nginx.sh
```

This script will:
- Install Nginx and Certbot
- Configure Nginx as reverse proxy to Node.js (port 5000)
- Obtain free SSL certificates from Let's Encrypt
- Setup automatic certificate renewal
- Enable HTTPS for wellassetcompany.com and www.wellassetcompany.com

## Step 3: Verify Nginx Configuration

Check that Nginx is running correctly:

```bash
# Check Nginx status
sudo systemctl status nginx

# Test the reverse proxy (should show Node.js app health check)
curl http://localhost:5000/health

# Test Nginx proxy
curl http://localhost/health
```

## Step 4: Commit and Deploy

On your local machine, commit the configuration changes and push to trigger deployment:

```bash
# Stage all changes
git add .

# Commit
git commit -m "feat: add Nginx config, PM2 env loading, and production setup"

# Push to deploy
git push origin main
```

## Step 5: Verify Deployment

After GitHub Actions completes the deployment:

1. **Check application status on EC2:**

```bash
ssh -i your-key.pem ubuntu@ec2-54-254-253-106.ap-southeast-1.compute.amazonaws.com

# Check PM2 status
sudo -u nodejs /home/nodejs/node_modules/.bin/pm2 status

# Check application logs
sudo -u nodejs /home/nodejs/node_modules/.bin/pm2 logs wellasset-app --lines 50

# Check systemd status
sudo systemctl status wellasset

# Test health endpoint
curl http://localhost:5000/health
```

2. **Test HTTPS access in browser:**

- Visit: https://wellassetcompany.com
- Visit: https://www.wellassetcompany.com

Both should show your real estate platform with a valid SSL certificate!

## Troubleshooting

### If .env.production is missing during deployment

The deployment will fail with a clear error message. Create the file following Step 1 above.

### If PM2 shows "stopped" status

Check the logs:

```bash
sudo -u nodejs /home/nodejs/node_modules/.bin/pm2 logs wellasset-app --lines 100
```

Common issues:
- **DATABASE_URL not set**: Verify .env.production exists and has correct permissions
- **Database connection failed**: Check PostgreSQL is running and credentials are correct
- **Port already in use**: Make sure no other service is using port 5000

### If SSL certificate fails to obtain

1. Verify DNS is propagating:
```bash
nslookup wellassetcompany.com
```

2. Ensure port 80 is open for Let's Encrypt validation:
```bash
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
```

3. Wait a few minutes for Cloudflare DNS to propagate, then try again:
```bash
sudo certbot --nginx -d wellassetcompany.com -d www.wellassetcompany.com
```

### Manual PM2 restart

If you need to manually restart the application:

```bash
# Stop
sudo systemctl stop wellasset

# Start
sudo systemctl start wellasset

# Or restart
sudo systemctl restart wellasset
```

## Security Checklist

- ✅ .env.production has 600 permissions (not readable by others)
- ✅ Database uses strong password
- ✅ SESSION_SECRET is a long random string (32+ characters)
- ✅ SSL/HTTPS enabled for all traffic
- ✅ Nginx security headers configured
- ✅ PM2 runs as non-root user (nodejs)

## Monitoring

### Check application health

```bash
# Application status
sudo -u nodejs /home/nodejs/node_modules/.bin/pm2 status

# Real-time logs
sudo -u nodejs /home/nodejs/node_modules/.bin/pm2 logs wellasset-app

# System resource usage
sudo -u nodejs /home/nodejs/node_modules/.bin/pm2 monit
```

### Check Nginx logs

```bash
# Access logs
sudo tail -f /var/log/nginx/wellasset_access.log

# Error logs
sudo tail -f /var/log/nginx/wellasset_error.log
```

## Next Steps

After successful deployment:

1. **Test the admin panel**: https://wellassetcompany.com/admin/login
   - Email: testadmin@wellasset.com
   - Password: admin123

2. **Add property images** via admin dashboard

3. **Update site settings** (company info, office location, social media)

4. **Test contact forms** and inquiry submissions

5. **Monitor logs** for any errors or issues

## Support

If you encounter any issues, check:
1. GitHub Actions deployment logs
2. PM2 application logs on EC2
3. Nginx error logs
4. PostgreSQL logs: `sudo journalctl -u postgresql`

---

**Your production deployment is ready! 🚀**

Visit: **https://wellassetcompany.com**
