# 🚀 Laravel Forge Deployment Guide

Complete guide for deploying your Auto Blog to Laravel Forge.

> **📚 Quick Reference Files:**
> - `FORGE-SETUP-GUIDE.md` - Quick setup reference
> - `FORGE-CHECKLIST.md` - Deployment checklist
> - `FORGE-NGINX-CONFIG.conf` - Ready-to-use Nginx configuration
> - `FORGE-ENV-TEMPLATE.env` - Environment variables template
> - `FORGE-DEPLOY-SCRIPT.sh` - Deployment script
> - `forge-quick-setup.sh` - Automated setup script

---

## 📋 Prerequisites

- [x] Node.js v22.20.0 installed on server
- [ ] Laravel Forge account (https://forge.laravel.com)
- [ ] Server provisioned in Forge (DigitalOcean, Linode, AWS, etc.)
- [ ] Domain name configured
- [ ] SSH access to server

---

## 🎯 Step-by-Step Deployment

### Step 1: Create a New Site in Forge

1. **Go to your server** in Forge dashboard
2. **Click "New Site"**
3. **Fill in details:**
   - **Domain:** `yourdomain.com` (or subdomain like `blog.yourdomain.com`)
   - **Project Type:** `Other` (from Static section - gives flexibility for Node.js)
   - **Web Directory:** `/public` (we'll change this after creation)
   - **Click "Create Site"**

---

### Step 2: Configure Site for Node.js

After site creation:

1. **Go to Site Settings** → **App**
2. **Change these settings:**
   - **App Directory:** `/home/forge/yourdomain.com` (root directory)
   - **Web Directory:** `/home/forge/yourdomain.com` (not `/public`)
   - **Isolation:** `None` (or create isolated user if preferred)

---

### Step 3: Set Up Deployment Script

1. **Go to Site** → **Deploy Script**
2. **Replace with this script:**

```bash
cd /home/forge/yourdomain.com

# Pull latest code (if using Git)
git pull origin main

# Install dependencies
npm install --production

# Build admin panel (if needed)
cd admin-panel
npm install --legacy-peer-deps
npm run build
cd ..

# Restart application
pm2 restart blog-api || pm2 start server.js --name blog-api
```

---

### Step 4: Upload Your Code

**Option A: Using Git (Recommended)**

1. **Push your code to GitHub/GitLab**
2. **In Forge:** Site → **App**
3. **Repository:** `git@github.com:yourusername/your-repo.git`
4. **Branch:** `main` (or your production branch)
5. **Click "Install Repository"**

**Option B: Using SFTP**

1. **Connect via SFTP** (use Forge's credentials)
2. **Upload entire project** to `/home/forge/yourdomain.com/`
3. **Upload structure:**
   ```
   /home/forge/yourdomain.com/
   ├── auto blog-appv1/
   │   ├── server.js
   │   ├── package.json
   │   └── ...
   └── admin-panel/
       ├── build/
       └── ...
   ```

---

### Step 5: Install Node.js and PM2

**SSH into your server** and run:

```bash
# Install Node.js 18.x (Forge usually has this, but verify)
node -v

# If not installed, add NodeSource repository
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Install PM2 globally
sudo npm install -g pm2

# Install PM2 startup script
pm2 startup systemd
# Follow the instructions shown (copy/paste the command)
```

---

### Step 6: Configure Environment Variables

1. **In Forge:** Site → **Environment**
2. **Add all these variables:**

```env
NODE_ENV=production
PORT=3000
SITE_URL=https://yourdomain.com

# Security
JWT_SECRET=your-super-strong-random-secret-key-min-32-chars
ALLOWED_ORIGINS=https://yourdomain.com,https://admin.yourdomain.com

# Database
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
SUPABASE_ANON_KEY=your-anon-key

# Email Service
EMAIL_SERVICE=sendgrid
EMAIL_FROM=noreply@yourdomain.com
SENDGRID_API_KEY=your-sendgrid-api-key

# Social Auth (Optional)
GOOGLE_CLIENT_ID=your-google-client-id
FACEBOOK_APP_ID=your-facebook-app-id

# Analytics (Optional)
GOOGLE_ANALYTICS_ID=G-XXXXXXXXXX
```

3. **Click "Save"**

---

### Step 7: Set Up Nginx Configuration

1. **In Forge:** Site → **Nginx**
2. **Click "Edit Configuration"**
3. **Replace with this configuration:**

```nginx
server {
    listen 80;
    listen [::]:80;
    server_name yourdomain.com;
    root /home/forge/yourdomain.com;

    # Add index files
    index index.html index.php;

    charset utf-8;

    # Logging
    access_log /home/forge/yourdomain.com/storage/logs/nginx/access.log;
    error_log /home/forge/yourdomain.com/storage/logs/nginx/error.log;

    # API and Backend Proxy
    location /api {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        proxy_read_timeout 300s;
        proxy_connect_timeout 75s;
    }

    # WebSocket support
    location /socket.io {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # RSS Feed
    location /feed.xml {
        proxy_pass http://127.0.0.1:3000;
        proxy_set_header Host $host;
    }

    # Serve static files from blog frontend
    location / {
        try_files $uri $uri/ /index.html;
        root /home/forge/yourdomain.com/auto\ blog-appv1;
    }

    # Serve admin panel (if deploying separately)
    location /admin {
        alias /home/forge/yourdomain.com/admin-panel/build;
        try_files $uri $uri/ /admin/index.html;
    }

    # Deny access to hidden files
    location ~ /\. {
        deny all;
    }
}
```

4. **Click "Save"**
5. **Click "Restart Nginx"**

---

### Step 8: Configure SSL Certificate

1. **In Forge:** Site → **SSL**
2. **Click "Let's Encrypt"**
3. **Select domains:**
   - `yourdomain.com`
   - `www.yourdomain.com` (if you want)
4. **Click "Obtain Certificate"**
5. **Wait for SSL to be configured** (usually 1-2 minutes)

---

### Step 9: Set Up Process Management (PM2)

**SSH into server** and run:

```bash
cd /home/forge/yourdomain.com/auto\ blog-appv1

# Create PM2 ecosystem file
cat > ecosystem.config.js << 'EOF'
module.exports = {
  apps: [{
    name: 'blog-api',
    script: 'server.js',
    cwd: '/home/forge/yourdomain.com/auto blog-appv1',
    instances: 1,
    exec_mode: 'fork',
    env: {
      NODE_ENV: 'production',
      PORT: 3000
    },
    error_file: '/home/forge/yourdomain.com/storage/logs/pm2-error.log',
    out_file: '/home/forge/yourdomain.com/storage/logs/pm2-out.log',
    log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
    merge_logs: true,
    autorestart: true,
    max_memory_restart: '500M',
    watch: false
  }]
};
EOF

# Start application with PM2
pm2 start ecosystem.config.js

# Save PM2 configuration
pm2 save

# Ensure PM2 starts on server reboot
pm2 startup
# Follow the instructions shown
```

---

### Step 10: Create Database Tables

1. **Go to Supabase Dashboard** → **SQL Editor**
2. **Run this SQL:**

```sql
-- Analytics Views Table
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

-- Add social auth columns to admin_users
ALTER TABLE admin_users 
ADD COLUMN IF NOT EXISTS social_provider VARCHAR(50),
ADD COLUMN IF NOT EXISTS social_provider_id VARCHAR(255),
ADD COLUMN IF NOT EXISTS email_verified BOOLEAN DEFAULT false;
```

---

### Step 11: Build Admin Panel

**SSH into server:**

```bash
cd /home/forge/yourdomain.com/admin-panel

# Install dependencies
npm install --legacy-peer-deps

# Build for production
npm run build

# The build output will be in /home/forge/yourdomain.com/admin-panel/build
```

---

### Step 12: Test Deployment

1. **Visit:** `https://yourdomain.com`
   - Should show blog homepage

2. **Visit:** `https://yourdomain.com/api/health`
   - Should return: `{"status":"OK","message":"Simple Blog API is running"}`

3. **Visit:** `https://yourdomain.com/admin`
   - Should show admin panel login

4. **SSH and check PM2:**
   ```bash
   pm2 status
   pm2 logs blog-api
   ```

---

## 🔧 Advanced Configuration

### Setting Up Cron Jobs

If you need scheduled tasks (article scheduler, etc.):

1. **In Forge:** Site → **Scheduler**
2. **Add cron job:**
   ```
   * * * * * cd /home/forge/yourdomain.com/auto\ blog-appv1 && node jobs/articleScheduler.js
   ```

### Setting Up Queues (Optional)

If you need background job processing:

1. **Install Redis:**
   ```bash
   sudo apt install redis-server
   ```

2. **Configure in your app** (if needed)

### Setting Up Backups

1. **In Forge:** Site → **Backups**
2. **Enable Database Backups** (if using Forge's database)
3. **Or configure Supabase backups** in Supabase dashboard

---

## 📊 Monitoring & Logs

### View Application Logs

```bash
# PM2 logs
pm2 logs blog-api

# Nginx logs
tail -f /home/forge/yourdomain.com/storage/logs/nginx/access.log
tail -f /home/forge/yourdomain.com/storage/logs/nginx/error.log

# Application logs (if you add file logging)
tail -f /home/forge/yourdomain.com/storage/logs/app.log
```

### Monitor Application

```bash
# PM2 monitoring
pm2 monit

# Check status
pm2 status
pm2 info blog-api
```

---

## 🔄 Deployment Workflow

### First-Time Deployment

1. Upload code to server
2. Set environment variables
3. Install dependencies: `npm install --production`
4. Build admin panel: `cd admin-panel && npm run build`
5. Start PM2: `pm2 start ecosystem.config.js`
6. Configure Nginx
7. Set up SSL

### Future Deployments

**Option 1: Using Forge Deploy Script**

1. **In Forge:** Site → **Deploy Script**
2. **Click "Deploy Now"** (or push to Git if auto-deploy enabled)

**Option 2: Manual Deployment**

```bash
# SSH into server
ssh forge@yourdomain.com

# Navigate to site
cd /home/forge/yourdomain.com

# Pull latest code (if using Git)
git pull origin main

# Install dependencies
cd "auto blog-appv1"
npm install --production

# Build admin panel
cd ../admin-panel
npm install --legacy-peer-deps
npm run build

# Restart application
pm2 restart blog-api
```

---

## 🐛 Troubleshooting

### Application Not Starting

```bash
# Check PM2 status
pm2 status

# Check logs
pm2 logs blog-api --lines 100

# Check if port is in use
sudo netstat -tulpn | grep 3000

# Restart PM2
pm2 restart blog-api
```

### 502 Bad Gateway

- Check if Node.js app is running: `pm2 status`
- Check Nginx error logs: `tail -f /home/forge/yourdomain.com/storage/logs/nginx/error.log`
- Verify proxy_pass URL in Nginx config
- Check firewall: `sudo ufw status`

### WebSocket Not Working

- Verify Nginx has WebSocket configuration (`/socket.io` location)
- Check CORS settings in your app
- Verify firewall allows WebSocket connections

### Admin Panel Not Loading

- Verify admin panel is built: `ls -la /home/forge/yourdomain.com/admin-panel/build`
- Check Nginx configuration for `/admin` location
- Verify API URL in admin panel environment variables

### Environment Variables Not Working

- Verify variables are set in Forge: Site → Environment
- Restart PM2: `pm2 restart blog-api`
- Check if `.env` file exists (should use Forge's environment, not `.env`)

---

## ✅ Post-Deployment Checklist

- [ ] Blog homepage loads correctly
- [ ] API endpoints work (`/api/health`)
- [ ] Admin panel loads and login works
- [ ] Can create/edit articles
- [ ] Comments system works
- [ ] Email notifications send
- [ ] WebSocket connections work
- [ ] SSL certificate is active
- [ ] PM2 is running and auto-restarts
- [ ] Changed default admin password
- [ ] Set up monitoring/alerts

---

## 🎯 Quick Reference Commands

```bash
# SSH into server
ssh forge@yourdomain.com

# Navigate to site
cd /home/forge/yourdomain.com

# PM2 commands
pm2 status
pm2 logs blog-api
pm2 restart blog-api
pm2 stop blog-api
pm2 start blog-api

# Nginx commands
sudo nginx -t                    # Test config
sudo systemctl reload nginx      # Reload config
sudo systemctl restart nginx     # Restart Nginx

# View logs
tail -f /home/forge/yourdomain.com/storage/logs/nginx/error.log
pm2 logs blog-api --lines 50
```

---

## 📝 Notes

- **Port:** Your app runs on port 3000, Nginx proxies to it
- **WebSocket:** Make sure Nginx `/socket.io` location is configured
- **Static Files:** Serve from `auto blog-appv1` directory
- **Admin Panel:** Serve from `admin-panel/build` directory
- **Environment:** Use Forge's Environment tab, not `.env` file
- **Process Manager:** PM2 handles app restarts and crashes

---

## 🆘 Need Help?

- **Forge Documentation:** https://forge.laravel.com/docs
- **PM2 Documentation:** https://pm2.keymetrics.io/docs
- **Nginx Documentation:** https://nginx.org/en/docs/

---

**Your blog should now be live at: `https://yourdomain.com`** 🎉

