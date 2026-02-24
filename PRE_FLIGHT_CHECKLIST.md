# 🚀 Pre-Flight Checklist - Ready to Deploy

**Run this checklist before deployment to ensure everything is ready.**

---

## ✅ System Requirements

### Install Required CLI Tools

**Supabase CLI** (for type generation)
```bash
npm install -g supabase
# Verify installation
supabase --version
```

**Vercel CLI** (for deployment)
```bash
npm install -g vercel
# Verify installation
vercel --version
```

---

## ✅ Prerequisites Checklist

### 1. Supabase Setup
- [ ] Supabase project created
- [ ] Database migrations applied (11 migrations)
- [ ] RLS policies enabled
- [ ] Project reference ID available
- [ ] Service role key available
- [ ] Anon key available

**Get your project ref:**
- Go to: https://supabase.com/dashboard
- Open your project
- URL format: `https://supabase.com/dashboard/project/YOUR_PROJECT_REF`

### 2. Stripe Setup
- [ ] Stripe account created
- [ ] Switched to LIVE mode (not test mode)
- [ ] Products created (Starter, Professional, Enterprise)
- [ ] Price IDs copied
- [ ] Live API keys available
- [ ] Webhook endpoint ready to configure

### 3. OpenAI Setup
- [ ] OpenAI account created
- [ ] API key generated
- [ ] Billing configured
- [ ] Usage limits set (optional)

### 4. Domain Setup
- [ ] Domain registered (agencyos.ai)
- [ ] Access to DNS settings
- [ ] Ready to add DNS records

### 5. Vercel Setup
- [ ] Vercel account created
- [ ] Git repository connected (optional)
- [ ] Ready to configure environment variables

---

## ✅ Local Verification

### Step 1: Install Dependencies
```bash
npm ci
```
- [ ] No errors during installation

### Step 2: Check Environment Variables
```bash
cat .env.example
```
- [ ] All required variables documented
- [ ] You have values for all variables

### Step 3: Verify Build Scripts
```bash
npm run --silent | grep -E "(gen:types|verify:prod|prebuild)"
```
Expected output:
```
gen:types
gen:types:url
verify:prod
prebuild
```
- [ ] All scripts present

### Step 4: Check Critical Files
```bash
ls -la src/types/supabase.ts
ls -la scripts/check-supabase-types.mjs
ls -la scripts/prod-readiness.mjs
ls -la src/middleware.ts
```
- [ ] All files exist

---

## ✅ Deployment Steps

### Step 1: Install CLI Tools (if not installed)
```bash
# Supabase CLI
npm install -g supabase

# Vercel CLI
npm install -g vercel
```

### Step 2: Login to Services
```bash
# Login to Supabase
supabase login

# Login to Vercel
vercel login
```

### Step 3: Link Supabase Project
```bash
supabase link --project-ref YOUR_PROJECT_REF
```
Replace `YOUR_PROJECT_REF` with your actual project reference.

### Step 4: Generate Supabase Types
```bash
npm run gen:types
```
- [ ] Command completes successfully
- [ ] `src/types/supabase.ts` updated
- [ ] File contains real types (not placeholder)

### Step 5: Verify Production Readiness
```bash
npm run verify:prod
```
Expected output:
```
✓ PRODUCTION READY
Passed: 20
Failed: 0
```
- [ ] All checks pass
- [ ] Exit code 0

### Step 6: Test Production Build
```bash
npm run build
```
- [ ] Build completes without errors
- [ ] No TypeScript errors
- [ ] No webpack errors

### Step 7: Deploy to Vercel
```bash
vercel --prod
```
- [ ] Deployment succeeds
- [ ] Deployment URL provided

### Step 8: Configure Vercel Project

**Add Domains:**
1. Go to Vercel Dashboard → Your Project → Settings → Domains
2. Add: `agencyos.ai`
3. Add: `app.agencyos.ai`

**Set Environment Variables:**
1. Go to Vercel Dashboard → Your Project → Settings → Environment Variables
2. Add all required variables (see below)

### Step 9: Configure DNS
At your domain registrar, add:

```
Type: A
Name: @
Value: 76.76.21.21
TTL: 3600

Type: CNAME
Name: app
Value: cname.vercel-dns.com
TTL: 3600
```

### Step 10: Configure Stripe Webhook
1. Go to Stripe Dashboard → Developers → Webhooks
2. Add endpoint: `https://app.agencyos.ai/api/stripe/webhook`
3. Select events:
   - `checkout.session.completed`
   - `customer.subscription.created`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
4. Copy webhook signing secret
5. Add to Vercel environment variables

---

## ✅ Environment Variables

### Required in Vercel

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# OpenAI
OPENAI_API_KEY=sk-proj-xxxxx

# Stripe (LIVE keys)
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_xxxxx
STRIPE_SECRET_KEY=sk_live_xxxxx
STRIPE_WEBHOOK_SECRET=whsec_xxxxx

# URLs
NEXT_PUBLIC_APP_URL=https://app.agencyos.ai
NEXT_PUBLIC_SITE_URL=https://agencyos.ai

