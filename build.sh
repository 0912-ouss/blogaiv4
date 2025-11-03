#!/bin/bash
# Build script for Vercel deployment

set -e

echo "🚀 Building admin panel..."
cd admin-panel
npm run build
cd ..

echo "📦 Copying blog files to public directory..."
mkdir -p public

# Copy blog static assets
if [ -d "auto blog-appv1/css" ]; then
  cp -r "auto blog-appv1/css" public/
fi

if [ -d "auto blog-appv1/js" ]; then
  cp -r "auto blog-appv1/js" public/
fi

if [ -d "auto blog-appv1/images" ]; then
  cp -r "auto blog-appv1/images" public/
fi

if [ -d "auto blog-appv1/fonts" ]; then
  cp -r "auto blog-appv1/fonts" public/
fi

# Copy blog HTML files
if [ -f "auto blog-appv1/index.html" ]; then
  cp "auto blog-appv1/index.html" public/
fi

if [ -f "auto blog-appv1/article.html" ]; then
  cp "auto blog-appv1/article.html" public/
fi

if [ -f "auto blog-appv1/author.html" ]; then
  cp "auto blog-appv1/author.html" public/
fi

echo "✅ Build complete!"

