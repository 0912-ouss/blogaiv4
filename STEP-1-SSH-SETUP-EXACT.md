# 🔑 Step 1: SSH Setup - Exact Commands

**Your Email:** maoussaberhayla@gmail.com

---

## ✅ Copy & Paste These Commands

### Part A: Generate SSH Key

**Open PowerShell and run:**

```powershell
ssh-keygen -t ed25519 -C "maoussaberhayla@gmail.com"
```

**Then:**
- Press `Enter` (use default location)
- Press `Enter` (no passphrase)
- Press `Enter` (confirm)

---

### Part B: Copy Your Public Key ✅

**In PowerShell, run:**

```powershell
type $env:USERPROFILE\.ssh\id_ed25519.pub
```

**Copy the ENTIRE output** (one long line starting with `ssh-ed25519`)

**Or use this command:**
```powershell
Get-Content $env:USERPROFILE\.ssh\id_ed25519.pub | Set-Clipboard
```
This automatically copies it to your clipboard! ✅

---

### Part C: Add to Laravel Forge

1. Go to: https://forge.laravel.com/source-dart/mainserver-9j2
2. Click **"SSH Keys"** in sidebar
3. Click **"Add key"** button
4. **Name:** `My Windows PC`
5. **Key:** Paste your copied key
6. Click **"Add Key"**

---

### Part D: Test Connection

**In PowerShell, run:**

```powershell
ssh forge@129.212.140.35
```

**Should connect!** ✅

---

## 📋 Quick Checklist

- [ ] Ran: `ssh-keygen -t ed25519 -C "maoussaberhayla@gmail.com"`
- [ ] Pressed Enter 3 times
- [ ] Ran: `type $env:USERPROFILE\.ssh\id_ed25519.pub`
- [ ] Copied the entire output
- [ ] Added key to Forge
- [ ] Tested: `ssh forge@129.212.140.35`
- [ ] Connected successfully ✅

---

**Once SSH works, proceed to Step 2!** 🚀

