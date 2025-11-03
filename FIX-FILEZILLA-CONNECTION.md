# 🔧 Fix FileZilla SFTP Connection

**Error:** "Could not connect to server"

---

## ✅ Solution 1: Use SSH Key Authentication

FileZilla can use your SSH key instead of password.

### Setup SSH Key in FileZilla:

1. **In FileZilla:**
   - Go to: **Edit → Settings → SFTP**
   - Click **"Add key file..."**
   - Browse to: `C:\Users\maous\.ssh\id_ed25519` (your **private** key, NOT .pub)
   - Click **"OK"**

2. **Connect Again:**
   - **Host:** `meganews.on-forge.com` or `129.212.140.35`
   - **Username:** `forge`
   - **Password:** (leave empty if using key)
   - **Port:** `22`
   - **Protocol:** SFTP - SSH File Transfer Protocol
   - Click **"Quickconnect"**

---

## ✅ Solution 2: Check Connection Settings

**Make sure settings are correct:**

- ✅ **Protocol:** `SFTP - SSH File Transfer Protocol` (NOT FTP)
- ✅ **Host:** `meganews.on-forge.com` or `129.212.140.35`
- ✅ **Port:** `22` (NOT 21)
- ✅ **Username:** `forge`
- ✅ **Password:** (your SSH password OR leave empty if using key)

---

## ✅ Solution 3: Alternative - Use SCP Command

**If FileZilla doesn't work, use PowerShell:**

```powershell
# From your Windows PC
# Upload build folder
scp -r "E:\blogaiv1\blog\admin-panel\build\*" forge@129.212.140.35:/home/forge/meganews.on-forge.com/current/admin-panel/build/
```

**Or use WinSCP instead of FileZilla**

---

## ✅ Solution 4: Check Server Firewall

**In SSH, check if SFTP is allowed:**

```bash
# Check SSH/SFTP service
sudo systemctl status ssh

# Check firewall
sudo ufw status
```

---

## 🎯 Quick Fix Steps

1. **In FileZilla Settings:**
   - Edit → Settings → SFTP
   - Add your private key: `C:\Users\maous\.ssh\id_ed25519`

2. **Connect with:**
   - Host: `meganews.on-forge.com`
   - Username: `forge`
   - Port: `22`
   - Protocol: SFTP
   - Leave password empty

3. **Click Quickconnect**

---

## 🚀 Alternative: Use SCP Command

**Easier - just use PowerShell:**

```powershell
# Upload build folder
scp -r "E:\blogaiv1\blog\admin-panel\build\*" forge@129.212.140.35:/home/forge/meganews.on-forge.com/current/admin-panel/build/
```

**This uses your SSH key automatically!**

---

**Try adding your SSH key to FileZilla first, or use the SCP command!** 🔑

