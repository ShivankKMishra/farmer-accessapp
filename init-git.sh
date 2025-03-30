#!/bin/bash

# Initialize Git and push to GitHub
echo "Initializing Git repository and pushing to GitHub..."

# Initialize Git if not already initialized
if [ ! -d .git ]; then
  git init
  echo "Git repository initialized."
else
  echo "Git repository already exists."
fi

# Add remote if it doesn't exist
if ! git remote -v | grep -q "origin"; then
  git remote add origin https://github.com/ShivankKMishra/farmer-accessapp.git
  echo "Remote 'origin' added."
else
  echo "Remote 'origin' already exists."
fi

# Create .gitignore if it doesn't exist
if [ ! -f .gitignore ]; then
  echo "Creating .gitignore..."
  cat > .gitignore << EOL
# Dependency directories
node_modules/
.pnp/
.pnp.js

# Build outputs
dist/
build/

# Environment variables
.env
.env.local
.env.*.local

# Log files
logs/
*.log
npm-debug.log*
yarn-debug.log*
yarn-error.log*

# OS generated files
.DS_Store
.DS_Store?
._*
.Spotlight-V100
.Trashes
ehthumbs.db
Thumbs.db

# Vercel deployment
.vercel/
EOL
fi

# Add all files
git add .

# Commit
git commit -m "Initial commit for Vercel deployment"

# Push to GitHub
git push -u origin main

echo "Repository pushed to GitHub successfully!"
echo "Now you can deploy it from the Vercel dashboard."