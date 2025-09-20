# Linux Production Deployment Guide

This guide covers deploying your Next.js headless WordPress application on a Linux server for production.

## Prerequisites

- Linux server (Ubuntu 20.04+ recommended)
- Node.js 18+ and npm
- PM2 for process management
- Nginx for reverse proxy
- SSL certificate (Let's Encrypt recommended)
- WordPress backend API accessible

## 1. Server Setup

### Install Node.js and npm
```bash
# Update system packages
sudo apt update && sudo apt upgrade -y

# Install Node.js 18+ using NodeSource repository
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Verify installation
node --version
npm --version
```

### Install PM2 (Process Manager)
```bash
sudo npm install -g pm2
```

### Install Nginx
```bash
sudo apt install nginx -y
sudo systemctl enable nginx
sudo systemctl start nginx
```

## 2. Application Deployment

### Clone and Setup Application
```bash
# Clone your repository
git clone https://github.com/Ajaykr2109/tech-oblivion-wpHeadless.git
cd tech-oblivion-wpHeadless

# Install dependencies
npm ci --production=false

# Create production environment file
cp .env.example .env.production
```

### Configure Environment Variables
Edit `.env.production` with your production values:

```bash
nano .env.production
```

**Required Environment Variables:**
```env
# WordPress API Configuration
WP_URL=https://your-wordpress-site.com
WP_API_URL=https://your-wordpress-site.com/wp-json/wp/v2

# Security
JWT_SECRET=your-super-secure-jwt-secret-here
NEXT_REVALIDATE_SECRET=your-revalidate-secret-here

# Site Configuration
NEXT_PUBLIC_SITE_URL=https://your-frontend-domain.com
NODE_ENV=production

# Optional: Database (if using local analytics)
DATABASE_URL=postgresql://user:password@localhost:5432/dbname

# Optional: Email Configuration
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
```

### Build Application
```bash
# Build the application with automatic static asset copying
npm run build

# Verify static assets were copied
ls -la .next/standalone/.next/static/css/
```

## 3. PM2 Process Configuration

### Create PM2 Ecosystem File
```bash
nano ecosystem.config.js
```

**ecosystem.config.js:**
```javascript
module.exports = {
  apps: [{
    name: 'tech-oblivion-frontend',
    script: '.next/standalone/server.js',
    cwd: '/path/to/your/tech-oblivion-wpHeadless',
    instances: 'max',
    exec_mode: 'cluster',
    env: {
      NODE_ENV: 'production',
      PORT: 3200,
      dotenv_config_path: '.env.production'
    },
    env_production: {
      NODE_ENV: 'production',
      PORT: 3200,
      dotenv_config_path: '.env.production'
    },
    // Logging
    log_file: './logs/app.log',
    out_file: './logs/out.log',
    error_file: './logs/error.log',
    log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
    
    // Auto-restart configuration
    max_memory_restart: '500M',
    min_uptime: '10s',
    max_restarts: 10,
    
    // Health monitoring
    watch: false,
    ignore_watch: ['node_modules', '.next', 'logs'],
    
    // Graceful shutdown
    kill_timeout: 5000,
    wait_ready: true,
    listen_timeout: 3000
  }]
};
```

### Start Application with PM2
```bash
# Create logs directory
mkdir -p logs

# Start application
pm2 start ecosystem.config.js --env production

# Save PM2 configuration
pm2 save

# Setup PM2 to start on boot
pm2 startup
# Follow the instructions output by the command above

# Check application status
pm2 status
pm2 logs tech-oblivion-frontend
```

## 4. Nginx Configuration

### Create Nginx Site Configuration
```bash
sudo nano /etc/nginx/sites-available/tech-oblivion
```

**Basic Nginx Configuration:**
```nginx
server {
    listen 80;
    server_name your-domain.com www.your-domain.com;

    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header Referrer-Policy "no-referrer-when-downgrade" always;
    add_header Content-Security-Policy "default-src 'self' http: https: data: blob: 'unsafe-inline'" always;

    # Gzip compression
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_proxied expired no-cache no-store private must-revalidate auth;
    gzip_types
        text/plain
        text/css
        text/xml
        text/javascript
        application/json
        application/javascript
        application/xml+rss
        application/atom+xml
        image/svg+xml;

    # Proxy to Next.js application
    location / {
        proxy_pass http://localhost:3200;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        
        # Timeout settings
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
    }

    # Static files caching
    location /_next/static/ {
        proxy_pass http://localhost:3200;
        add_header Cache-Control "public, max-age=31536000, immutable";
    }

    # API routes
    location /api/ {
        proxy_pass http://localhost:3200;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

### Enable Nginx Site
```bash
# Enable the site
sudo ln -s /etc/nginx/sites-available/tech-oblivion /etc/nginx/sites-enabled/

# Test Nginx configuration
sudo nginx -t

# Restart Nginx
sudo systemctl restart nginx
```

## 5. SSL Certificate Setup (Let's Encrypt)

### Install Certbot
```bash
sudo apt install snapd
sudo snap install core; sudo snap refresh core
sudo snap install --classic certbot
sudo ln -s /snap/bin/certbot /usr/bin/certbot
```

### Obtain SSL Certificate
```bash
# Get certificate for your domain
sudo certbot --nginx -d your-domain.com -d www.your-domain.com

# Test auto-renewal
sudo certbot renew --dry-run
```

## 6. Monitoring and Maintenance

### Setup Log Rotation
```bash
sudo nano /etc/logrotate.d/tech-oblivion
```

**Log rotation configuration:**
```
/path/to/your/tech-oblivion-wpHeadless/logs/*.log {
    daily
    missingok
    rotate 52
    compress
    delaycompress
    notifempty
    create 644 www-data www-data
    postrotate
        pm2 reloadLogs
    endscript
}
```

### Monitoring Commands
```bash
# Check application status
pm2 status
pm2 monit

# View logs
pm2 logs tech-oblivion-frontend
pm2 logs tech-oblivion-frontend --lines 100

# Check system resources
htop
df -h
free -m

# Check Nginx status
sudo systemctl status nginx
sudo nginx -t

# Check SSL certificate
sudo certbot certificates
```

## 7. Deployment Scripts

### Create Deployment Script
```bash
nano deploy.sh
chmod +x deploy.sh
```

**deploy.sh:**
```bash
#!/bin/bash

# Deployment script for tech-oblivion-wpHeadless

set -e

echo "🚀 Starting deployment..."

# Pull latest code
git pull origin main

# Install/update dependencies
npm ci --production=false

# Build application with static asset copying
echo "📦 Building application..."
npm run build

# Restart PM2 application
echo "🔄 Restarting application..."
pm2 restart tech-oblivion-frontend

# Wait for application to start
sleep 5

# Check if application is running
if pm2 list | grep -q "tech-oblivion-frontend.*online"; then
    echo "✅ Deployment successful!"
    echo "Application is running at: https://your-domain.com"
else
    echo "❌ Deployment failed!"
    pm2 logs tech-oblivion-frontend --lines 20
    exit 1
fi
```

### Zero-Downtime Deployment Script
```bash
nano deploy-zero-downtime.sh
chmod +x deploy-zero-downtime.sh
```

**deploy-zero-downtime.sh:**
```bash
#!/bin/bash

set -e

echo "🚀 Starting zero-downtime deployment..."

# Create backup
BACKUP_DIR="backup-$(date +%Y%m%d-%H%M%S)"
cp -r .next "$BACKUP_DIR"

# Pull and build
git pull origin main
npm ci --production=false
npm run build

# Graceful reload
pm2 reload tech-oblivion-frontend --wait-ready

# Verify deployment
sleep 10
if curl -f http://localhost:3200 > /dev/null 2>&1; then
    echo "✅ Zero-downtime deployment successful!"
    rm -rf "$BACKUP_DIR"
else
    echo "❌ Deployment failed, rolling back..."
    rm -rf .next
    mv "$BACKUP_DIR" .next
    pm2 restart tech-oblivion-frontend
    exit 1
fi
```

## 8. Troubleshooting

### Common Issues and Solutions

**1. Static Assets Not Loading**
```bash
# Check if static files exist
ls -la .next/standalone/.next/static/css/

# If missing, run the copy script manually
npm run copy-static

# Restart application
pm2 restart tech-oblivion-frontend
```

**2. Environment Variables Not Loading**
```bash
# Check environment file exists
ls -la .env.production

# Verify PM2 is using correct env file
pm2 show tech-oblivion-frontend | grep env

# Restart with explicit env
pm2 restart tech-oblivion-frontend --update-env
```

**3. Memory Issues**
```bash
# Monitor memory usage
pm2 monit

# Increase memory limit in ecosystem.config.js
# max_memory_restart: '1G'

# Restart PM2
pm2 restart tech-oblivion-frontend
```

**4. Port Already in Use**
```bash
# Check what's using port 3200
sudo lsof -i :3200

# Kill process if needed
sudo kill -9 <PID>

# Restart application
pm2 restart tech-oblivion-frontend
```

### Health Check Script
```bash
nano health-check.sh
chmod +x health-check.sh
```

**health-check.sh:**
```bash
#!/bin/bash

echo "🔍 Health Check Report"
echo "====================="

# Check PM2 status
echo "📊 PM2 Status:"
pm2 list | grep tech-oblivion-frontend

# Check application response
echo "🌐 Application Response:"
curl -I http://localhost:3200 2>/dev/null | head -1

# Check disk space
echo "💾 Disk Usage:"
df -h | grep -E "(Filesystem|/dev/)"

# Check memory
echo "🧠 Memory Usage:"
free -m

# Check recent logs
echo "📝 Recent Errors:"
tail -20 logs/error.log | grep -i error || echo "No recent errors"

echo "====================="
echo "✅ Health check complete"
```

## 9. Security Considerations

### Firewall Setup
```bash
# Configure UFW firewall
sudo ufw allow ssh
sudo ufw allow 80
sudo ufw allow 443
sudo ufw enable
```

### Regular Updates
```bash
# Update system packages weekly
sudo apt update && sudo apt upgrade -y

# Update Node.js dependencies monthly
npm audit
npm update

# Check for security vulnerabilities
npm audit fix
```

## 10. Backup Strategy

### Automated Backup Script
```bash
nano backup.sh
chmod +x backup.sh
```

**backup.sh:**
```bash
#!/bin/bash

DATE=$(date +%Y%m%d-%H%M%S)
BACKUP_DIR="/backups/tech-oblivion-$DATE"

mkdir -p "$BACKUP_DIR"

# Backup application files
tar -czf "$BACKUP_DIR/app.tar.gz" --exclude=node_modules --exclude=.next .

# Backup environment
cp .env.production "$BACKUP_DIR/"

# Backup PM2 configuration
pm2 save
cp ~/.pm2/dump.pm2 "$BACKUP_DIR/"

echo "✅ Backup created: $BACKUP_DIR"

# Clean old backups (keep last 7 days)
find /backups -name "tech-oblivion-*" -mtime +7 -exec rm -rf {} \;
```

### Setup Cron Jobs
```bash
crontab -e
```

**Add these lines:**
```bash
# Daily backup at 2 AM
0 2 * * * /path/to/your/backup.sh

# Weekly health check
0 6 * * 1 /path/to/your/health-check.sh

# Monthly log cleanup
0 3 1 * * pm2 flush
```

This comprehensive guide should cover all aspects of deploying your Next.js application on a Linux server with proper production practices, monitoring, and maintenance procedures.