# 🚀 Vercel Deployment Guide

This guide will help you deploy your blog application to Vercel.

## 📋 Prerequisites

1. A [Vercel account](https://vercel.com/signup) (free tier works)
2. GitHub account (for easy deployment)
3. Supabase project with all environment variables ready

## 🏗️ Project Structure

Your project has three main parts:
- **Backend API**: Express.js server in `auto blog-appv1/`
- **Admin Panel**: React app in `admin-panel/`
- **Frontend Blog**: Static HTML site in `auto blog-appv1/`

## 📝 Step 1: Prepare Your Repository

1. **Commit all changes** to your Git repository:
   ```bash
   git add .
   git commit -m "Prepare for Vercel deployment"
   git push origin main
   ```

2. **Ensure your repository is on GitHub** (or GitLab/Bitbucket)

## 🔧 Step 2: Configure Environment Variables

### Required Environment Variables

Go to your Vercel project settings → Environment Variables and add:

#### Supabase Configuration
```
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
SUPABASE_ANON_KEY=your-anon-key
```

#### Application Configuration
```
NODE_ENV=production
PORT=3000
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
ALLOWED_ORIGINS=https://your-vercel-domain.vercel.app,https://your-custom-domain.com
SITE_URL=https://your-vercel-domain.vercel.app
```

#### Email Configuration (Optional)
```
EMAIL_SERVICE=sendgrid  # or 'mailgun' or 'nodemailer'
SENDGRID_API_KEY=your-sendgrid-api-key
MAILGUN_API_KEY=your-mailgun-api-key
MAILGUN_DOMAIN=your-mailgun-domain
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
EMAIL_FROM=noreply@yourdomain.com
```

#### AI Generation (Optional)
```
FAL_AI_KEY=your-fal-ai-key
OPENAI_API_KEY=your-openai-api-key
```

#### Social Auth (Optional)
```
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
FACEBOOK_APP_ID=your-facebook-app-id
FACEBOOK_APP_SECRET=your-facebook-app-secret
```

### Admin Panel Environment Variables

For the admin panel build, add:
```
REACT_APP_API_URL=https://your-vercel-domain.vercel.app/api
```

## 🚀 Step 3: Deploy to Vercel

### Option A: Deploy via Vercel Dashboard (Recommended)

1. **Go to [Vercel Dashboard](https://vercel.com/dashboard)**

2. **Click "Add New Project"**

3. **Import your Git repository**
   - Connect your GitHub/GitLab/Bitbucket account if not already connected
   - Select your repository
   - Click "Import"

4. **Configure Project Settings**:
   - **Framework Preset**: Other
   - **Root Directory**: Leave as `.` (root)
   - **Build Command**: 
     ```
     cd admin-panel && npm install && npm run build
     ```
   - **Output Directory**: `admin-panel/build`
   - **Install Command**: 
     ```
     npm install --prefix "auto blog-appv1" && npm install --prefix admin-panel
     ```

5. **Add Environment Variables** (from Step 2)

6. **Click "Deploy"**

### Option B: Deploy via Vercel CLI

1. **Install Vercel CLI**:
   ```bash
   npm i -g vercel
   ```

2. **Login to Vercel**:
   ```bash
   vercel login
   ```

3. **Deploy**:
   ```bash
   vercel
   ```

4. **Follow the prompts**:
   - Link to existing project or create new
   - Set up environment variables
   - Deploy

5. **For production deployment**:
   ```bash
   vercel --prod
   ```

## 📍 Step 4: Update Admin Panel API URL

After deployment, update the admin panel's API URL:

1. **Get your Vercel deployment URL** (e.g., `https://your-project.vercel.app`)

2. **Update admin panel environment variable**:
   - Go to Vercel Dashboard → Your Project → Settings → Environment Variables
   - Update `REACT_APP_API_URL` to: `https://your-project.vercel.app/api`
   - Redeploy the project

## 🔍 Step 5: Verify Deployment

1. **Check API Health**:
   ```
   https://your-project.vercel.app/api/health
   ```
   Should return: `{"status":"OK","message":"Simple Blog API is running",...}`

2. **Check Frontend Blog**:
   ```
   https://your-project.vercel.app/
   ```
   Should show your blog homepage

3. **Check Admin Panel**:
   ```
   https://your-project.vercel.app/admin
   ```
   Should show admin login page

4. **Test API Endpoints**:
   ```
   https://your-project.vercel.app/api/articles
   https://your-project.vercel.app/api/categories
   ```

## ⚙️ Important Notes

### WebSocket Support
⚠️ **WebSocket is NOT supported on Vercel serverless functions**. Real-time features using WebSocket will be disabled automatically when running on Vercel.

### Cron Jobs / Schedulers
⚠️ **Article scheduler won't run** on Vercel serverless functions. Consider:
- Using Vercel Cron Jobs (Pro plan)
- Using external cron service (e.g., cron-job.org)
- Using Supabase Edge Functions with cron triggers

### File Uploads
- File uploads are supported via Supabase Storage
- Ensure `SUPABASE_SERVICE_ROLE_KEY` has storage permissions

### Static Files
- Static files (CSS, JS, images) from `auto blog-appv1/` are served directly
- Admin panel build files are served from `admin-panel/build/`

## 🐛 Troubleshooting

### Build Fails

1. **Check build logs** in Vercel Dashboard
2. **Verify all dependencies** are in `package.json`
3. **Check Node.js version** (should be 18.x or 20.x)

### API Routes Not Working

1. **Verify `vercel.json`** is in root directory
2. **Check API route** matches `/api/*` pattern
3. **Review function logs** in Vercel Dashboard

### Admin Panel Can't Connect to API

1. **Verify `REACT_APP_API_URL`** environment variable
2. **Check CORS settings** in `server.js`
3. **Ensure API URL** includes `/api` prefix

### Environment Variables Not Loading

1. **Redeploy** after adding environment variables
2. **Check variable names** match exactly (case-sensitive)
3. **Verify variable scope** (Production, Preview, Development)

## 📚 Additional Resources

- [Vercel Documentation](https://vercel.com/docs)
- [Vercel Environment Variables](https://vercel.com/docs/concepts/projects/environment-variables)
- [Vercel Serverless Functions](https://vercel.com/docs/concepts/functions/serverless-functions)

## 🔄 Updating Your Deployment

After making changes:

1. **Commit and push** to your repository
2. **Vercel will automatically deploy** (if connected to Git)
3. **Or manually deploy** using `vercel --prod`

## ✨ Next Steps

1. **Set up custom domain** (optional)
2. **Configure SSL** (automatic with Vercel)
3. **Set up monitoring** (Vercel Analytics)
4. **Configure preview deployments** for pull requests

---

**Need Help?** Check the Vercel logs or open an issue in your repository.

