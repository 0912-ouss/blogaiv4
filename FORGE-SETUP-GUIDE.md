# 🚀 Laravel Forge Setup Guide - Quick Reference

## ✅ Prerequisites Checklist

- [x] Node.js v22.20.0 installed
- [ ] PM2 installed globally
- [ ] Code uploaded to server
- [ ] Environment variables configured in Forge
- [ ] Nginx configured
- [ ] SSL certificate installed

---

## 📋 Step-by-Step Setup

### 1. Install PM2 (if not already installed)

```bash
sudo npm install -g pm2
pm2 -v  # Verify installation
```

### 2. Create Logs Directory

```bash
mkdir -p /home/forge/YOUR-DOMAIN-NAME/storage/logs
```

### 3. Update ecosystem.config.js

**IMPORTANT:** Replace `YOUR-DOMAIN-NAME` with your actual domain in `ecosystem.config.js`

Example: If your domain is `blog.example.com`, change:
- `/home/forge/YOUR-DOMAIN-NAME/` → `/home/forge/blog.example.com/`

### 4. Set Up Environment Variables in Forge

Go to: **Site → Environment**

Add these variables:

```env
NODE_ENV=production
PORT=3000
SITE_URL=https://yourdomain.com

JWT_SECRET=your-super-strong-random-secret-key-min-32-chars
ALLOWED_ORIGINS=https://yourdomain.com,https://admin.yourdomain.com

SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
SUPABASE_ANON_KEY=your-anon-key

EMAIL_SERVICE=sendgrid
EMAIL_FROM=noreply@yourdomain.com
SENDGRID_API_KEY=your-sendgrid-api-key
```

### 5. Install Dependencies & Build

```bash
cd /home/forge/YOUR-DOMAIN-NAME

# Backend
cd "auto blog-appv1"
npm install --production

# Admin Panel
cd ../admin-panel
npm install --legacy-peer-deps
npm run build
```

### 6. Start Application with PM2

```bash
cd /home/forge/YOUR-DOMAIN-NAME/auto\ blog-appv1

# Start the app
pm2 start ecosystem.config.js

# Save PM2 configuration
pm2 save

# Set up auto-start on reboot
pm2 startup
# Copy and run the command it shows you
```

### 7. Configure Nginx in Forge

Go to: **Site → Nginx → Edit Configuration**

Use the Nginx config from `LARAVEL-FORGE-DEPLOYMENT.md` Step 7

**Remember to replace:**
- `YOUR-DOMAIN-NAME` with your actual domain
- `2914617` with your site ID (from error log path)

### 8. Set Up SSL

Go to: **Site → SSL → Let's Encrypt**

Select your domains and click "Obtain Certificate"

### 9. Configure Deployment Script

Go to: **Site → Deploy Script**

Copy the contents of `FORGE-DEPLOY-SCRIPT.sh` or use:

```bash
cd /home/forge/YOUR-DOMAIN-NAME
git pull origin main || true
cd "auto blog-appv1"
npm install --production
cd ../admin-panel
npm install --legacy-peer-deps
npm run build
cd ../"auto blog-appv1"
pm2 restart blog-api || pm2 start ecosystem.config.js
```

---

## 🔍 Verification

### Check Application Status

```bash
pm2 status
pm2 logs blog-api --lines 50
```

### Test Endpoints

- Homepage: `https://yourdomain.com`
- API Health: `https://yourdomain.com/api/health`
- Admin Panel: `https://yourdomain.com/admin`

### Check Logs

```bash
# PM2 logs
pm2 logs blog-api

# Nginx error logs
sudo tail -f /var/log/nginx/YOUR-SITE-ID-error.log

# Application logs
tail -f /home/forge/YOUR-DOMAIN-NAME/storage/logs/pm2-error.log
```

---

## 🐛 Troubleshooting

### App Not Starting

```bash
pm2 logs blog-api --lines 100
pm2 restart blog-api
```

### 502 Bad Gateway

1. Check if app is running: `pm2 status`
2. Check Nginx logs: `sudo tail -f /var/log/nginx/error.log`
3. Verify port 3000: `sudo netstat -tulpn | grep 3000`

### Environment Variables Not Loading

1. Check in Forge: Site → Environment
2. Restart PM2: `pm2 restart blog-api`
3. Check loaded env: `pm2 env blog-api`

---

## 📝 Quick Commands Reference

```bash
# PM2
pm2 status              # Status
pm2 logs blog-api       # Logs
pm2 restart blog-api    # Restart
pm2 stop blog-api       # Stop
pm2 start blog-api      # Start
pm2 monit               # Monitor

# Nginx
sudo nginx -t           # Test config
sudo systemctl reload nginx  # Reload

# Node.js
node -v                 # Version
npm -v                  # npm version
```

---

## ✅ Post-Deployment Checklist

- [ ] Homepage loads correctly
- [ ] API endpoints work (`/api/health`)
- [ ] Admin panel accessible
- [ ] SSL certificate active
- [ ] PM2 auto-restarts on crash
- [ ] Environment variables loaded
- [ ] Logs are being written

---

**Need help?** Check the full guide in `LARAVEL-FORGE-DEPLOYMENT.md`

