#!/bin/bash

# Deployment helper script for Vercel

echo "Preparing for Vercel deployment..."

# Check if Git is initialized
if [ ! -d .git ]; then
  echo "Initializing Git repository..."
  git init
  git add .
  git commit -m "Initial commit"
fi

# Check if remote exists
if ! git remote -v | grep -q "origin"; then
  echo "Adding GitHub remote..."
  git remote add origin https://github.com/ShivankKMishra/farmer-accessapp.git
fi

# Add all changes
git add .
git commit -m "Deployment preparation"

# Push to GitHub
echo "Pushing to GitHub..."
git push -u origin main

echo "======================================================"
echo "Repository pushed to GitHub! Now you can deploy to Vercel with these steps:"
echo "1. Go to https://vercel.com/new"
echo "2. Import your GitHub repository: farmer-accessapp"
echo "3. Configure your project with the following settings:"
echo "   - Build Command: npm run build"
echo "   - Output Directory: client/dist"
echo "   - Install Command: npm install"
echo "4. Set the following environment variables in the Vercel dashboard:"
echo "   - JWT_SECRET"
echo "   - FIREBASE_API_KEY"
echo "   - FIREBASE_AUTH_DOMAIN"
echo "   - FIREBASE_PROJECT_ID"
echo "   - FIREBASE_STORAGE_BUCKET"
echo "   - FIREBASE_MESSAGING_SENDER_ID"
echo "   - FIREBASE_APP_ID"
echo "   - WEATHER_API_KEY"
echo "5. Click 'Deploy'"
echo "======================================================"