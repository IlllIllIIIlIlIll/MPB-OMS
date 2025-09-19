#!/bin/bash

# Deploy script for Firebase Hosting
echo "🚀 Building Next.js app for production..."

# Build the Next.js app
npm run build

# Check if build was successful
if [ $? -eq 0 ]; then
    echo "✅ Build successful!"
    echo "📁 Build output: frontend/out"
    echo "🌐 Ready for deployment to Firebase Hosting"
else
    echo "❌ Build failed!"
    exit 1
fi
