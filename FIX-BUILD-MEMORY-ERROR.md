# 🔧 Fix: JavaScript Heap Out of Memory Error

The build is failing because Node.js ran out of memory. Let's fix it!

---

## ✅ Solution: Increase Node.js Memory Limit

### Method 1: Build with More Memory (Quick Fix)

**In your SSH terminal, run:**

```bash
# Go to admin-panel directory
cd admin-panel

# Build with increased memory (4GB)
NODE_OPTIONS="--max-old-space-size=4096" npm run build
```

**Or try with 8GB:**

```bash
NODE_OPTIONS="--max-old-space-size=8192" npm run build
```

---

### Method 2: Update package.json Script

**If Method 1 doesn't work, update the build script:**

```bash
# Edit package.json
nano admin-panel/package.json
```

**Find the "build" script and change it to:**

```json
"scripts": {
  "build": "NODE_OPTIONS='--max-old-space-size=4096' react-scripts build"
}
```

**Save:** `Ctrl+X`, then `Y`, then `Enter`

**Then run:**

```bash
npm run build
```

---

### Method 3: Check Server Memory

**Check how much memory your server has:**

```bash
# Check total memory
free -h

# Check available memory
df -h
```

**If server has less than 2GB RAM, you may need to:**
- Upgrade server
- Build locally and upload build folder
- Use swap space

---

## 🚀 Quick Fix Commands

**Copy and paste this:**

```bash
# Make sure you're in admin-panel directory
cd /home/forge/meganews.on-forge.com/current/admin-panel

# Build with 4GB memory
NODE_OPTIONS="--max-old-space-size=4096" npm run build
```

**If that fails, try 8GB:**

```bash
NODE_OPTIONS="--max-old-space-size=8192" npm run build
```

---

## 📊 Check Server Resources

**While build is running, check memory:**

```bash
# In another SSH session or while build runs
free -h

# Check Node.js processes
ps aux | grep node
```

---

## 🔄 Alternative: Build Locally and Upload

**If server doesn't have enough memory:**

1. **Build on your Windows PC:**
   ```powershell
   cd admin-panel
   npm install --legacy-peer-deps
   npm run build
   ```

2. **Upload build folder via SFTP:**
   - Upload `admin-panel/build/` folder
   - To: `/home/forge/meganews.on-forge.com/current/admin-panel/build/`

---

## ✅ After Build Succeeds

**Verify build:**

```bash
ls -la build/
# Should see: index.html, static/, manifest.json, etc.
```

---

**Try the memory increase command first!** 🚀

