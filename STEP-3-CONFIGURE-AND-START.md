# ⚙️ Step 3: Configure Environment & Start Application

**Status:** ✅ Build uploaded! Now let's configure and start the app.

---

## ✅ Step 1: Verify Upload (SSH)

**In your SSH terminal, verify:**

```bash
# Check build folder exists
ls -la admin-panel/build/

# Should see: index.html, static/, manifest.json, etc.
```

---

## 🔐 Step 2: Configure Environment Variables

### In Laravel Forge:

1. **Go to:** https://forge.laravel.com/source-dart/mainserver-9j2/2914617/environment
2. **Click "Edit"**
3. **Add these variables** (fill in your actual values):

```env
NODE_ENV=production
PORT=3000
SITE_URL=https://meganews.on-forge.com

JWT_SECRET=your-super-strong-random-secret-key-min-32-chars-change-this
ALLOWED_ORIGINS=https://meganews.on-forge.com

SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
SUPABASE_ANON_KEY=your-anon-key

EMAIL_SERVICE=sendgrid
EMAIL_FROM=noreply@meganews.on-forge.com
SENDGRID_API_KEY=your-sendgrid-api-key
```

4. **Click "Save"**

---

## 🚀 Step 3: Install PM2 (If Not Installed)

**In SSH terminal:**

```bash
# Check if PM2 is installed
pm2 -v

# If not installed:
sudo npm install -g pm2

# Verify installation
pm2 -v
```

---

## 📝 Step 4: Update ecosystem.config.js Path

**The path in ecosystem.config.js needs to match actual location:**

**In SSH:**

```bash
# Check current path
pwd
# Should be: /home/forge/meganews.on-forge.com/current

# Check ecosystem.config.js
cat "auto blog-appv1/ecosystem.config.js"
```

**If path is wrong, update it:**

```bash
# Edit ecosystem.config.js
nano "auto blog-appv1/ecosystem.config.js"
```

**Make sure paths are:**
```javascript
cwd: '/home/forge/meganews.on-forge.com/current/auto blog-appv1',
error_file: '/home/forge/meganews.on-forge.com/storage/logs/pm2-error.log',
out_file: '/home/forge/meganews.on-forge.com/storage/logs/pm2-out.log',
```

**Save:** `Ctrl+X`, then `Y`, then `Enter`

---

## 📁 Step 5: Create Logs Directory

```bash
# Go to site root
cd /home/forge/meganews.on-forge.com

# Create logs directory
mkdir -p storage/logs

# Verify
ls -la storage/logs/
```

---

## 🚀 Step 6: Start Application with PM2

```bash
# Go to backend directory
cd current/"auto blog-appv1"

# Start with PM2
pm2 start ecosystem.config.js

# Check status
pm2 status

# Should see 'blog-api' running ✅

# Save PM2 configuration
pm2 save

# Set up auto-start on reboot
pm2 startup
# Copy and run the command it shows you
```

---

## ✅ Step 7: Verify Application is Running

```bash
# Check PM2 status
pm2 status

# Check logs
pm2 logs blog-api --lines 50

# Test if app responds
curl http://localhost:3000/api/health
# Should return: {"status":"OK","message":"Simple Blog API is running"}
```

---

## 📋 Checklist

- [ ] Build folder verified on server
- [ ] Environment variables set in Forge
- [ ] PM2 installed
- [ ] ecosystem.config.js paths updated
- [ ] Logs directory created
- [ ] Application started with PM2
- [ ] PM2 status shows 'blog-api' running
- [ ] API health check works

---

## 🎯 Next Steps

After this is done:
1. ✅ Configure Nginx
2. ✅ Set up SSL certificate
3. ✅ Test your site!

---

**Run these commands and let me know when PM2 is running!** 🚀

