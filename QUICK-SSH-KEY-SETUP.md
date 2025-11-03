# 🔑 Quick SSH Key Setup for Laravel Forge

You're on the SSH Keys page in Forge. Here's how to add your first SSH key.

## 🚀 Quick Steps (Windows PowerShell)

### Step 1: Generate SSH Key

Open **PowerShell** and run:

```powershell
# Generate SSH key
ssh-keygen -t ed25519 -C "your_email@example.com"
```

**If ed25519 doesn't work, use:**
```powershell
ssh-keygen -t rsa -b 4096 -C "your_email@example.com"
```

**When prompted:**
- **File location:** Press `Enter` (uses default: `C:\Users\YourName\.ssh\id_ed25519`)
- **Passphrase:** Press `Enter` for no passphrase (or enter one for security)
- **Confirm passphrase:** Press `Enter` again

You should see:
```
Your public key has been saved in C:\Users\YourName\.ssh\id_ed25519.pub
```

### Step 2: Copy Your Public Key

```powershell
# Display your public key
type $env:USERPROFILE\.ssh\id_ed25519.pub
```

**OR if using RSA:**
```powershell
type $env:USERPROFILE\.ssh\id_rsa.pub
```

**Copy the entire output** - it will look like:
```
ssh-ed25519 AAAAC3NzaC1lZDI1NTE5AAAAI... your_email@example.com
```

### Step 3: Add Key to Laravel Forge

1. **In Laravel Forge** (where you are now):
   - Click the **"Add key"** button
   - **Name:** Give it a name (e.g., "My Windows PC" or "Laptop")
   - **Key:** Paste your public key (the entire line you copied)
   - Click **"Add Key"**

### Step 4: Test Connection

Back in PowerShell:

```powershell
# Test SSH connection (using domain)
ssh forge@meganews.on-forge.com

# OR using IP address
ssh forge@129.212.140.35
```

**Both work the same!** ✅

**If successful:**
- You'll connect without entering a password! ✅
- You should see: `forge@server-name:~$`

---

## 📋 Complete Example

Here's the full sequence:

```powershell
# 1. Generate key
ssh-keygen -t ed25519 -C "your_email@example.com"
# Press Enter 3 times (default location, no passphrase)

# 2. Display public key
type $env:USERPROFILE\.ssh\id_ed25519.pub

# 3. Copy the output and paste into Forge "Add key" form

# 4. Test connection
ssh forge@meganews.on-forge.com
```

---

## ✅ Verification

After adding the key, you should:

1. See your key listed in Forge SSH Keys page
2. Be able to connect without password: `ssh forge@meganews.on-forge.com`
3. See "Welcome to Ubuntu" or similar message

---

## 🐛 Troubleshooting

### "ssh-keygen: command not found"

**Solution:** SSH is built into Windows 10/11. If not available:
- Use **Git Bash** (comes with Git for Windows)
- Or use **WSL** (Windows Subsystem for Linux)

### "Permission denied" when connecting

**Solution:**
- Make sure you copied the **public** key (ends with `.pub`)
- Make sure you copied the **entire** key (all one line)
- Try regenerating: `ssh-keygen -t rsa -b 4096`

### Key not working after adding

**Solution:**
- Make sure you added the **public** key (`.pub` file), not the private key
- Private key should stay on your computer
- Public key goes to Forge

---

## 💡 What's Happening?

- **Private Key** (`id_ed25519`) - Stays on your computer, never share this
- **Public Key** (`id_ed25519.pub`) - Goes to Forge, safe to share

When you connect, your private key "proves" you own the public key, so no password needed!

---

**Once your key is added, you can proceed with deployment steps!** 🚀

