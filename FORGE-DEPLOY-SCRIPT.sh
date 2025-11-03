#!/bin/bash

# Laravel Forge Deployment Script
# This script runs automatically when you deploy in Forge
# Or run manually: bash FORGE-DEPLOY-SCRIPT.sh

set -e  # Exit on error

echo "🚀 Starting deployment..."

# Get the site directory (automatically set by Forge)
SITE_DIR="${FORGE_SITE_PATH:-/home/forge/YOUR-DOMAIN-NAME}"

cd "$SITE_DIR"

echo "📦 Pulling latest code..."
# Pull latest code (if using Git)
git pull origin main || echo "⚠️  Git pull failed or not using Git - continuing..."

echo "📥 Installing backend dependencies..."
cd "auto blog-appv1"
npm install --production --no-audit --no-fund

echo "🏗️  Building admin panel..."
cd ../admin-panel
npm install --legacy-peer-deps --no-audit --no-fund
npm run build

echo "🔄 Restarting application..."
cd ../"auto blog-appv1"

# Restart PM2 process or start if not running
pm2 restart blog-api || pm2 start ecosystem.config.js

echo "✅ Deployment complete!"
pm2 status

