# 🔧 Fix: Permission Denied (publickey)

You're getting this error because you don't have an SSH key set up yet. Here are two solutions:

## ✅ Solution 1: Add SSH Key (Recommended - No Password Needed)

### Step 1: Generate SSH Key

In PowerShell, run:

```powershell
ssh-keygen -t ed25519 -C "your_email@example.com"
```

**When prompted:**
- Press `Enter` (use default location)
- Press `Enter` (no passphrase) or enter a passphrase
- Press `Enter` (confirm)

### Step 2: Copy Your Public Key

```powershell
type $env:USERPROFILE\.ssh\id_ed25519.pub
```

**Copy the entire output** (one long line starting with `ssh-ed25519`)

### Step 3: Add Key to Laravel Forge

1. Go to: https://forge.laravel.com/source-dart/mainserver-9j2
2. Click **"SSH Keys"** in the sidebar
3. Click **"Add key"** button
4. **Name:** "My Windows PC"
5. **Key:** Paste your public key
6. Click **"Add Key"**

### Step 4: Connect Again

```powershell
ssh forge@129.212.140.35
```

**Now it should work without password!** ✅

---

## ✅ Solution 2: Use Password Authentication (Quick Fix)

If Laravel Forge allows password authentication:

### Option A: Get Password from Forge

1. Go to your server in Forge
2. Look for **"Server Password"** or **"Root Password"**
3. Some Forge servers may require SSH keys only

### Option B: Force Password Prompt

Try connecting with password flag:

```powershell
ssh -o PreferredAuthentications=password forge@129.212.140.35
```

**Note:** Many Forge servers disable password auth for security. SSH keys are preferred.

---

## 🔍 Check If You Already Have SSH Keys

```powershell
# List your SSH keys
dir $env:USERPROFILE\.ssh
```

If you see `id_ed25519.pub` or `id_rsa.pub`, you already have keys!

Just copy and add to Forge:
```powershell
type $env:USERPROFILE\.ssh\id_ed25519.pub
```

---

## 🚀 Quick Fix Steps

**If you want the fastest solution:**

1. **Generate key:**
   ```powershell
   ssh-keygen -t ed25519 -C "your_email@example.com"
   # Press Enter 3 times
   ```

2. **Copy key:**
   ```powershell
   type $env:USERPROFILE\.ssh\id_ed25519.pub
   ```

3. **Add to Forge:**
   - Go to SSH Keys page
   - Click "Add key"
   - Paste and save

4. **Connect:**
   ```powershell
   ssh forge@129.212.140.35
   ```

---

## ✅ After SSH Works

Once connected, you should see:
```
forge@server-name:~$
```

Then you can proceed with deployment steps from `READY-TO-DEPLOY.md`!

