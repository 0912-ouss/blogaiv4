# ⚡ Vercel Quick Start Guide

## 🚀 Deploy in 5 Minutes

### Step 1: Push to GitHub
```bash
git add .
git commit -m "Ready for Vercel deployment"
git push origin main
```

### Step 2: Connect to Vercel

1. Go to [vercel.com](https://vercel.com)
2. Sign up/Login with GitHub
3. Click **"Add New Project"**
4. Import your repository
5. Configure:
   - **Framework Preset**: Other
   - **Root Directory**: `.` (leave default)
   - **Build Command**: `cd admin-panel && npm install && npm run build`
   - **Output Directory**: `admin-panel/build`
   - **Install Command**: `npm install --prefix "auto blog-appv1" && npm install --prefix admin-panel`

### Step 3: Add Environment Variables

Go to **Settings → Environment Variables** and add:

**Required:**
- `SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`
- `SUPABASE_ANON_KEY`
- `JWT_SECRET` (generate a random 32+ char string)
- `REACT_APP_API_URL` (will be: `https://your-project.vercel.app/api`)

**After first deployment, update:**
- `SITE_URL` = your Vercel URL
- `ALLOWED_ORIGINS` = your Vercel URL
- `REACT_APP_API_URL` = `https://your-project.vercel.app/api`

### Step 4: Deploy

Click **"Deploy"** and wait ~2-3 minutes.

### Step 5: Test

- Frontend: `https://your-project.vercel.app/`
- API: `https://your-project.vercel.app/api/health`
- Admin: `https://your-project.vercel.app/admin`

---

## 📝 Full Guide

See `VERCEL-DEPLOYMENT-GUIDE.md` for detailed instructions.

## 🔧 Troubleshooting

**Build fails?**
- Check Node.js version (should be 18.x or 20.x)
- Verify all dependencies in package.json files

**API not working?**
- Check `vercel.json` exists in root
- Verify environment variables are set
- Check function logs in Vercel Dashboard

**Admin panel can't connect?**
- Verify `REACT_APP_API_URL` includes `/api`
- Check CORS settings
- Redeploy after updating env vars

