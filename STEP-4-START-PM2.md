# 🚀 Step 4: Start Application with PM2

**Status:** ✅ Build complete! Now let's start the app.

---

## 📁 Step 1: Create Logs Directory

**In SSH terminal:**

```bash
# Go back to site root
cd /home/forge/meganews.on-forge.com

# Create logs directory
mkdir -p storage/logs

# Verify
ls -la storage/logs/
```

---

## ⚙️ Step 2: Verify ecosystem.config.js

**Check if paths are correct:**

```bash
# Go to backend directory
cd current/"auto blog-appv1"

# Check the config file
cat ecosystem.config.js | grep -E "(cwd|error_file|out_file)"
```

**Should show:**
```
cwd: '/home/forge/meganews.on-forge.com/current/auto blog-appv1',
error_file: '/home/forge/meganews.on-forge.com/storage/logs/pm2-error.log',
out_file: '/home/forge/meganews.on-forge.com/storage/logs/pm2-out.log',
```

**If paths are wrong, edit:**
```bash
nano ecosystem.config.js
```

---

## 🔧 Step 3: Check Node.js & Install PM2

```bash
# Check Node.js version
node -v
# Should show: v22.20.0

# Check if PM2 is installed
pm2 -v

# If not installed:
sudo npm install -g pm2

# Verify PM2 installation
pm2 -v
```

---

## 🚀 Step 4: Start Application

**Make sure you're in the backend directory:**

```bash
# Verify current directory
pwd
# Should be: /home/forge/meganews.on-forge.com/current/auto blog-appv1

# Start with PM2
pm2 start ecosystem.config.js

# Check status
pm2 status

# Should see 'blog-api' online ✅
```

---

## 📊 Step 5: Configure PM2 Auto-Start

```bash
# Save PM2 configuration
pm2 save

# Set up auto-start on server reboot
pm2 startup

# Copy and run the command it shows you
# It will look like:
# sudo env PATH=... pm2 startup systemd -u forge --hp /home/forge
```

---

## ✅ Step 6: Verify Application is Running

```bash
# Check PM2 status
pm2 status

# Should show:
# ┌─────┬───────────┬─────────┬─────────┬─────────┐
# │ id  │ name      │ status  │ cpu     │ memory  │
# ├─────┼───────────┼─────────┼─────────┼─────────┤
# │ 0   │ blog-api  │ online  │ 0%      │ XX MB   │
# └─────┴───────────┴─────────┴─────────┴─────────┘

# Check logs
pm2 logs blog-api --lines 50

# Test API
curl http://localhost:3000/api/health

# Should return: {"status":"OK","message":"Simple Blog API is running"}
```

---

## 🐛 Troubleshooting

### App Not Starting

```bash
# Check logs
pm2 logs blog-api --lines 100

# Check if port 3000 is in use
sudo netstat -tulpn | grep 3000

# Restart app
pm2 restart blog-api
```

### Environment Variables Not Loading

```bash
# Check loaded environment
pm2 env blog-api

# Restart to reload .env
pm2 restart blog-api
```

### Port Already in Use

```bash
# Find what's using port 3000
sudo lsof -i :3000

# Kill process if needed
sudo kill -9 <PID>
```

---

## ✅ Checklist

- [ ] Logs directory created
- [ ] ecosystem.config.js paths verified
- [ ] Node.js version checked
- [ ] PM2 installed
- [ ] Application started with PM2
- [ ] PM2 status shows 'blog-api' online
- [ ] PM2 save executed
- [ ] PM2 startup configured
- [ ] API health check works

---

## 🎯 Next Steps

After PM2 is running:
1. ✅ Configure Nginx in Forge
2. ✅ Set up SSL certificate
3. ✅ Test your site!

---

**Run these commands and let me know when PM2 is running!** 🚀

