# AgencyOS AI - Production Deployment Checklist

## Pre-Deployment Status

### Build Issues Identified (Step 1)
- ✅ Route conflict resolved (removed duplicate `/pricing` page)
- ✅ Supabase client import fixed
- ✅ PDF generator syntax errors fixed
- ✅ Pricing plans type consistency fixed
- ✅ Created typed Supabase client with Database types
- ✅ Updated all API routes to use `getSupabaseRouteClient()`
- ✅ Added type assertions to Supabase queries
- ✅ **Build guard implemented** - prevents deploying with placeholder types
- ⚠️ **BLOCKING**: Need to generate real Supabase types

### Current Status
**The build is 95% complete but blocked by Supabase type generation.**

We've implemented:
1. ✅ Typed Supabase client architecture
2. ✅ Prebuild check script that enforces real types
3. ✅ One-command type generation: `npm run gen:types`
4. ✅ Comprehensive documentation

**The build will automatically fail if you try to deploy with placeholder types.**

### REQUIRED ACTION TO UNBLOCK BUILD
**Generate real Supabase types from your database:**

```bash
# Quick method (recommended)
npm run gen:types

# Or step-by-step
npm install -g supabase
supabase login
supabase link --project-ref YOUR_PROJECT_REF
supabase gen types typescript --linked > src/types/supabase.ts

# Verify production readiness
npm run verify:prod

# Verify build passes
npm run build
```

**See `GENERATE_TYPES.md` for detailed instructions including CI/CD setup.**

### Build Guard
When you run `npm run build`, it will:
1. Run prebuild check: `node scripts/check-supabase-types.mjs`
2. Verify `__SUPABASE_TYPES_GENERATED__ === true` in `src/types/supabase.ts`
3. In production: Ignore `__DEV_MODE_UNBLOCK__` flag completely
4. Block build if placeholder types detected
5. Show clear instructions on how to fix

**Before deploying, run the production readiness gate:**
```bash
npm run verify:prod
```

This comprehensive check verifies:
- Supabase types generated
- Environment variables documented
- Middleware configured
- SEO routes exist
- Critical files present
- Database migrations present

**Console output on failure:**
```
╔═══════════════════════════════════════════════╗
║  🚫  SUPABASE TYPES NOT GENERATED             ║
║                                               ║
║  You are using placeholder Supabase types.    ║
║  Production builds require real generated     ║
║  types from your database.                    ║
╚═══════════════════════════════════════════════╝

✗ ERROR Build blocked: Placeholder Supabase types detected

To fix this, generate real types:
  npm run gen:types
```

### What We've Done
1. Created `src/types/supabase.ts` with placeholder types + guard flag
2. Created `scripts/check-supabase-types.mjs` - prebuild enforcement script
3. Created `scripts/prod-readiness.mjs` - comprehensive production readiness gate
4. Added npm scripts:
   - `prebuild` - Runs automatically before build
   - `gen:types` - One-command type generation
   - `gen:types:url` - Generate from database URL
   - `verify:prod` - Production readiness verification
5. Created typed Supabase client helpers in `src/lib/supabase/server.ts`
6. Updated all 20+ API routes to use `getSupabaseRouteClient()`
7. Centralized unsafe type helpers in `src/lib/supabase/unsafe.ts`
8. Added production enforcement (dev mode forced off in production)
9. Comprehensive documentation in `GENERATE_TYPES.md`

### Files Created/Modified
**New Files:**
- `scripts/check-supabase-types.mjs` - Prebuild check script
- `scripts/prod-readiness.mjs` - Production readiness gate
- `src/lib/supabase/unsafe.ts` - Centralized unsafe helpers
- `GENERATE_TYPES.md` - Complete type generation guide
- `BUILD_NOTES.md` - Technical notes on type issues
- `BUILD_STATUS.md` - Build infrastructure status
- `PRODUCTION_TYPE_ENFORCEMENT.md` - Production enforcement documentation

