# ✅ Laravel Forge Deployment - Ready for meganews.on-forge.com

All configuration files have been updated with your domain: **meganews.on-forge.com**

## ✅ What's Been Configured

- ✅ `ecosystem.config.js` - Updated with your domain
- ✅ `FORGE-NGINX-CONFIG.conf` - Updated with your domain
- ✅ `FORGE-ENV-TEMPLATE.env` - Updated with your domain

## 🚀 Quick Deployment Steps

### 1. Upload Code to Server

Your code should be at:
```
/home/forge/meganews.on-forge.com/
├── auto blog-appv1/
│   ├── server.js
│   ├── package.json
│   └── ecosystem.config.js ✅ (already configured)
└── admin-panel/
    └── package.json
```

### 2. SSH into Server & Run Setup

```bash
ssh forge@meganews.on-forge.com

# Navigate to your site
cd /home/forge/meganews.on-forge.com

# Create logs directory
mkdir -p storage/logs

# Install backend dependencies
cd "auto blog-appv1"
npm install --production

# Build admin panel
cd ../admin-panel
npm install --legacy-peer-deps
npm run build

# Start with PM2
cd ../"auto blog-appv1"
pm2 start ecosystem.config.js
pm2 save
pm2 startup  # Follow the instructions shown
```

### 3. Configure Environment Variables in Forge

Go to: **Site → Environment** in Laravel Forge

Copy these (update with your actual values):

```env
NODE_ENV=production
PORT=3000
SITE_URL=https://meganews.on-forge.com

JWT_SECRET=your-super-strong-random-secret-key-min-32-chars
ALLOWED_ORIGINS=https://meganews.on-forge.com

SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
SUPABASE_ANON_KEY=your-anon-key

EMAIL_SERVICE=sendgrid
EMAIL_FROM=noreply@meganews.on-forge.com
SENDGRID_API_KEY=your-sendgrid-api-key
```

### 4. Configure Nginx in Forge

Go to: **Site → Nginx → Edit Configuration**

1. Copy contents from `FORGE-NGINX-CONFIG.conf`
2. **IMPORTANT:** Find your site ID in Forge (check the error log path, it will be something like `/var/log/nginx/1234567-error.log`)
3. Replace `2914617` in the config with your actual site ID
4. Click "Save"
5. Click "Test Configuration"
6. Click "Restart Nginx"

### 5. Set Up SSL Certificate

Go to: **Site → SSL → Let's Encrypt**

- Select: `meganews.on-forge.com`
- Click "Obtain Certificate"

### 6. Configure Deployment Script

Go to: **Site → Deploy Script**

Copy this:

```bash
cd /home/forge/meganews.on-forge.com
git pull origin main || true
cd "auto blog-appv1"
npm install --production
cd ../admin-panel
npm install --legacy-peer-deps
npm run build
cd ../"auto blog-appv1"
pm2 restart blog-api || pm2 start ecosystem.config.js
```

## 🔍 Verification

After setup, test these URLs:

- ✅ Homepage: `https://meganews.on-forge.com`
- ✅ API Health: `https://meganews.on-forge.com/api/health`
- ✅ Admin Panel: `https://meganews.on-forge.com/admin`

### Check PM2 Status

```bash
pm2 status
pm2 logs blog-api
```

## 📝 Important Notes

### Site ID in Nginx Config

You need to replace `2914617` in `FORGE-NGINX-CONFIG.conf` with your actual site ID.

**How to find it:**
1. In Forge, go to your site
2. Check the Nginx error log path (usually shown in the interface)
3. It will be: `/var/log/nginx/XXXXXXX-error.log`
4. The `XXXXXXX` is your site ID

### File Paths

All paths are configured for:
- Site Directory: `/home/forge/meganews.on-forge.com`
- Backend: `/home/forge/meganews.on-forge.com/auto blog-appv1`
- Admin Panel: `/home/forge/meganews.on-forge.com/admin-panel/build`
- Logs: `/home/forge/meganews.on-forge.com/storage/logs`

## 🐛 Troubleshooting

### If you get 404 errors:

```bash
# Check if files exist
ls -la /home/forge/meganews.on-forge.com/auto\ blog-appv1/index.html

# Check Nginx error logs
sudo tail -50 /var/log/nginx/YOUR-SITE-ID-error.log

# Check PM2 status
pm2 status
```

### If you get 502 errors:

```bash
# Check if app is running
pm2 status

# Check logs
pm2 logs blog-api --lines 100

# Restart app
pm2 restart blog-api
```

## ✅ Post-Deployment Checklist

- [ ] Homepage loads: `https://meganews.on-forge.com`
- [ ] API works: `https://meganews.on-forge.com/api/health`
- [ ] Admin panel loads: `https://meganews.on-forge.com/admin`
- [ ] SSL certificate is active
- [ ] PM2 is running and auto-restarts
- [ ] Environment variables are set
- [ ] Can login to admin panel

---

**Your site is ready to deploy!** 🚀

All configuration files are updated with `meganews.on-forge.com`. Just follow the steps above.

