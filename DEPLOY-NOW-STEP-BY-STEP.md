# 🚀 Deploy to Laravel Forge - Step by Step

**Current Status:** Ready to deploy! Let's continue from where we left off.

---

## ✅ What's Already Done

- ✅ All config files ready (`ecosystem.config.js`, Nginx config, etc.)
- ✅ Domain configured: `meganews.on-forge.com`
- ✅ Site ID: `2914617`
- ✅ Server IP: `129.212.140.35`

---

## 🎯 Next Steps (In Order)

### Step 1: Finish SSH Setup 🔑

**You got "Permission denied" - need to add SSH key.**

#### A. Generate SSH Key (PowerShell)

```powershell
ssh-keygen -t ed25519 -C "your_email@example.com"
```

**Press Enter 3 times** (default location, no passphrase)

#### B. Copy Your Public Key

```powershell
type $env:USERPROFILE\.ssh\id_ed25519.pub
```

**Copy the entire output** (one long line)

#### C. Add Key to Forge

1. Go to: https://forge.laravel.com/source-dart/mainserver-9j2
2. Click **"SSH Keys"** in sidebar
3. Click **"Add key"**
4. **Name:** "My Windows PC"
5. **Key:** Paste your public key
6. Click **"Add Key"**

#### D. Test Connection

```powershell
ssh forge@129.212.140.35
```

**Should connect without password!** ✅

---

### Step 2: Upload Code to Server 📤

#### Option A: Using Git (Recommended)

1. **Push your code to GitHub/GitLab** (if not already)
2. In Forge: https://forge.laravel.com/source-dart/mainserver-9j2/2914617/app
3. **Repository:** Your Git repo URL
4. **Branch:** `main`
5. Click **"Install Repository"**

#### Option B: Using SFTP

1. **Get SFTP credentials** from Forge
2. **Connect** with FileZilla/WinSCP
3. **Upload** to `/home/forge/meganews.on-forge.com/`

**Structure should be:**
```
/home/forge/meganews.on-forge.com/
├── auto blog-appv1/
│   ├── server.js
│   ├── package.json
│   └── ecosystem.config.js
└── admin-panel/
    └── package.json
```

---

### Step 3: SSH & Install Dependencies 💻

**Connect via SSH:**

```powershell
ssh forge@129.212.140.35
```

**Once connected, run:**

```bash
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

# Go back to backend
cd ../"auto blog-appv1"
```

---

### Step 4: Configure Environment Variables 🔐

1. Go to: https://forge.laravel.com/source-dart/mainserver-9j2/2914617/environment
2. Click **"Edit"**
3. **Copy from `FORGE-ENV-TEMPLATE.env`** and fill in your values:

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

4. Click **"Save"**

---

### Step 5: Start Application with PM2 🚀

**Still in SSH, run:**

```bash
# Check if PM2 is installed
pm2 -v

# If not installed:
sudo npm install -g pm2

# Start the app
cd /home/forge/meganews.on-forge.com/auto\ blog-appv1
pm2 start ecosystem.config.js

# Save PM2 config
pm2 save

# Set up auto-start on reboot
pm2 startup
# Copy and run the command it shows you

# Check status
pm2 status
pm2 logs blog-api
```

**Should see:** `blog-api` running ✅

---

### Step 6: Configure Nginx 🌐

1. Go to: https://forge.laravel.com/source-dart/mainserver-9j2/2914617/nginx
2. Click **"Edit Configuration"**
3. **Select all existing content and DELETE it**
4. **Open `FORGE-NGINX-CONFIG.conf`** and copy ALL contents
5. **Paste** into Forge editor
6. Click **"Save"**
7. Click **"Test Configuration"** (should show "Configuration OK")
8. Click **"Restart Nginx"**

✅ **Nginx is now configured!**

---

### Step 7: Set Up SSL Certificate 🔒

1. Go to: https://forge.laravel.com/source-dart/mainserver-9j2/2914617/ssl
2. Click **"Let's Encrypt"**
3. Select: `meganews.on-forge.com`
4. Click **"Obtain Certificate"**
5. Wait 1-2 minutes

✅ **SSL will be active!**

---

### Step 8: Configure Deployment Script 📜

1. Go to: https://forge.laravel.com/source-dart/mainserver-9j2/2914617/deploy-script
2. Click **"Edit"**
3. **Paste this:**

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

4. Click **"Save"**

---

### Step 9: Test Your Deployment ✅

**Test these URLs:**

1. **Homepage:** https://meganews.on-forge.com
   - Should show your blog homepage

2. **API Health:** https://meganews.on-forge.com/api/health
   - Should return: `{"status":"OK","message":"Simple Blog API is running"}`

3. **Admin Panel:** https://meganews.on-forge.com/admin
   - Should show admin login page

**Check PM2 Status (SSH):**

```bash
pm2 status
pm2 logs blog-api --lines 50
```

---

## 🐛 Troubleshooting

### If Homepage Shows 404:

```bash
# Check if files exist
ls -la /home/forge/meganews.on-forge.com/auto\ blog-appv1/index.html

# Check PM2 status
pm2 status

# Check Nginx logs
sudo tail -50 /var/log/nginx/2914617-error.log
```

### If API Shows 502:

```bash
# Check if app is running
pm2 status

# Check logs
pm2 logs blog-api --lines 100

# Restart app
pm2 restart blog-api
```

### If App Not Starting:

```bash
# Check environment variables
pm2 env blog-api

# Check if port 3000 is available
sudo netstat -tulpn | grep 3000

# Check logs
pm2 logs blog-api
```

---

## ✅ Final Checklist

- [ ] SSH key added to Forge
- [ ] Can connect via SSH: `ssh forge@129.212.140.35`
- [ ] Code uploaded to server
- [ ] Dependencies installed (`npm install --production`)
- [ ] Admin panel built (`npm run build`)
- [ ] PM2 started (`pm2 start ecosystem.config.js`)
- [ ] Environment variables set in Forge
- [ ] Nginx configured (from `FORGE-NGINX-CONFIG.conf`)
- [ ] SSL certificate installed
- [ ] Deployment script configured
- [ ] Homepage loads: https://meganews.on-forge.com
- [ ] API works: https://meganews.on-forge.com/api/health
- [ ] Admin panel accessible: https://meganews.on-forge.com/admin

---

## 🎯 Quick Reference Links

- **SSH Keys:** https://forge.laravel.com/source-dart/mainserver-9j2 (SSH Keys)
- **Environment:** https://forge.laravel.com/source-dart/mainserver-9j2/2914617/environment
- **Nginx:** https://forge.laravel.com/source-dart/mainserver-9j2/2914617/nginx
- **SSL:** https://forge.laravel.com/source-dart/mainserver-9j2/2914617/ssl
- **Deploy Script:** https://forge.laravel.com/source-dart/mainserver-9j2/2914617/deploy-script
- **Site Settings:** https://forge.laravel.com/source-dart/mainserver-9j2/2914617/settings

---

## 🚀 Let's Start!

**Begin with Step 1: Finish SSH Setup**

1. Generate SSH key
2. Add to Forge
3. Test connection

**Then proceed through each step!**

---

**Need help with any step?** Check the detailed guides:
- `SSH-SETUP-GUIDE.md` - SSH setup
- `FIX-SSH-PERMISSION-DENIED.md` - SSH troubleshooting
- `READY-TO-DEPLOY.md` - Complete deployment guide

