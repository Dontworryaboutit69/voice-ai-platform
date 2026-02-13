#!/bin/bash

echo "🚀 Voice AI Platform - GitHub Setup & Deploy"
echo ""
echo "This script will help you push to GitHub and deploy to Vercel"
echo ""

# Check if git remote exists
if git remote | grep -q "origin"; then
    echo "✅ Git remote 'origin' already configured"
    git remote -v
else
    echo "⚠️  No git remote configured"
    echo ""
    echo "Please follow these steps:"
    echo "1. Go to https://github.com/new"
    echo "2. Create a new repository called 'voice-ai-platform'"
    echo "3. Copy the repository URL"
    echo ""
    read -p "Paste your GitHub repository URL: " REPO_URL

    git remote add origin "$REPO_URL"
    echo "✅ Git remote added"
fi

echo ""
echo "📤 Pushing to GitHub..."
git push -u origin main

if [ $? -eq 0 ]; then
    echo ""
    echo "✅ Successfully pushed to GitHub!"
    echo ""
    echo "📋 Next steps:"
    echo "1. Go to https://vercel.com/new"
    echo "2. Import your GitHub repository"
    echo "3. Add the environment variables from .env.local"
    echo "4. Deploy!"
    echo ""
    echo "📖 Full guide: /Users/kylekotecha/Desktop/voice-ai-platform/DEPLOYMENT-GUIDE.md"
else
    echo ""
    echo "❌ Push failed. Please check your GitHub credentials and try again."
    echo ""
    echo "If you need to authenticate with GitHub:"
    echo "  git config --global user.email 'your-email@example.com'"
    echo "  git config --global user.name 'Your Name'"
fi
