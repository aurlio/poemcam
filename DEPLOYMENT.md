# PoemLens Nginx Deployment Guide

This guide provides step-by-step instructions for deploying PoemLens (诗镜) on your own server using nginx.

## Prerequisites

- Ubuntu/Debian server with root access
- Domain name pointing to your server
- OpenAI API key with billing credits

## System Requirements

- Node.js 18+ 
- PostgreSQL 12+
- nginx 1.18+
- SSL certificate (Let's Encrypt recommended)

## 1. Server Setup

### Update System
```bash
sudo apt update && sudo apt upgrade -y
```

### Install Node.js 18+
```bash
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs
```

### Install PostgreSQL
```bash
sudo apt install postgresql postgresql-contrib -y
sudo systemctl start postgresql
sudo systemctl enable postgresql
```

### Install nginx
```bash
sudo apt install nginx -y
sudo systemctl start nginx
sudo systemctl enable nginx
```

### Install PM2 (Process Manager)
```bash
sudo npm install -g pm2
```

## 2. Database Setup

### Create Database and User
```bash
sudo -u postgres psql
```

In PostgreSQL shell:
```sql
CREATE DATABASE poemlens;
CREATE USER poemlens_user WITH ENCRYPTED PASSWORD 'your_secure_password';
GRANT ALL PRIVILEGES ON DATABASE poemlens TO poemlens_user;
\q
```

## 3. Application Deployment

### Create Application Directory
```bash
sudo mkdir -p /var/www/poemlens
sudo chown $USER:$USER /var/www/poemlens
cd /var/www/poemlens
```

### Clone and Setup Application
```bash
# Upload your application files or clone from repository
# Ensure all project files are in /var/www/poemlens

# Install dependencies
npm install

# Create environment file
cp .env.example .env
```

### Configure Environment Variables
Edit `/var/www/poemlens/.env`:
```env
# Database Configuration
DATABASE_URL="postgresql://poemlens_user:your_secure_password@localhost:5432/poemlens"

# OpenAI Configuration
OPENAI_API_KEY="your_openai_api_key"

# Production Configuration
NODE_ENV="production"
PORT=3000

# Session Configuration
SESSION_SECRET="your_very_long_random_session_secret"
```

### Run Database Migrations
```bash
npm run db:push
# or if using migrations:
# npm run db:migrate
```

### Build Application
```bash
npm run build
```

## 4. SSL Certificate Setup

### Install Certbot
```bash
sudo apt install certbot python3-certbot-nginx -y
```

### Obtain SSL Certificate
Replace `yourdomain.com` with your actual domain:
```bash
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com
```

## 5. Nginx Configuration

### Create nginx Configuration
Create `/etc/nginx/sites-available/poemlens`:
```nginx
server {
    listen 80;
    server_name yourdomain.com www.yourdomain.com;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name yourdomain.com www.yourdomain.com;

    # SSL Configuration
    ssl_certificate /etc/letsencrypt/live/yourdomain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/yourdomain.com/privkey.pem;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;
    ssl_prefer_server_ciphers on;

    # Security Headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header Referrer-Policy "strict-origin-when-cross-origin" always;
    add_header Content-Security-Policy "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline' fonts.googleapis.com; font-src 'self' fonts.gstatic.com; img-src 'self' data: blob: https:; connect-src 'self' https://api.openai.com;" always;

    # PWA Requirements
    add_header Service-Worker-Allowed "/" always;

    # File Upload Limits
    client_max_body_size 10M;

    # Root directory
    root /var/www/poemlens/dist;
    index index.html;

    # Gzip Compression
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_types text/plain text/css text/xml text/javascript application/javascript application/xml+rss application/json;

    # Static Assets with Cache Headers
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
        try_files $uri =404;
    }

    # API Routes to Node.js Application
    location /api {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        proxy_read_timeout 300s;
        proxy_connect_timeout 300s;
    }

    # Upload endpoint with increased limits
    location /api/upload {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        client_max_body_size 10M;
        proxy_read_timeout 300s;
        proxy_connect_timeout 300s;
    }

    # PWA Manifest and Service Worker
    location = /manifest.json {
        add_header Content-Type application/manifest+json;
        try_files $uri =404;
    }

    location = /sw.js {
        add_header Content-Type application/javascript;
        add_header Service-Worker-Allowed "/";
        try_files $uri =404;
    }

    # SPA Routing - All other requests to index.html
    location / {
        try_files $uri $uri/ /index.html;
        
        # PWA Headers for main app
        add_header Cache-Control "no-cache";
    }

    # Error Pages
    error_page 500 502 503 504 /50x.html;
    location = /50x.html {
        root /var/www/html;
    }
}
```

### Enable Site Configuration
```bash
sudo ln -s /etc/nginx/sites-available/poemlens /etc/nginx/sites-enabled/
sudo rm /etc/nginx/sites-enabled/default  # Remove default site
sudo nginx -t  # Test configuration
sudo systemctl reload nginx
```

## 6. Process Management with PM2

### Create PM2 Ecosystem File
Create `/var/www/poemlens/ecosystem.config.js`:
```javascript
module.exports = {
  apps: [{
    name: 'poemlens',
    script: './server/index.js',
    instances: 'max',
    exec_mode: 'cluster',
    env: {
      NODE_ENV: 'production',
      PORT: 3000
    },
    error_file: '/var/log/poemlens/error.log',
    out_file: '/var/log/poemlens/out.log',
    log_file: '/var/log/poemlens/combined.log',
    time: true,
    max_memory_restart: '500M'
  }]
};
```

### Create Log Directory
```bash
sudo mkdir -p /var/log/poemlens
sudo chown $USER:$USER /var/log/poemlens
```

### Start Application with PM2
```bash
cd /var/www/poemlens
pm2 start ecosystem.config.js
pm2 save
pm2 startup
```

## 7. Firewall Configuration

### Configure UFW
```bash
sudo ufw allow 22/tcp      # SSH
sudo ufw allow 80/tcp      # HTTP
sudo ufw allow 443/tcp     # HTTPS
sudo ufw allow 5432/tcp    # PostgreSQL (if external access needed)
sudo ufw enable
```

## 8. Monitoring and Maintenance

### PM2 Monitoring
```bash
pm2 status              # Check application status
pm2 logs poemlens       # View logs
pm2 restart poemlens    # Restart application
pm2 monit              # Monitor resources
```

### nginx Logs
```bash
sudo tail -f /var/log/nginx/access.log
sudo tail -f /var/log/nginx/error.log
```

### SSL Certificate Renewal
Certbot auto-renewal is typically configured automatically. To test:
```bash
sudo certbot renew --dry-run
```

## 9. Backup Strategy

### Database Backup Script
Create `/home/ubuntu/backup_db.sh`:
```bash
#!/bin/bash
BACKUP_DIR="/home/ubuntu/backups"
DATE=$(date +%Y%m%d_%H%M%S)
mkdir -p $BACKUP_DIR

pg_dump -h localhost -U poemlens_user -d poemlens > $BACKUP_DIR/poemlens_$DATE.sql

# Keep only last 7 days of backups
find $BACKUP_DIR -name "poemlens_*.sql" -mtime +7 -delete
```

Make executable and add to crontab:
```bash
chmod +x /home/ubuntu/backup_db.sh
crontab -e
# Add: 0 2 * * * /home/ubuntu/backup_db.sh
```

## 10. Security Hardening

### Disable SSH Root Login
Edit `/etc/ssh/sshd_config`:
```
PermitRootLogin no
PasswordAuthentication no
```

Restart SSH:
```bash
sudo systemctl restart ssh
```

### Setup Fail2Ban
```bash
sudo apt install fail2ban -y
sudo systemctl enable fail2ban
sudo systemctl start fail2ban
```

## 11. Performance Optimization

### PostgreSQL Tuning
Edit `/etc/postgresql/*/main/postgresql.conf`:
```
shared_buffers = 256MB
effective_cache_size = 1GB
work_mem = 4MB
maintenance_work_mem = 64MB
```

Restart PostgreSQL:
```bash
sudo systemctl restart postgresql
```

### nginx Performance
Add to nginx configuration:
```nginx
worker_processes auto;
worker_connections 1024;
keepalive_timeout 65;
```

## 12. Deployment Updates

### Application Update Script
Create `/var/www/poemlens/update.sh`:
```bash
#!/bin/bash
cd /var/www/poemlens

# Pull latest changes
git pull origin main

# Install dependencies
npm install

# Build application
npm run build

# Run migrations if needed
npm run db:push

# Restart application
pm2 restart poemlens

echo "Deployment completed successfully!"
```

Make executable:
```bash
chmod +x /var/www/poemlens/update.sh
```

## Troubleshooting

### Common Issues

1. **Camera not working**: Ensure HTTPS is properly configured
2. **OpenAI API errors**: Check API key and billing credits
3. **Database connection issues**: Verify DATABASE_URL and PostgreSQL service
4. **File upload failures**: Check nginx `client_max_body_size` setting
5. **PWA not installing**: Verify manifest.json and service worker are accessible

### Health Check Endpoint
Add to your Express application:
```javascript
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});
```

Test with:
```bash
curl https://yourdomain.com/api/health
```

## Domain Configuration Checklist

- [ ] Domain DNS points to server IP
- [ ] SSL certificate obtained and configured
- [ ] nginx configuration updated with correct domain
- [ ] Firewall allows HTTP/HTTPS traffic
- [ ] PWA manifest configured with correct domain
- [ ] CORS settings updated if needed

## Production Environment Variables

Ensure these are set in your production `.env`:
- `NODE_ENV=production`
- `DATABASE_URL` with production database credentials
- `OPENAI_API_KEY` with valid API key
- `SESSION_SECRET` with a long, random string

## Final Notes

- This PWA requires HTTPS for camera access and full PWA functionality
- Monitor your OpenAI API usage to avoid unexpected charges
- Regular backups are essential for production deployments
- Consider setting up monitoring tools like Grafana or New Relic for production

Your PoemLens application should now be fully deployed and accessible at your domain!