# 🚀 Laravel Forge Deployment - Quick Start

All the files you need to deploy your Node.js blog to Laravel Forge.

## 📁 Files Overview

| File | Purpose |
|------|---------|
| `FORGE-SETUP-GUIDE.md` | Quick step-by-step setup guide |
| `FORGE-CHECKLIST.md` | Complete deployment checklist |
| `FORGE-NGINX-CONFIG.conf` | Ready-to-use Nginx configuration |
| `FORGE-ENV-TEMPLATE.env` | Environment variables template |
| `FORGE-DEPLOY-SCRIPT.sh` | Deployment script for Forge |
| `forge-quick-setup.sh` | Automated server setup script |
| `LARAVEL-FORGE-DEPLOYMENT.md` | Complete detailed guide |

## ⚡ Quick Start (5 Steps)

### 1. Upload Code to Server
Upload your project to `/home/forge/YOUR-DOMAIN-NAME/` via Git or SFTP

### 2. Run Quick Setup Script
```bash
ssh forge@yourdomain.com
bash forge-quick-setup.sh yourdomain.com
```

### 3. Configure Environment Variables
In Forge: **Site → Environment**
Copy variables from `FORGE-ENV-TEMPLATE.env` and fill in your values

### 4. Configure Nginx
In Forge: **Site → Nginx → Edit Configuration**
Copy contents from `FORGE-NGINX-CONFIG.conf`
Replace `YOUR-DOMAIN-NAME` and site ID, then save

### 5. Set Up SSL
In Forge: **Site → SSL → Let's Encrypt**
Select your domains and obtain certificate

## 📝 Important Notes

### Before Deployment

1. **Update `ecosystem.config.js`**
   - Replace `YOUR-DOMAIN-NAME` with your actual domain
   - File location: `auto blog-appv1/ecosystem.config.js`

2. **Update Nginx Config**
   - Replace `YOUR-DOMAIN-NAME` with your actual domain
   - Replace `2914617` with your site ID (from error log path)

3. **Set Environment Variables**
   - Use Forge's Environment tab (not `.env` file)
   - Generate a strong `JWT_SECRET` (min 32 characters)

### Node.js Version

✅ **Compatible:** Node.js v22.20.0 (confirmed)

Your setup is compatible with Node.js 22. No changes needed.

## 🔍 Verification

After deployment, test:

```bash
# Check PM2 status
pm2 status

# Check logs
pm2 logs blog-api

# Test endpoints
curl https://yourdomain.com/api/health
```

## 🐛 Common Issues

### 404 Not Found
- Check Nginx root directory is correct
- Verify files exist in the directory
- Check Nginx error logs

### 502 Bad Gateway
- Check if Node.js app is running: `pm2 status`
- Check PM2 logs: `pm2 logs blog-api`
- Verify port 3000 is listening

### Environment Variables Not Working
- Check variables are set in Forge Environment tab
- Restart PM2: `pm2 restart blog-api`
- Verify `.env` file exists: `cat /home/forge/YOUR-DOMAIN-NAME/.env`

## 📚 Detailed Guides

- **Full Guide:** See `LARAVEL-FORGE-DEPLOYMENT.md`
- **Quick Reference:** See `FORGE-SETUP-GUIDE.md`
- **Checklist:** See `FORGE-CHECKLIST.md`

## 🆘 Need Help?

1. Check `FORGE-CHECKLIST.md` - Did you complete all steps?
2. Check PM2 logs: `pm2 logs blog-api --lines 100`
3. Check Nginx logs: `sudo tail -f /var/log/nginx/error.log`
4. Verify file paths and permissions

---

**Ready to deploy?** Start with `FORGE-SETUP-GUIDE.md` or run `forge-quick-setup.sh` 🚀

