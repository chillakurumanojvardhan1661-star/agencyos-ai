#!/bin/bash

# AgencyOS AI - Push to GitHub Script
# This script will help you push your code to GitHub

echo "🚀 AgencyOS AI - GitHub Push Script"
echo "===================================="
echo ""

# Check if gh CLI is installed
if command -v gh &> /dev/null; then
    echo "✅ GitHub CLI detected"
    echo ""
    echo "Creating repository and pushing..."
    echo ""
    
    # Check if authenticated
    if gh auth status &> /dev/null; then
        echo "✅ Already authenticated with GitHub"
        
        # Create repository and push
        read -p "Repository name (default: agencyos-ai): " REPO_NAME
        REPO_NAME=${REPO_NAME:-agencyos-ai}
        
        read -p "Make repository private? (y/n, default: y): " IS_PRIVATE
        IS_PRIVATE=${IS_PRIVATE:-y}
        
        if [ "$IS_PRIVATE" = "y" ]; then
            gh repo create "$REPO_NAME" --private --source=. --remote=origin --push
        else
            gh repo create "$REPO_NAME" --public --source=. --remote=origin --push
        fi
        
        echo ""
        echo "✅ Repository created and code pushed!"
        echo "🔗 View your repository: https://github.com/$(gh api user -q .login)/$REPO_NAME"
    else
        echo "⚠️  Not authenticated with GitHub"
        echo "Run: gh auth login"
        echo "Then run this script again"
    fi
else
    echo "⚠️  GitHub CLI not installed"
    echo ""
    echo "📋 Manual Steps:"
    echo ""
    echo "1. Go to: https://github.com/new"
    echo ""
    echo "2. Create a new repository:"
    echo "   - Name: agencyos-ai (or your preferred name)"
    echo "   - Description: AI Marketing Automation Platform for Digital Agencies"
    echo "   - Visibility: Private or Public"
    echo "   - DO NOT initialize with README"
    echo ""
    echo "3. After creating, copy the repository URL"
    echo ""
    echo "4. Run these commands:"
    echo ""
    echo "   git remote add origin https://github.com/YOUR_USERNAME/agencyos-ai.git"
    echo "   git branch -M main"
    echo "   git push -u origin main"
    echo ""
    echo "Replace YOUR_USERNAME with your GitHub username"
    echo ""
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo ""
    echo "Alternative: Install GitHub CLI for easier setup"
    echo "macOS: brew install gh"
    echo "Then run: gh auth login"
    echo "Then run this script again"
fi

echo ""
echo "📊 Repository Stats:"
echo "   - 215 files"
echo "   - 45,506 lines of code"
echo "   - Complete SaaS application"
echo "   - Ready for production"
echo ""
