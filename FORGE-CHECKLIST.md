# ✅ Laravel Forge Deployment Checklist

Use this checklist to ensure everything is set up correctly.

## 📋 Pre-Deployment

- [ ] Node.js v22.20.0 installed on server (`node -v`)
- [ ] PM2 installed globally (`pm2 -v`)
- [ ] Git repository connected (or code uploaded via SFTP)
- [ ] Domain name configured in Forge

## 🔧 Server Setup

- [ ] Code uploaded to `/home/forge/YOUR-DOMAIN-NAME/`
- [ ] Project structure is correct:
  ```
  /home/forge/YOUR-DOMAIN-NAME/
  ├── auto blog-appv1/
  │   ├── server.js
  │   ├── package.json
  │   └── ecosystem.config.js
  └── admin-panel/
      ├── package.json
      └── build/ (after building)
  ```

## 📝 Configuration Files

- [ ] `ecosystem.config.js` updated with actual domain name
- [ ] Logs directory created: `/home/forge/YOUR-DOMAIN-NAME/storage/logs`
- [ ] Dependencies installed: `npm install --production` in `auto blog-appv1`
- [ ] Admin panel built: `npm run build` in `admin-panel`

## 🔐 Environment Variables

Configured in Forge: **Site → Environment**

- [ ] `NODE_ENV=production`
- [ ] `PORT=3000`
- [ ] `SITE_URL=https://yourdomain.com`
- [ ] `JWT_SECRET` (strong random string, min 32 chars)
- [ ] `ALLOWED_ORIGINS` (comma-separated URLs)
- [ ] `SUPABASE_URL`
- [ ] `SUPABASE_SERVICE_ROLE_KEY`
- [ ] `SUPABASE_ANON_KEY`
- [ ] `EMAIL_SERVICE` (sendgrid or other)
- [ ] `EMAIL_FROM`
- [ ] `SENDGRID_API_KEY` (if using SendGrid)

## 🚀 Application Setup

- [ ] PM2 process started: `pm2 start ecosystem.config.js`
- [ ] PM2 saved: `pm2 save`
- [ ] PM2 startup configured: `pm2 startup` (and ran the command)
- [ ] Application is running: `pm2 status` shows `blog-api` online

## 🌐 Nginx Configuration

Configured in Forge: **Site → Nginx → Edit Configuration**

- [ ] Root directory set: `/home/forge/YOUR-DOMAIN-NAME/auto\ blog-appv1`
- [ ] `/api` location proxies to `http://127.0.0.1:3000`
- [ ] `/socket.io` location configured for WebSocket
- [ ] `/admin` location serves admin panel
- [ ] Site ID replaced in `forge-conf/2914617/server/*`
- [ ] Configuration tested: `sudo nginx -t`
- [ ] Nginx restarted

## 🔒 SSL Certificate

Configured in Forge: **Site → SSL**

- [ ] Let's Encrypt certificate obtained
- [ ] SSL is active (HTTPS works)
- [ ] Certificate auto-renewal enabled

## 📜 Deployment Script

Configured in Forge: **Site → Deploy Script**

- [ ] Deployment script added (from `FORGE-DEPLOY-SCRIPT.sh`)
- [ ] Script tested manually or via Git push

## ✅ Testing

- [ ] Homepage loads: `https://yourdomain.com`
- [ ] API health check: `https://yourdomain.com/api/health`
  - Returns: `{"status":"OK","message":"Simple Blog API is running"}`
- [ ] Admin panel loads: `https://yourdomain.com/admin`
- [ ] Can login to admin panel
- [ ] API endpoints work
- [ ] Static files (CSS, JS, images) load correctly
- [ ] SSL certificate is valid (green lock in browser)

## 📊 Monitoring

- [ ] PM2 logs accessible: `pm2 logs blog-api`
- [ ] Nginx error logs accessible: `sudo tail -f /var/log/nginx/error.log`
- [ ] Application logs in: `/home/forge/YOUR-DOMAIN-NAME/storage/logs/`

## 🔄 Post-Deployment

- [ ] Changed default admin password
- [ ] Tested article creation/editing
- [ ] Tested comment system
- [ ] Verified email notifications work
- [ ] Set up monitoring/alerts (optional)
- [ ] Configured backups (optional)

## 🐛 Troubleshooting Checklist

If something doesn't work:

- [ ] Check PM2 status: `pm2 status`
- [ ] Check PM2 logs: `pm2 logs blog-api --lines 100`
- [ ] Check Nginx logs: `sudo tail -f /var/log/nginx/error.log`
- [ ] Verify port 3000 is listening: `sudo netstat -tulpn | grep 3000`
- [ ] Check environment variables: `pm2 env blog-api`
- [ ] Verify file permissions: `ls -la /home/forge/YOUR-DOMAIN-NAME/`
- [ ] Test Node.js app directly: `node server.js` (should start without errors)

---

## 📚 Quick Reference

**Files to update with your domain:**
- `ecosystem.config.js` - Replace `YOUR-DOMAIN-NAME`
- `FORGE-NGINX-CONFIG.conf` - Replace `YOUR-DOMAIN-NAME` and site ID
- Environment variables in Forge dashboard

**Useful Commands:**
```bash
pm2 status              # Check app status
pm2 logs blog-api       # View logs
pm2 restart blog-api    # Restart app
sudo nginx -t           # Test Nginx config
sudo systemctl reload nginx  # Reload Nginx
```

---

**Status:** ⬜ Not Started | 🟡 In Progress | ✅ Complete