**Modified Files:**
- `src/types/supabase.ts` - Added `__SUPABASE_TYPES_GENERATED__` flag
- `package.json` - Added prebuild script and gen:types commands
- `src/lib/supabase/server.ts` - Typed client helpers
- `src/lib/supabase/client.ts` - Fixed browser client
- `src/app/api/**/*.ts` - All API routes use typed client

### After Generating Real Types
1. ✅ Build passes immediately
2. ✅ Prebuild check succeeds
3. ✅ Full TypeScript autocomplete for queries
4. ✅ Can optionally remove `as any` casts
5. ✅ Ready for production deployment

---

## Step 1: Pre-Deploy Build Verification

### 1.0 Production Readiness Check
**Run comprehensive production readiness verification:**
```bash
npm run verify:prod
```

This checks:
- ✅ Supabase types are generated (not placeholder)
- ✅ Required environment variables documented
- ✅ Middleware configuration valid
- ✅ SEO routes (sitemap, robots) exist
- ✅ Critical files present
- ✅ Required npm scripts exist
- ✅ Database migrations present

**The build will fail if any critical checks fail.**

- [ ] All production readiness checks pass
- [ ] No failed checks in output

### 1.1 Install Dependencies
```bash
npm ci
```

### 1.2 Run Linter
```bash
npm run lint
```
- [ ] No linting errors

### 1.3 Build for Production
```bash
npm run build
```
- [ ] Build completes successfully
- [ ] No TypeScript errors
- [ ] No webpack errors

### 1.4 Test Production Build Locally
```bash
npm run start
```

### 1.5 Verify Routes Locally
Test these routes at `http://localhost:3000`:

**Marketing Routes:**
- [ ] `/` - Home page loads
- [ ] `/pricing` - Pricing page loads
- [ ] `/about` - About page loads
- [ ] `/demo` - Demo page loads

**SaaS App Routes:**
- [ ] `/dashboard` - Dashboard loads (requires auth)
- [ ] `/dashboard/clients` - Clients page loads
- [ ] `/dashboard/generate` - Generate page loads
- [ ] `/dashboard/reports` - Reports page loads
- [ ] `/dashboard/billing` - Billing page loads

**API Routes:**
- [ ] `/api/health` - Health check (if implemented)
- [ ] Other API routes accessible

**Public Routes:**
- [ ] `/public/report/[token]` - Public report sharing works

---

## Step 2: Deployment Configuration

### 2.1 Environment Variables
Create `.env.production` or configure in Vercel dashboard:

**Required Variables:**
```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# OpenAI
OPENAI_API_KEY=sk-your_openai_key

# Stripe
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_your_key
STRIPE_SECRET_KEY=sk_live_your_key
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret

# Stripe Price IDs (from Stripe Dashboard)
STRIPE_PRICE_STARTER=price_xxx_starter
STRIPE_PRICE_PROFESSIONAL=price_xxx_professional
STRIPE_PRICE_ENTERPRISE=price_xxx_enterprise

# Production URLs
NEXT_PUBLIC_APP_URL=https://app.agencyos.ai
NEXT_PUBLIC_SITE_URL=https://agencyos.ai
```

**Optional Variables:**
```env
# Analytics (if using)
NEXT_PUBLIC_ANALYTICS_ID=your_analytics_id
```

### 2.2 Vercel Configuration
Create `vercel.json` (if needed):
```json
{
  "buildCommand": "npm run build",
  "devCommand": "npm run dev",
  "installCommand": "npm install",
  "framework": "nextjs",
  "regions": ["iad1"]
}
```

### 2.3 Middleware Verification
- [ ] `src/middleware.ts` correctly routes based on hostname
- [ ] Marketing routes (agencyos.ai) show only marketing pages
- [ ] App routes (app.agencyos.ai) show only SaaS app pages
- [ ] API routes work on both domains

---

## Step 3: Vercel Production Deployment

### 3.1 Deployment Option
**RECOMMENDED: Option A - Single Vercel Project + Middleware**

Benefits:
- Single deployment
- Shared API routes
- Simpler management
- Domain-based routing via middleware

