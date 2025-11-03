# 📤 Step 2: Upload Code & Install Dependencies

**Status:** ✅ SSH Connected! Now let's upload your code.

---

## 🎯 What We'll Do

1. Upload your code to the server
2. Install Node.js dependencies
3. Build admin panel
4. Start the application

---

## 📤 Option A: Upload via Git (Recommended)

### If Your Code is on GitHub/GitLab:

1. **In Laravel Forge:**
   - Go to: https://forge.laravel.com/source-dart/mainserver-9j2/2914617/app
   - **Repository:** Your Git repo URL (e.g., `git@github.com:username/repo.git`)
   - **Branch:** `main` (or your branch name)
   - Click **"Install Repository"**

2. **Forge will automatically:**
   - Clone your repository
   - Set up the directory structure

### If You Need to Push to Git First:

```powershell
# In your project folder (local)
git add .
git commit -m "Ready for deployment"
git push origin main
```

Then add the repository in Forge.

---

## 📤 Option B: Upload via SFTP

### Get SFTP Credentials:

1. In Forge, go to your site
2. Look for **"SFTP"** or **"File Manager"** section
3. Note the credentials

### Upload Files:

**Using FileZilla or WinSCP:**

1. **Host:** `meganews.on-forge.com` or `129.212.140.35`
2. **Username:** `forge`
3. **Password:** (from Forge or use SSH key)
4. **Port:** `22`

**Upload to:**
```
/home/forge/meganews.on-forge.com/
```

**Structure:**
```
/home/forge/meganews.on-forge.com/
├── auto blog-appv1/
│   ├── server.js
│   ├── package.json
│   ├── ecosystem.config.js
│   └── ... (all other files)
└── admin-panel/
    ├── package.json
    └── ... (all other files)
```

---

## 💻 Step 3: Install Dependencies (SSH)

**You're already connected via SSH!** Run these commands:

```bash
# Navigate to your site directory
cd /home/forge/meganews.on-forge.com

# Create logs directory
mkdir -p storage/logs

# Check if files are there
ls -la

# You should see 'auto blog-appv1' and 'admin-panel' directories
```

### Install Backend Dependencies:

```bash
# Go to backend directory
cd "auto blog-appv1"

# Install dependencies
npm install --production

# This may take a few minutes...
```

### Build Admin Panel:

```bash
# Go to admin panel directory
cd ../admin-panel

# Install dependencies
npm install --legacy-peer-deps

# Build for production
npm run build

# This will create a 'build' folder
```

### Verify Build:

```bash
# Check if build was successful
ls -la build/

# Should see index.html and static folder
```

---

## ✅ Quick Checklist

- [ ] Code uploaded to server (Git or SFTP)
- [ ] Can see files: `ls -la /home/forge/meganews.on-forge.com`
- [ ] Backend dependencies installed: `cd "auto blog-appv1" && npm install --production`
- [ ] Admin panel dependencies installed: `cd admin-panel && npm install --legacy-peer-deps`
- [ ] Admin panel built: `npm run build`
- [ ] Build folder exists: `ls -la admin-panel/build`

---

## 🐛 Troubleshooting

### "npm: command not found"

```bash
# Check Node.js version
node -v

# Should show v22.20.0 or similar
# If not, contact Forge support
```

### "Cannot find module"

```bash
# Make sure you're in the right directory
pwd
# Should show: /home/forge/meganews.on-forge.com/auto blog-appv1

# Try installing again
npm install --production
```

### Build fails

```bash
# Check Node.js version in admin-panel
cd admin-panel
node -v

# Try with legacy peer deps
npm install --legacy-peer-deps --force
npm run build
```

---

## 🚀 Next Steps

Once dependencies are installed, we'll:
1. ✅ Configure environment variables in Forge
2. ✅ Start the app with PM2
3. ✅ Configure Nginx
4. ✅ Set up SSL

---

**Run the commands above and let me know when dependencies are installed!** 💻

