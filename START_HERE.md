# 🚀 START HERE - Deploy AgencyOS AI

**Welcome!** This guide will get you from code to production in 15 minutes.

---

## 🎯 Quick Start (Recommended)

### Option 1: Automated Script (Easiest)
```bash
./deploy.sh
```
This interactive script will guide you through every step.

### Option 2: Manual Commands (Full Control)
```bash
# 1. Install CLI tools
npm install -g supabase vercel

# 2. Login
supabase login
vercel login

# 3. Link Supabase project
supabase link --project-ref YOUR_PROJECT_REF

# 4. Generate types
npm run gen:types

# 5. Verify readiness
npm run verify:prod

# 6. Test build
npm run build

# 7. Deploy
vercel --prod
```

---

## 📚 Documentation Map

### Choose Your Path

**🏃 Fast Track (15 min)**
1. Run `./deploy.sh` (automated)
2. Or follow `QUICK_DEPLOY.md` (manual)

**🚶 Guided Path (30 min)**
1. Read `PRE_FLIGHT_CHECKLIST.md`
2. Follow `DEPLOY_NOW.md`
3. Complete post-deployment steps

**🧗 Comprehensive Path (60 min)**
1. Review `FINAL_DEPLOYMENT_STATUS.md`
2. Follow `DEPLOYMENT_CHECKLIST.md`
3. Verify with `PRODUCTION_READINESS_GATE.md`

---

## 📋 What You Need

### Accounts & Credentials
- [ ] Supabase project (with project ref ID)
- [ ] Stripe account (live mode)
- [ ] OpenAI API key
- [ ] Domain registered (agencyos.ai)
- [ ] Vercel account

### Local Setup
- [ ] Node.js installed
- [ ] npm installed
- [ ] Git repository ready

---

## 🎬 Deployment Flow

```
Install CLI Tools
      ↓
Login to Services
      ↓
Link Supabase Project
      ↓
Generate Types (npm run gen:types)
      ↓
Verify Readiness (npm run verify:prod)
      ↓
Test Build (npm run build)
      ↓
Deploy (vercel --prod)
      ↓
Configure Domains & DNS
      ↓
Set Environment Variables
      ↓
Configure Stripe Webhook
      ↓
Test & Monitor
      ↓
🎉 LIVE!
```

---

## ⚡ Quick Commands Reference

```bash
# Type generation
npm run gen:types              # Generate from linked project
npm run gen:types:url          # Generate from database URL

# Verification
npm run verify:prod            # Production readiness check
npm run build                  # Test production build

# Deployment
vercel --prod                  # Deploy to production
vercel rollback                # Rollback if needed

# Monitoring
vercel logs --follow           # Watch logs
```

---

## 🔧 Prerequisites Check

Run this to verify you're ready:

```bash
# Check Node.js
node --version

# Check npm
npm --version

# Check if Supabase CLI is installed
supabase --version

# Check if Vercel CLI is installed
vercel --version
```

**If any command fails, install the missing tool:**
```bash
# Install Supabase CLI
npm install -g supabase

# Install Vercel CLI
npm install -g vercel
```

---

## 🚨 Common First-Time Issues

### Issue: "supabase: command not found"
**Fix:** `npm install -g supabase`

### Issue: "vercel: command not found"
**Fix:** `npm install -g vercel`

### Issue: "Project not found"
**Fix:** Get your project ref from Supabase dashboard URL

### Issue: Type generation fails
**Fix:** Ensure you're logged in and project is linked

---

## 📖 Documentation Index

### Deployment Guides
- `START_HERE.md` ← You are here
- `QUICK_DEPLOY.md` - 8-step quick reference
- `DEPLOY_NOW.md` - Detailed step-by-step guide
- `PRE_FLIGHT_CHECKLIST.md` - Pre-deployment verification
- `DEPLOYMENT_CHECKLIST.md` - Comprehensive checklist

### Technical Documentation
- `FINAL_DEPLOYMENT_STATUS.md` - Complete status overview
- `PRODUCTION_READINESS_GATE.md` - Readiness verification
- `GENERATE_TYPES.md` - Type generation details
- `BUILD_STATUS.md` - Build infrastructure
- `README_DEPLOYMENT.md` - Documentation index

### Scripts
- `deploy.sh` - Automated deployment script
- `scripts/check-supabase-types.mjs` - Prebuild check
- `scripts/prod-readiness.mjs` - Production gate
- `scripts/generate-types.sh` - Type generation helper

---

## ✅ Success Criteria

After deployment, verify:

### Technical
- [ ] Build passes locally
- [ ] All readiness checks pass
- [ ] Both domains accessible
- [ ] SSL certificates active

### Functional
- [ ] Marketing site loads (agencyos.ai)
- [ ] App site loads (app.agencyos.ai)
- [ ] Signup/login works
- [ ] Trial system activates
- [ ] Content generation works
- [ ] Stripe checkout works
- [ ] Webhooks deliver

---

## 🎯 Your Next Action

**Choose one:**

### 1. Automated (Recommended for first-time)
```bash
./deploy.sh
```

### 2. Manual (If you prefer control)
```bash
# Open the quick deploy guide
cat QUICK_DEPLOY.md
```

### 3. Learn First (If you want to understand everything)
```bash
# Read the comprehensive guide
cat DEPLOY_NOW.md
```

---

## 💡 Pro Tips

1. **Use the automated script** (`./deploy.sh`) for your first deployment
2. **Keep your terminal open** during deployment to see progress
3. **Have your credentials ready** before starting
4. **Test locally first** with `npm run build`
5. **Monitor logs** for the first 24 hours after deployment

---

## 📞 Need Help?

### Quick Issues
- Check `QUICK_DEPLOY.md` for common solutions
- Run `npm run verify:prod` to diagnose issues

### Build Issues
- Check `BUILD_STATUS.md` for known issues
- Regenerate types: `npm run gen:types`

### Deployment Issues
- Check Vercel logs: `vercel logs`
- Verify environment variables in Vercel dashboard

---

## 🎉 Ready?

**Run this now:**
```bash
./deploy.sh
```

Or if you prefer manual control:
```bash
npm install -g supabase vercel
supabase login
vercel login
```

Then follow `QUICK_DEPLOY.md` for the remaining steps.

---

**Time to Production:** 15 minutes  
**Difficulty:** Easy (with automated script)  
**Support:** Full documentation available  

🚀 Let's deploy your app!