### 3.2 Deploy to Vercel

**Via Vercel CLI:**
```bash
# Install Vercel CLI
npm i -g vercel

# Login
vercel login

# Deploy
vercel --prod
```

**Via Vercel Dashboard:**
1. Go to https://vercel.com/new
2. Import Git repository
3. Configure project:
   - Framework Preset: Next.js
   - Build Command: `npm run build`
   - Output Directory: `.next`
4. Add environment variables
5. Deploy

### 3.3 Configure Domains in Vercel
1. Go to Project Settings → Domains
2. Add domains:
   - `agencyos.ai` (root domain)
   - `www.agencyos.ai` (redirect to root)
   - `app.agencyos.ai` (subdomain)
3. Vercel will provide DNS records

---

## Step 4: DNS Configuration

### 4.1 DNS Records at Registrar
Add these records at your domain registrar (e.g., Namecheap, GoDaddy, Cloudflare):

**For Root Domain (agencyos.ai):**
```
Type: A
Name: @
Value: 76.76.21.21 (Vercel's IP)
TTL: 3600
```

**For WWW Subdomain:**
```
Type: CNAME
Name: www
Value: cname.vercel-dns.com
TTL: 3600
```

**For App Subdomain (app.agencyos.ai):**
```
Type: CNAME
Name: app
Value: cname.vercel-dns.com
TTL: 3600
```

### 4.2 Verify DNS Propagation
```bash
# Check root domain
dig agencyos.ai

# Check app subdomain
dig app.agencyos.ai

# Check from different location
nslookup agencyos.ai 8.8.8.8
```

- [ ] DNS records propagated (can take up to 48 hours)
- [ ] SSL certificates issued by Vercel

---

## Step 5: Post-Deployment Smoke Tests