# Stripe Price IDs (optional but recommended)
STRIPE_PRICE_STARTER=price_xxxxx
STRIPE_PRICE_PROFESSIONAL=price_xxxxx
STRIPE_PRICE_ENTERPRISE=price_xxxxx
```

**How to get these values:**

**Supabase:**
- Dashboard → Project Settings → API
- `NEXT_PUBLIC_SUPABASE_URL`: Project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`: anon/public key
- `SUPABASE_SERVICE_ROLE_KEY`: service_role key (keep secret!)

**OpenAI:**
- Dashboard → API Keys → Create new secret key

**Stripe:**
- Dashboard → Developers → API Keys
- Use LIVE mode keys (not test mode)
- Webhook secret from webhook configuration

---

## ✅ Post-Deployment Verification

### Smoke Tests

**Marketing Site (agencyos.ai):**
```bash
curl -I https://agencyos.ai
curl -I https://agencyos.ai/pricing
curl -I https://agencyos.ai/about
curl -I https://agencyos.ai/demo
curl -I https://agencyos.ai/sitemap.xml
curl -I https://agencyos.ai/robots.txt
```
- [ ] All return 200 OK

**App Site (app.agencyos.ai):**
```bash
curl -I https://app.agencyos.ai
```
- [ ] Returns 200 or 307 (redirect to login)

**Manual Tests:**
- [ ] Visit `https://agencyos.ai` - marketing site loads
- [ ] Visit `https://app.agencyos.ai` - redirects to login
- [ ] Signup flow works
- [ ] Login flow works
- [ ] Create agency → trial banner appears
- [ ] Upload CSV works
- [ ] Generate content works
- [ ] Download PDF works
- [ ] Share report link works
- [ ] Upgrade redirects to Stripe

**Routing Tests:**
- [ ] `https://agencyos.ai/dashboard` does NOT show app
- [ ] `https://app.agencyos.ai/pricing` does NOT show marketing

---

## ✅ Monitoring Setup

### Vercel Logs
```bash
vercel logs --follow
```

### Check Stripe Webhooks
- Stripe Dashboard → Developers → Webhooks
- Click on your endpoint
- View recent deliveries
- [ ] Webhooks delivering successfully

### Check Supabase Logs
- Supabase Dashboard → Logs
- [ ] No connection errors
- [ ] Queries executing successfully

---

## ✅ Rollback Plan

**If something goes wrong:**

```bash
# Rollback deployment
vercel rollback

# Or via dashboard
# Vercel Dashboard → Deployments → Previous → Promote to Production
```

**Database rollback:**
- Supabase Dashboard → Database → Backups
- Restore from latest backup if needed

---

## ✅ Success Criteria

### Technical
- [x] Supabase CLI installed
- [x] Vercel CLI installed
- [ ] Types generated: `npm run gen:types`
- [ ] Readiness passes: `npm run verify:prod`
- [ ] Build passes: `npm run build`
- [ ] Deployed: `vercel --prod`

### Functional
- [ ] Both domains accessible
- [ ] Middleware routes correctly
- [ ] Auth flows work
- [ ] Trial system activates
- [ ] Content generation works
- [ ] Stripe checkout works
- [ ] Webhooks deliver

### Performance
- [ ] Page load < 3 seconds
- [ ] Lighthouse score > 90
- [ ] No console errors

---

## 🚨 Common Issues

### Issue: "supabase: command not found"
```bash
npm install -g supabase
# Or with homebrew on macOS
brew install supabase/tap/supabase
```

### Issue: "vercel: command not found"
```bash
npm install -g vercel
```

### Issue: "Project not found" when linking
- Verify project ref is correct
- Check you're logged in: `supabase login`
- Try: `supabase projects list`

### Issue: Type generation fails
```bash
# Try with database URL instead
export SUPABASE_DB_URL="postgresql://postgres:[password]@db.[ref].supabase.co:5432/postgres"
npm run gen:types:url
```

### Issue: Build fails after type generation
```bash
# Verify types were generated
grep "__SUPABASE_TYPES_GENERATED__" src/types/supabase.ts
# Should show: export const __SUPABASE_TYPES_GENERATED__ = true

# Try clean build
rm -rf .next
npm run build
```

### Issue: Middleware not routing correctly
- Verify both domains added in Vercel project settings
- Check middleware.ts exports config
- Redeploy: `vercel --prod --force`

---

## 📞 Need Help?

**Documentation:**
- `QUICK_DEPLOY.md` - Quick reference
- `DEPLOY_NOW.md` - Detailed guide
- `DEPLOYMENT_CHECKLIST.md` - Full checklist

**External Resources:**
- Vercel: https://vercel.com/docs
- Supabase: https://supabase.com/docs
- Stripe: https://stripe.com/docs

---

## ✅ Ready to Deploy?

**Run these commands in order:**

```bash
# 1. Install CLI tools
npm install -g supabase vercel

# 2. Login
supabase login
vercel login

# 3. Link project
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

**Then configure:**
- Domains in Vercel
- Environment variables in Vercel
- DNS records at registrar
- Stripe webhook

**Finally test:**
- Marketing site loads
- App site loads
- All features work

---

**Status:** Ready to proceed with deployment  
**Time Required:** ~15 minutes  
**Last Updated:** February 19, 2026

🚀 Let's deploy!
