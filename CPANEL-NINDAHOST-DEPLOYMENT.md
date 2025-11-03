# 🚀 Deploy Node.js Project to cPanel (Nindohost)

Guide for deploying your Node.js blog to cPanel hosting like Nindohost.

---

## ⚠️ Important Note: cPanel Limitations

**cPanel is primarily designed for PHP/Laravel.** Node.js deployment on cPanel can be challenging:

### Challenges:
- ❌ **No native Node.js support** (need Node.js Manager app)
- ❌ **Limited Node.js versions** (depends on hosting)
- ❌ **Manual PM2 setup** (may not be available)
- ❌ **Port restrictions** (can't use port 3000 directly)
- ⚠️ **Less documentation** than Laravel Forge
- ⚠️ **More manual configuration**

### Advantages:
- ✅ **Cheaper** than VPS hosting
- ✅ **Easier for beginners** (if PHP)
- ✅ **cPanel interface** familiar to many

---

## ✅ Can You Deploy? Yes, But...

**Yes, you CAN deploy Node.js to cPanel**, but it requires:

1. ✅ **Node.js Manager** installed in cPanel
2. ✅ **Node.js version** available (v18+ recommended)
3. ✅ **Port/proxy configuration** setup
4. ✅ **PM2 or similar** process manager

---

## 🔍 Step 1: Check if Nindohost Supports Node.js

### Option A: Check cPanel Features

1. **Login to cPanel**
2. Look for **"Node.js Manager"** or **"Node.js Selector"** in the interface
3. If you see it → ✅ Node.js is supported
4. If you don't see it → ❌ May need to contact support

### Option B: Contact Nindohost Support

Ask them:
- "Do you support Node.js applications?"
- "Is Node.js Manager available in cPanel?"
- "What Node.js versions are available?"
- "Can I run Node.js apps on port 3000?"

---

## 📋 Step 2: Prepare Your Project

### 1. Update Package.json

Make sure your `package.json` has:

```json
{
  "name": "simple-blog",
  "version": "1.0.0",
  "main": "server.js",
  "scripts": {
    "start": "node server.js"
  },
  "engines": {
    "node": ">=18.0.0",
    "npm": ">=9.0.0"
  }
}
```

### 2. Create .htaccess for Apache (if needed)

Create `public/.htaccess`:

```apache
# Proxy requests to Node.js app
RewriteEngine On
RewriteRule ^api/(.*)$ http://localhost:3000/api/$1 [P,L]
RewriteRule ^socket.io/(.*)$ http://localhost:3000/socket.io/$1 [P,L]
```

### 3. Update Environment Variables

cPanel typically uses `.env` files in the root directory.

---

## 🚀 Step 3: Deployment Methods

### Method A: Using Node.js Manager (Recommended)

#### Step 1: Access Node.js Manager

1. Login to cPanel
2. Find **"Node.js Manager"** or **"Node.js Selector"**
3. Click on it

#### Step 2: Create Node.js App

1. Click **"Create Application"**
2. Fill in:
   - **Application Root:** `/home/username/public_html` or `/home/username/node`
   - **Application URL:** Choose domain/subdomain
   - **Application Startup File:** `server.js`
   - **Node.js Version:** Select v18+ or v22
   - **Application Mode:** Production

#### Step 3: Upload Files

1. **Upload your project** via File Manager or FTP:
   ```
   /home/username/public_html/
   ├── server.js
   ├── package.json
   ├── .env
   ├── auto blog-appv1/
   └── admin-panel/
   ```

2. **Install dependencies:**
   - In Node.js Manager, click **"Run NPM Install"**
   - Or SSH in and run: `npm install --production`

#### Step 4: Set Environment Variables

In Node.js Manager:
- Click **"Environment Variables"**
- Add all your variables:
  ```
  NODE_ENV=production
  PORT=3000
  SUPABASE_URL=...
  SUPABASE_SERVICE_ROLE_KEY=...
  ```

#### Step 5: Start Application

1. Click **"Start Application"** in Node.js Manager
2. Or restart if already running

---

### Method B: Using SSH + PM2 (If Available)

#### Step 1: SSH Access

1. Get SSH credentials from cPanel
2. Connect: `ssh username@yourdomain.com`

#### Step 2: Upload Files

```bash
# Via SCP or FTP
# Files should be in: /home/username/public_html/
```

#### Step 3: Install Dependencies

```bash
cd /home/username/public_html
npm install --production
```

#### Step 4: Install PM2

```bash
npm install -g pm2
```

#### Step 5: Create PM2 Config

```javascript
// ecosystem.config.js
module.exports = {
  apps: [{
    name: 'blog-api',
    script: 'server.js',
    cwd: '/home/username/public_html',
    env: {
      NODE_ENV: 'production',
      PORT: 3000
    }
  }]
};
```

#### Step 6: Start with PM2

```bash
pm2 start ecosystem.config.js
pm2 save
pm2 startup  # Follow instructions
```

---

### Method C: Using Apache Proxy (Alternative)

If Node.js Manager isn't available:

#### Step 1: Run Node.js on Different Port

Update `server.js` to use port from environment:

```javascript
const PORT = process.env.PORT || 3000;
```

#### Step 2: Create .htaccess

In `public_html/.htaccess`:

```apache
RewriteEngine On

# Proxy API requests
RewriteCond %{REQUEST_URI} ^/api
RewriteRule ^api/(.*)$ http://localhost:3000/api/$1 [P,L]

# Proxy WebSocket
RewriteCond %{REQUEST_URI} ^/socket.io
RewriteRule ^socket.io/(.*)$ http://localhost:3000/socket.io/$1 [P,L]

# Serve static files
RewriteCond %{REQUEST_FILENAME} !-f
RewriteCond %{REQUEST_FILENAME} !-d
RewriteRule ^(.*)$ index.html [L]
```

#### Step 3: Start Node.js via Cron

Create cron job that runs:
```bash
*/5 * * * * cd /home/username/public_html && node server.js
```

---

## 🔧 Step 4: Configure Nginx/Apache Proxy

### For Apache (.htaccess):

```apache
# Enable proxy modules (contact support if not enabled)
LoadModule proxy_module modules/mod_proxy.so
LoadModule proxy_http_module modules/mod_proxy_http.so

# Proxy to Node.js
ProxyPass /api http://localhost:3000/api
ProxyPassReverse /api http://localhost:3000/api

ProxyPass /socket.io http://localhost:3000/socket.io
ProxyPassReverse /socket.io http://localhost:3000/socket.io
```

### For Nginx (if available):

```nginx
location /api {
    proxy_pass http://127.0.0.1:3000;
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
}

location /socket.io {
    proxy_pass http://127.0.0.1:3000;
    proxy_http_version 1.1;
    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Connection "upgrade";
}
```

---

## 📝 Step 5: File Structure for cPanel

Recommended structure:

```
/home/username/
├── public_html/          # Web root (public files)
│   ├── index.html
│   ├── article.html
│   ├── css/
│   ├── js/
│   └── images/
├── node/                 # Node.js app (if separate)
│   ├── server.js
│   ├── package.json
│   ├── .env
│   ├── auto blog-appv1/
│   └── admin-panel/
└── .env                  # Environment variables
```

---

## ✅ Step 6: Testing

After deployment:

1. **Check Node.js app is running:**
   ```bash
   # Via SSH
   ps aux | grep node
   ```

2. **Test API:**
   ```
   https://yourdomain.com/api/health
   ```

3. **Check logs:**
   - In Node.js Manager: View logs
   - Or SSH: `tail -f ~/logs/nodejs.log`

---

## 🐛 Common Issues & Solutions

### Issue: "Node.js Manager not available"

**Solution:**
- Contact Nindohost support
- Ask to enable Node.js Manager
- Or use Method B (SSH + PM2)

### Issue: "Port 3000 already in use"

**Solution:**
- Check what's using port: `netstat -tulpn | grep 3000`
- Use different port in `.env`
- Update proxy configuration

### Issue: "App stops after SSH disconnect"

**Solution:**
- Use PM2: `pm2 start server.js`
- Use `nohup`: `nohup node server.js &`
- Use Node.js Manager's auto-restart

### Issue: "404 Not Found"

**Solution:**
- Check file paths
- Verify proxy configuration
- Check .htaccess rules
- Verify Node.js app is running

### Issue: "Environment variables not loading"

**Solution:**
- Add in Node.js Manager UI
- Or create `.env` file in app root
- Restart application after adding

---

## 📊 cPanel vs Laravel Forge Comparison

| Feature | cPanel (Nindohost) | Laravel Forge |
|---------|-------------------|---------------|
| **Node.js Support** | ⚠️ Limited/Manual | ✅ Excellent |
| **Setup Difficulty** | ⚠️ Moderate-Hard | ✅ Easy |
| **Documentation** | ⚠️ Limited | ✅ Excellent |
| **Process Management** | ⚠️ Manual (PM2) | ✅ Built-in |
| **Cost** | ✅ Usually Cheaper | ⚠️ More Expensive |
| **Control** | ⚠️ Limited | ✅ Full Control |
| **Recommended For** | PHP Apps | Node.js Apps |

---

## 🎯 Recommendation

### For Your Node.js Project:

**✅ Better Option: Laravel Forge**
- Native Node.js support
- Easier deployment
- Better documentation
- Process management built-in
- Worth the extra cost

**⚠️ cPanel Option:**
- Possible but more work
- Requires Node.js Manager
- More manual configuration
- May have limitations

---

## 📞 Contact Nindohost Support

Before deploying, ask:

1. ✅ "Do you support Node.js applications?"
2. ✅ "Is Node.js Manager available in cPanel?"
3. ✅ "What Node.js versions do you support?"
4. ✅ "Can I run Node.js apps on custom ports?"
5. ✅ "Do you provide SSH access?"
6. ✅ "Can I use PM2 process manager?"

---

## ✅ Alternative: Deploy to Both

You could:
1. **Deploy to Laravel Forge** (production)
2. **Keep cPanel** for testing/staging (if you already have it)

---

## 🚀 Quick Checklist

- [ ] Check if Node.js Manager is available
- [ ] Contact Nindohost support if unsure
- [ ] Upload project files
- [ ] Install dependencies (`npm install`)
- [ ] Configure environment variables
- [ ] Set up proxy (Apache/Nginx)
- [ ] Start Node.js application
- [ ] Test API endpoints
- [ ] Monitor logs

---

**Need help?** Contact Nindohost support first to confirm Node.js support! 📞