### 5.1 Marketing Site (agencyos.ai)
- [ ] `https://agencyos.ai` loads correctly
- [ ] `/pricing` page loads
- [ ] `/about` page loads
- [ ] `/demo` page loads
- [ ] CTA buttons link to `https://app.agencyos.ai/signup` with UTM parameters
- [ ] `https://agencyos.ai/sitemap.xml` accessible
- [ ] `https://agencyos.ai/robots.txt` accessible
- [ ] OG tags present (check with https://www.opengraph.xyz/)
- [ ] No console errors in browser

### 5.2 SaaS App (app.agencyos.ai)
- [ ] `https://app.agencyos.ai` redirects to login/signup
- [ ] Signup flow works
- [ ] Login flow works
- [ ] Dashboard loads after login
- [ ] Create agency triggers trial initialization
- [ ] Upload CSV works
- [ ] Generate report works
- [ ] Download PDF works
- [ ] Share public link works (generates token)
- [ ] Public report accessible at `https://agencyos.ai/public/report/[token]`
- [ ] Upgrade flow redirects to Stripe Checkout
- [ ] Stripe webhook events handled successfully

### 5.3 Routing Checks
- [ ] `https://agencyos.ai/dashboard` does NOT show app (redirects to `/`)
- [ ] `https://app.agencyos.ai/pricing` does NOT show marketing (redirects to `/dashboard`)
- [ ] API routes work on both domains:
  - `https://agencyos.ai/api/...`
  - `https://app.agencyos.ai/api/...`

### 5.4 Analytics Checks
- [ ] Marketing analytics fires on CTA clicks
- [ ] `marketing_click_start_trial` event tracked
- [ ] App analytics still works (trial events, conversions, etc.)
- [ ] Admin analytics dashboard accessible (admin only)

### 5.5 Performance Checks
- [ ] Lighthouse score > 90 for marketing pages
- [ ] Page load time < 3 seconds
- [ ] No broken images or assets
- [ ] Mobile responsive design works

---

## Step 6: Database & External Services

### 6.1 Supabase
- [ ] All migrations applied to production database
- [ ] RLS policies enabled and tested
- [ ] Database backups configured
- [ ] Connection pooling configured (if needed)

### 6.2 Stripe
- [ ] Webhook endpoint configured: `https://app.agencyos.ai/api/stripe/webhook`
- [ ] Webhook secret matches `STRIPE_WEBHOOK_SECRET`
- [ ] Test webhook delivery in Stripe Dashboard
- [ ] Price IDs match environment variables
- [ ] Customer Portal configured

### 6.3 OpenAI
- [ ] API key valid and has sufficient credits
- [ ] Rate limits configured
- [ ] Usage monitoring enabled

---

## Step 7: Monitoring & Alerts

### 7.1 Error Tracking
- [ ] Set up error tracking (Sentry, LogRocket, etc.)
- [ ] Configure alerts for critical errors
- [ ] Test error reporting

### 7.2 Uptime Monitoring
- [ ] Set up uptime monitoring (UptimeRobot, Pingdom, etc.)
- [ ] Monitor both `agencyos.ai` and `app.agencyos.ai`
- [ ] Configure alerts for downtime

### 7.3 Analytics
- [ ] Google Analytics or Plausible configured
- [ ] Conversion tracking set up
- [ ] Custom events tracked

---

## Step 8: Security Checklist

- [ ] All environment variables use production values (not test/dev)
- [ ] Stripe uses live keys (not test keys)
- [ ] HTTPS enforced on all routes
- [ ] CORS configured correctly
- [ ] Rate limiting enabled on API routes
- [ ] SQL injection protection (via Supabase RLS)
- [ ] XSS protection enabled
- [ ] CSRF protection enabled

---

## Step 9: Rollback Plan

### If Deployment Fails:
1. **Immediate Rollback via Vercel:**
   ```bash
   vercel rollback
   ```
   Or via Vercel Dashboard: Deployments → Previous Deployment → Promote to Production

2. **DNS Rollback:**
   - Revert DNS records to previous values
   - Wait for propagation (up to 48 hours)

3. **Database Rollback:**
   - Restore from latest backup
   - Revert migrations if needed

### Rollback Checklist:
- [ ] Previous deployment URL saved
- [ ] Database backup created before deployment
- [ ] DNS records documented
- [ ] Rollback procedure tested in staging

---

## Step 10: Post-Launch Tasks

### Immediate (Day 1):
- [ ] Monitor error logs for 24 hours
- [ ] Check analytics for traffic patterns
- [ ] Verify webhook deliveries
- [ ] Test critical user flows

### Week 1:
- [ ] Review performance metrics
- [ ] Analyze conversion funnel
- [ ] Gather user feedback
- [ ] Fix any reported bugs

### Ongoing:
- [ ] Weekly database backups
- [ ] Monthly security audits
- [ ] Quarterly dependency updates
- [ ] Regular performance optimization

---

## Known Issues & Limitations

### Current Blockers:
1. **Supabase Type Mismatches**: Build fails due to TypeScript errors in API routes
   - **Solution**: Generate Supabase types or add type assertions
   - **Priority**: CRITICAL - blocks deployment

### Post-Launch Improvements:
1. PDF generation uses placeholder (Puppeteer not integrated)
2. Email notifications not implemented
3. Advanced analytics features pending
4. White-label branding partially implemented

---

## Support & Documentation

### Internal Documentation:
- Architecture: `ARCHITECTURE.md`
- API Documentation: `API_DOCS.md` (if exists)
- Database Schema: `supabase/migrations/`

### External Resources:
- Next.js Deployment: https://nextjs.org/docs/deployment
- Vercel Documentation: https://vercel.com/docs
- Supabase Documentation: https://supabase.com/docs

---

## Deployment Sign-Off

**Deployed By:** _________________  
**Date:** _________________  
**Version:** _________________  
**Deployment URL:** _________________  

**Verified By:** _________________  
**Date:** _________________  

---

## Emergency Contacts

- **DevOps Lead:** [Contact Info]
- **Backend Lead:** [Contact Info]
- **Frontend Lead:** [Contact Info]
- **Product Owner:** [Contact Info]

---

**Last Updated:** February 19, 2026
