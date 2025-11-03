#!/bin/bash

# Quick Setup Script for Laravel Forge
# Run this on your server after uploading code
# Usage: bash forge-quick-setup.sh YOUR-DOMAIN-NAME

set -e

DOMAIN_NAME="${1:-YOUR-DOMAIN-NAME}"

if [ "$DOMAIN_NAME" == "YOUR-DOMAIN-NAME" ]; then
    echo "❌ Error: Please provide your domain name"
    echo "Usage: bash forge-quick-setup.sh yourdomain.com"
    exit 1
fi

SITE_DIR="/home/forge/$DOMAIN_NAME"

echo "🚀 Setting up Laravel Forge deployment for: $DOMAIN_NAME"
echo "📍 Site directory: $SITE_DIR"
echo ""

# Check if directory exists
if [ ! -d "$SITE_DIR" ]; then
    echo "❌ Error: Directory $SITE_DIR does not exist"
    echo "Please make sure your code is uploaded to the server first"
    exit 1
fi

cd "$SITE_DIR"

# Update ecosystem.config.js with actual domain
echo "📝 Updating ecosystem.config.js..."
if [ -f "auto blog-appv1/ecosystem.config.js" ]; then
    sed -i "s|YOUR-DOMAIN-NAME|$DOMAIN_NAME|g" "auto blog-appv1/ecosystem.config.js"
    echo "✅ Updated ecosystem.config.js"
else
    echo "⚠️  ecosystem.config.js not found - skipping"
fi

# Create logs directory
echo "📁 Creating logs directory..."
mkdir -p "$SITE_DIR/storage/logs"
echo "✅ Logs directory created"

# Install backend dependencies
echo "📦 Installing backend dependencies..."
cd "$SITE_DIR/auto blog-appv1"
npm install --production --no-audit --no-fund
echo "✅ Backend dependencies installed"

# Build admin panel
echo "🏗️  Building admin panel..."
cd "$SITE_DIR/admin-panel"
npm install --legacy-peer-deps --no-audit --no-fund
npm run build
echo "✅ Admin panel built"

# Check if PM2 is installed
if ! command -v pm2 &> /dev/null; then
    echo "⚠️  PM2 not found. Installing PM2..."
    sudo npm install -g pm2
fi

# Start application with PM2
echo "🔄 Starting application with PM2..."
cd "$SITE_DIR/auto blog-appv1"
pm2 start ecosystem.config.js || pm2 restart blog-api
pm2 save
echo "✅ Application started"

# Show status
echo ""
echo "📊 PM2 Status:"
pm2 status

echo ""
echo "✅ Setup complete!"
echo ""
echo "Next steps:"
echo "1. Configure Nginx in Forge (use FORGE-NGINX-CONFIG.conf)"
echo "2. Set environment variables in Forge (use FORGE-ENV-TEMPLATE.env)"
echo "3. Set up SSL certificate in Forge"
echo "4. Test your site: https://$DOMAIN_NAME"
echo ""
echo "Check logs: pm2 logs blog-api"

