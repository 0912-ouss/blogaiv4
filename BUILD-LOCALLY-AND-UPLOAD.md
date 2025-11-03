# 🏗️ Build Admin Panel Locally & Upload

**Problem:** Server has only 961MB RAM - not enough for React build
**Solution:** Build on your Windows PC, then upload

---

## 🚀 Step 1: Build on Your Windows PC

**In PowerShell (on your computer):**

```powershell
# Navigate to admin-panel
cd "E:\blogaiv1\blog\admin-panel"

# Install dependencies (if not already done)
npm install --legacy-peer-deps

# Build for production
npm run build
```

**Wait for build to complete** - should take 2-5 minutes

**Verify build:**

```powershell
# Check build folder exists
dir build

# Should see:
# - index.html
# - static/
# - manifest.json
# - etc.
```

---

## 📤 Step 2: Upload Build Folder via SFTP

### Option A: Using FileZilla (Recommended)

1. **Download FileZilla:** https://filezilla-project.org/

2. **Connect to Server:**
   - **Host:** `meganews.on-forge.com` or `129.212.140.35`
   - **Username:** `forge`
   - **Password:** (your SSH password or use SSH key)
   - **Port:** `22`
   - **Protocol:** SFTP

3. **Navigate to:**
   - **Local:** `E:\blogaiv1\blog\admin-panel\build`
   - **Remote:** `/home/forge/meganews.on-forge.com/current/admin-panel/`

4. **Upload:**
   - Select all files in `build` folder
   - Drag to remote `admin-panel` directory
   - Wait for upload to complete

### Option B: Using WinSCP

1. **Download WinSCP:** https://winscp.net/

2. **Connect** (same credentials as above)

3. **Upload** `build` folder contents

### Option C: Using SCP Command (PowerShell)

```powershell
# From your Windows PC
scp -r "E:\blogaiv1\blog\admin-panel\build\*" forge@129.212.140.35:/home/forge/meganews.on-forge.com/current/admin-panel/build/
```

---

## ✅ Step 3: Verify Upload on Server

**SSH into server and check:**

```bash
# Check if build folder exists
ls -la admin-panel/build/

# Should see:
# - index.html
# - static/
# - manifest.json
# - robots.txt
# - etc.
```

---

## 🎯 Quick Summary

1. ✅ Build locally: `cd admin-panel && npm run build`
2. ✅ Upload `build` folder via SFTP
3. ✅ Verify on server: `ls -la admin-panel/build/`

---

## 🐛 Troubleshooting

### Build fails locally too

```powershell
# Clear cache and rebuild
cd admin-panel
rm -r node_modules
rm package-lock.json
npm install --legacy-peer-deps
npm run build
```

### Upload fails

- Check SFTP credentials
- Verify disk space: `df -h` on server
- Check permissions: `ls -la` on server

---

**Build locally, then upload!** 🚀

