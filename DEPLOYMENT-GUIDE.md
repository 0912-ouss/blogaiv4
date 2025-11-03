# 🚀 Quick Deployment Guide

## Pre-Deployment Checklist

### ✅ Step 1: Prepare Environment Variables

1. Copy `.env.example` to `.env`:
   ```bash
   cd "auto blog-appv1"
   copy .env.example .env
   ```

2. Generate secure JWT secret:
   ```bash
   # Windows PowerShell
   [Convert]::ToBase64String([System.Text.Encoding]::UTF8.GetBytes([System.Security.Cryptography.RandomNumberGenerator]::GetBytes(32)))
   
   # Or use online tool: https://generate-secret.vercel.app/32
   ```

3. Fill in all `.env` values (see PRODUCTION-READINESS-CHECKLIST.md)

### ✅ Step 2: Build Admin Panel

```bash
cd admin-panel
npm install --legacy-peer-deps
npm run build
```

### ✅ Step 3: Database Setup

Run these SQL commands in Supabase SQL Editor:

```sql
-- Create analytics_views table
CREATE TABLE IF NOT EXISTS analytics_views (
    id SERIAL PRIMARY KEY,
    article_id INTEGER REFERENCES articles(id),
    ip_address VARCHAR(45),
    user_agent TEXT,
    referer TEXT,
    referral_source VARCHAR(100),
    referral_medium VARCHAR(50),
    url TEXT,
    country VARCHAR(100),
    city VARCHAR(100),
    region VARCHAR(100),
    timestamp TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_analytics_article ON analytics_views(article_id);
CREATE INDEX IF NOT EXISTS idx_analytics_timestamp ON analytics_views(timestamp);
CREATE INDEX IF NOT EXISTS idx_analytics_referral ON analytics_views(referral_source);

-- Add social auth columns
ALTER TABLE admin_users 
ADD COLUMN IF NOT EXISTS social_provider VARCHAR(50),
ADD COLUMN IF NOT EXISTS social_provider_id VARCHAR(255),
ADD COLUMN IF NOT EXISTS email_verified BOOLEAN DEFAULT false;
```

---

## Deployment Options

### Option A: Railway (Recommended - Easiest)

1. **Sign up:** https://railway.app
2. **New Project** → **Deploy from GitHub**
3. **Select repository**
4. **Add Environment Variables** (from your `.env`)
5. **Deploy** - Automatic!

**Railway automatically:**
- ✅ Detects Node.js
- ✅ Runs `npm install`
- ✅ Runs `npm start`
- ✅ Provides HTTPS
- ✅ Supports WebSocket

---

### Option B: Render

1. **Sign up:** https://render.com
2. **New Web Service**
3. **Connect GitHub**
4. **Settings:**
   - Build Command: `npm install`
   - Start Command: `node server.js`
   - Environment: Node
5. **Add Environment Variables**
6. **Deploy**

---

### Option C: Heroku

1. **Install Heroku CLI:**
   ```bash
   npm install -g heroku
   ```

2. **Login:**
   ```bash
   heroku login
   ```

3. **Create app:**
   ```bash
   cd "auto blog-appv1"
   heroku create your-blog-name
   ```

4. **Set environment variables:**
   ```bash
   heroku config:set NODE_ENV=production
   heroku config:set JWT_SECRET=your-secret-here
   # ... add all other env vars
   ```

5. **Deploy:**
   ```bash
   git push heroku main
   ```

---

### Option D: VPS (DigitalOcean, AWS EC2, etc.)

#### Step 1: Server Setup

```bash
# SSH into your server
ssh root@your-server-ip

# Update system
apt update && apt upgrade -y

# Install Node.js 18+
curl -fsSL https://deb.nodesource.com/setup_18.x | bash -
apt install -y nodejs

# Install PM2
npm install -g pm2

# Install Nginx
apt install -y nginx
```

#### Step 2: Deploy Application

```bash
# Clone repository
git clone https://github.com/your-username/your-repo.git
cd your-repo/auto\ blog-appv1

# Install dependencies
npm install --production

# Copy .env file
nano .env  # Add your production env vars

# Start with PM2
pm2 start server.js --name blog-api
pm2 save
pm2 startup  # Follow instructions
```

#### Step 3: Configure Nginx

```nginx
# /etc/nginx/sites-available/blog
server {
    listen 80;
    server_name yourdomain.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

```bash
# Enable site
ln -s /etc/nginx/sites-available/blog /etc/nginx/sites-enabled/
nginx -t
systemctl restart nginx
```

#### Step 4: SSL with Let's Encrypt

```bash
# Install Certbot
apt install -y certbot python3-certbot-nginx

# Get SSL certificate
certbot --nginx -d yourdomain.com

# Auto-renewal (already configured)
```

---

## Post-Deployment

### 1. Test Everything

- [ ] Visit `https://yourdomain.com` - Blog loads
- [ ] Visit `https://yourdomain.com/api/health` - API works
- [ ] Login to admin panel
- [ ] Create test article
- [ ] Test comment system
- [ ] Test email notifications

### 2. Change Default Password

**CRITICAL:** Login and change default admin password immediately!

### 3. Set Up Monitoring

- [ ] Uptime monitoring (UptimeRobot.com)
- [ ] Error tracking (Sentry.io)
- [ ] Analytics (Google Analytics)

### 4. Configure Backups

- [ ] Supabase automatic backups (check dashboard)
- [ ] Document restore process

---

## Troubleshooting

### Server won't start
- Check environment variables are set
- Check logs: `pm2 logs blog-api`
- Verify database connection

### WebSocket not working
- Check firewall allows WebSocket connections
- Verify Nginx proxy WebSocket headers
- Check CORS settings

### Email not sending
- Verify email service credentials
- Check email service provider dashboard
- Test with email test endpoint

### Admin panel not loading
- Build admin panel: `cd admin-panel && npm run build`
- Check API URL in admin panel `.env`
- Verify CORS allows admin domain

---

## Need Help?

Check `PRODUCTION-READINESS-CHECKLIST.md` for detailed requirements.

