# 🔐 SSH Setup Guide for Laravel Forge

Complete guide to set up SSH access to your server: `meganews.on-forge.com`

## 📋 Prerequisites

- Laravel Forge account
- Server IP address or domain
- SSH key or password (from Forge)

---

## 🔑 Method 1: Get SSH Credentials from Forge

### Step 1: Find Your SSH Details

1. Go to your server in Forge: https://forge.laravel.com/source-dart/mainserver-9j2
2. Click on **"SSH Keys"** or look for **"Server Details"**
3. You'll see:
   - **Server IP Address**
   - **Username** (usually `forge`)
   - **SSH Key** (if you've added one) or **Password** (if using password auth)

### Step 2: Copy SSH Information

From your Forge dashboard, you should see something like:
```
Username: forge
IP Address: 123.456.789.0
```

---

## 💻 Method 2: SSH Setup on Windows

### Option A: Using Windows PowerShell (Recommended)

#### Step 1: Open PowerShell

1. Press `Win + X`
2. Select **"Windows PowerShell"** or **"Terminal"**

#### Step 2: Connect via SSH

```powershell
# Connect using domain name
ssh forge@meganews.on-forge.com

# OR connect using IP address (your server IP)
ssh forge@129.212.140.35
```

**Both commands work the same!** Use whichever you prefer.

**First time connection:**
- You'll see: `The authenticity of host... can't be established. Are you sure you want to continue?`
- Type: `yes` and press Enter
- Enter your password when prompted

#### Step 3: Verify Connection

Once connected, you should see:
```
forge@server-name:~$
```

You're now connected! 🎉

---

### Option B: Using PuTTY (Alternative)

#### Step 1: Download PuTTY

1. Download from: https://www.putty.org/
2. Install PuTTY

#### Step 2: Configure PuTTY

1. Open PuTTY
2. **Host Name:** `meganews.on-forge.com` or your server IP
3. **Port:** `22` (default SSH port)
4. **Connection Type:** SSH
5. Click **"Open"**

#### Step 3: Login

1. Username: `forge`
2. Enter password when prompted

---

### Option C: Using Windows Terminal / WSL

If you have Windows Terminal or WSL installed:

```bash
# In WSL or Windows Terminal
ssh forge@meganews.on-forge.com
```

---

## 🔐 Method 3: Using SSH Keys (More Secure) ⭐ RECOMMENDED

> **💡 Quick Guide:** See `QUICK-SSH-KEY-SETUP.md` for step-by-step instructions with screenshots.

### Step 1: Generate SSH Key (if you don't have one)

**On Windows PowerShell:**

```powershell
# Generate SSH key
ssh-keygen -t ed25519 -C "your_email@example.com"

# Or use RSA (if ed25519 not supported)
ssh-keygen -t rsa -b 4096 -C "your_email@example.com"
```

**Follow prompts:**
- Press Enter to save to default location: `C:\Users\YourName\.ssh\id_ed25519`
- Enter a passphrase (optional but recommended) - or press Enter for no passphrase

### Step 2: Copy Your Public Key

```powershell
# Display your public key (Windows)
type $env:USERPROFILE\.ssh\id_ed25519.pub

# Or if using RSA:
type $env:USERPROFILE\.ssh\id_rsa.pub
```

**Copy the entire output** (starts with `ssh-ed25519` or `ssh-rsa`)

### Step 3: Add Key to Laravel Forge

1. Go to: https://forge.laravel.com/source-dart/mainserver-9j2
2. Click **"SSH Keys"** (you're probably here now!)
3. Click **"Add key"** button
4. **Name:** Give it a name (e.g., "My Windows PC")
5. **Key:** Paste your public key (the entire line)
6. Click **"Add Key"**

### Step 4: Connect Using Key

```powershell
ssh forge@meganews.on-forge.com
```

Now you won't need to enter a password! ✅

---

## 🔍 Find Your Server IP Address

**Your Server IP:** `129.212.140.35` ✅

You can connect using either:
- **Domain:** `meganews.on-forge.com`
- **IP Address:** `129.212.140.35`

Both work the same way!

---

## ✅ Test SSH Connection

### Quick Test

```powershell
# Test connection (will prompt for password if no key)
ssh forge@meganews.on-forge.com "echo 'SSH connection successful!'"
```

### Full Connection

```powershell
# Connect and stay in shell
ssh forge@meganews.on-forge.com

# Once connected, test commands:
pwd                    # Should show: /home/forge
whoami                 # Should show: forge
node -v                # Check Node.js version
pm2 -v                 # Check PM2 version
```

---

## 🛠️ Common SSH Commands

Once connected, useful commands:

```bash
# Navigate to your site
cd /home/forge/meganews.on-forge.com

# List files
ls -la

# Check PM2 status
pm2 status

# View logs
pm2 logs blog-api

# Check disk space
df -h

# Check memory
free -h

# Exit SSH session
exit
```

---

## 🐛 Troubleshooting

### "Permission Denied (publickey)" Error ⚠️

**This means:** You don't have an SSH key set up or added to Forge.

**Quick Fix:**

1. **Generate SSH key:**
   ```powershell
   ssh-keygen -t ed25519 -C "your_email@example.com"
   # Press Enter 3 times
   ```

2. **Copy public key:**
   ```powershell
   type $env:USERPROFILE\.ssh\id_ed25519.pub
   ```

3. **Add to Forge:**
   - Go to SSH Keys page in Forge
   - Click "Add key"
   - Paste your public key
   - Save

4. **Connect again:**
   ```powershell
   ssh forge@129.212.140.35
   ```

> **💡 See `FIX-SSH-PERMISSION-DENIED.md` for detailed instructions.**

**Alternative Solutions:**

**Solution 1: Check Username**
```powershell
# Make sure you're using 'forge' as username
ssh forge@meganews.on-forge.com
```

**Solution 2: Check SSH Key**
- Make sure your public key is added to Forge
- Verify key format is correct
- Make sure you copied the PUBLIC key (`.pub` file), not private key

### "Connection Timed Out"

**Possible causes:**
1. Server is down (check Forge dashboard)
2. Firewall blocking connection
3. Wrong IP address or domain

**Solution:**
- Check server status in Forge
- Try using IP address instead of domain
- Check if port 22 is open

### "Host Key Verification Failed"

**Solution:**
```powershell
# Remove old host key
ssh-keygen -R meganews.on-forge.com

# Or remove from known_hosts file
# Windows: C:\Users\YourName\.ssh\known_hosts
```

### Can't Find SSH Key Location

**Windows:**
```powershell
# List SSH keys
dir $env:USERPROFILE\.ssh

# View public key
type $env:USERPROFILE\.ssh\id_ed25519.pub
```

---

## 📝 Quick Reference

### Connect to Server
```powershell
# Using domain name
ssh forge@meganews.on-forge.com

# OR using IP address
ssh forge@129.212.140.35
```

**Both work the same!** ✅

### Copy File to Server (SCP)
```powershell
# From Windows to Server
scp file.txt forge@meganews.on-forge.com:/home/forge/

# From Server to Windows
scp forge@meganews.on-forge.com:/path/to/file.txt ./
```

### Run Command on Server (Without Full Login)
```powershell
ssh forge@meganews.on-forge.com "pm2 status"
```

### Create SSH Config (Optional)

Create file: `C:\Users\YourName\.ssh\config`

```
Host meganews
    HostName meganews.on-forge.com
    User forge
    IdentityFile ~/.ssh/id_ed25519
```

Then connect with:
```powershell
ssh meganews
```

---

## ✅ Verification Checklist

- [ ] Can connect via SSH: `ssh forge@meganews.on-forge.com`
- [ ] Can navigate to site directory: `cd /home/forge/meganews.on-forge.com`
- [ ] Can run commands: `node -v`, `pm2 -v`
- [ ] SSH key is added to Forge (if using keys)

---

## 🆘 Still Having Issues?

1. **Check Forge Dashboard:**
   - Server status is "Active"
   - IP address is correct
   - SSH access is enabled

2. **Check Your Network:**
   - Firewall not blocking port 22
   - VPN not interfering (if using)

3. **Contact Support:**
   - Laravel Forge support: https://forge.laravel.com/support
   - Check Forge status page

---

**Once SSH is working, proceed with deployment steps in `READY-TO-DEPLOY.md`** 🚀

