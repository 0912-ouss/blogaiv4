# ✅ READY TO DEPLOY - meganews.on-forge.com

**Status:** All configuration files are ready! 🚀

## ✅ Configuration Complete

- ✅ Domain: `meganews.on-forge.com`
- ✅ Site ID: `2914617` (confirmed from Forge URL)
- ✅ `ecosystem.config.js` - Configured
- ✅ `FORGE-NGINX-CONFIG.conf` - Ready to copy/paste
- ✅ `FORGE-ENV-TEMPLATE.env` - Ready to use

## 🚀 Deployment Steps (In Order)

### Step 1: Upload Code to Server

Your code should be uploaded to:
```
/home/forge/meganews.on-forge.com/
├── auto blog-appv1/
│   ├── server.js
│   ├── package.json
│   └── ecosystem.config.js ✅
└── admin-panel/
    └── package.json
```

### Step 2: SSH & Install Dependencies

> **💡 Need help setting up SSH?** See `SSH-SETUP-GUIDE.md` for complete instructions.

```bash
# SSH into your server (using domain)
ssh forge@meganews.on-forge.com

# OR using IP address
ssh forge@129.212.140.35
```

**Both work the same!** ✅

# Navigate to site
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
pm2 startup  # Copy and run the command it shows
```

### Step 3: Configure Environment Variables

Go to: https://forge.laravel.com/source-dart/mainserver-9j2/2914617/environment

Click "Edit" and add these variables (update with your actual values):

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

Click "Save"

### Step 4: Configure Nginx ✅ READY

Go to: https://forge.laravel.com/source-dart/mainserver-9j2/2914617/nginx

1. Click "Edit Configuration"
2. **Select all existing content and delete it**
3. **Copy the ENTIRE contents of `FORGE-NGINX-CONFIG.conf`**
4. **Paste it into the editor**
5. Click "Save"
6. Click "Test Configuration" (should show "Configuration OK")
7. Click "Restart Nginx"

✅ **The Nginx config is already configured with:**
- Domain: `meganews.on-forge.com`
- Site ID: `2914617`
- All proxy settings for Node.js

### Step 5: Set Up SSL Certificate

Go to: https://forge.laravel.com/source-dart/mainserver-9j2/2914617/ssl

1. Click "Let's Encrypt"
2. Select: `meganews.on-forge.com`
3. Click "Obtain Certificate"
4. Wait 1-2 minutes for it to complete

### Step 6: Configure Deployment Script

Go to: https://forge.laravel.com/source-dart/mainserver-9j2/2914617/deploy-script

Click "Edit" and paste:

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

Click "Save"

## ✅ Verify Deployment

After completing all steps, test:

1. **Homepage:** https://meganews.on-forge.com
   - Should show your blog homepage

2. **API Health:** https://meganews.on-forge.com/api/health
   - Should return: `{"status":"OK","message":"Simple Blog API is running"}`

3. **Admin Panel:** https://meganews.on-forge.com/admin
   - Should show admin login page

### Check PM2 Status (SSH)

```bash
pm2 status
pm2 logs blog-api
```

## 🔗 Quick Links

- **Site Settings:** https://forge.laravel.com/source-dart/mainserver-9j2/2914617/settings
- **Environment:** https://forge.laravel.com/source-dart/mainserver-9j2/2914617/environment
- **Nginx:** https://forge.laravel.com/source-dart/mainserver-9j2/2914617/nginx
- **SSL:** https://forge.laravel.com/source-dart/mainserver-9j2/2914617/ssl
- **Deploy Script:** https://forge.laravel.com/source-dart/mainserver-9j2/2914617/deploy-script

## 🐛 Troubleshooting

### 404 Not Found
- Check PM2 is running: `pm2 status`
- Check files exist: `ls -la /home/forge/meganews.on-forge.com/auto\ blog-appv1/index.html`
- Check Nginx logs: `sudo tail -50 /var/log/nginx/2914617-error.log`

### 502 Bad Gateway
- Check PM2 logs: `pm2 logs blog-api --lines 100`
- Restart app: `pm2 restart blog-api`
- Verify port 3000: `sudo netstat -tulpn | grep 3000`

### App Not Starting
- Check environment variables: `pm2 env blog-api`
- Check logs: `pm2 logs blog-api`
- Verify dependencies installed: `cd /home/forge/meganews.on-forge.com/auto\ blog-appv1 && npm list`

## ✅ Final Checklist

- [ ] Code uploaded to server
- [ ] Dependencies installed (`npm install --production`)
- [ ] Admin panel built (`npm run build`)
- [ ] PM2 started (`pm2 start ecosystem.config.js`)
- [ ] Environment variables set in Forge
- [ ] Nginx configured (copy from `FORGE-NGINX-CONFIG.conf`)
- [ ] SSL certificate installed
- [ ] Deployment script configured
- [ ] Homepage loads
- [ ] API works (`/api/health`)
- [ ] Admin panel accessible

---

**You're all set!** 🎉

All configuration files are ready. Just follow the steps above and your site will be live!

