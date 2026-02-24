# 🚀 Deploy AgencyOS AI to Production

**Status:** Ready to deploy (pending Supabase type generation)

Follow these steps in order. Total time: ~15 minutes.

---

## Step 1: Generate Real Supabase Types (REQUIRED)

```bash
# From repo root
npm run gen:types
```

**If it errors because project isn't linked:**
```bash
supabase login
supabase link --project-ref YOUR_PROJECT_REF
npm run gen:types
```

**Then commit the generated file:**
```bash
git add src/types/supabase.ts
git commit -m "Generate Supabase types for production"
```

**Common Issues:**
- **"supabase: command not found"** → Run: `npm install -g supabase`
- **"Project not found"** → Get your project ref from Supabase dashboard URL: `https://supabase.com/dashboard/project/YOUR_PROJECT_REF`
- **"Permission denied"** → Ensure you're logged in: `supabase login`

---

## Step 2: Run Production Readiness Gate

```bash
npm run verify:prod
```

**Expected output:**
```
✓ PRODUCTION READY

Passed: 20
Warnings: 0
Failed: 0
```

**If any checks fail, fix them before proceeding.**

---

## Step 3: Test Production Build Locally

```bash
npm run build
```

**This should complete without errors.**

If build passes, you're safe to deploy! 🎉

---

## Step 4: Deploy to Vercel

### Option A: Vercel CLI (Recommended)
```bash
# Install Vercel CLI if needed
npm i -g vercel

# Login
vercel login

# Deploy to production
vercel --prod
```

### Option B: Vercel Dashboard
1. Go to https://vercel.com/new
2. Import your Git repository
3. Configure:
   - Framework: Next.js
   - Build Command: `npm run build`
   - Output Directory: `.next`
4. Add environment variables (see below)
5. Click "Deploy"

---

## Step 5: Configure Domains in Vercel

1. Go to Project Settings → Domains
2. Add both domains:
   - `agencyos.ai` (root domain)
   - `app.agencyos.ai` (subdomain)
3. Vercel will provide DNS records

**Middleware handles routing automatically:**
- `agencyos.ai` → Marketing site
- `app.agencyos.ai` → SaaS app

---

## Step 6: Set Environment Variables in Vercel

Go to: Project Settings → Environment Variables

### Required Variables

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

# URLs
NEXT_PUBLIC_APP_URL=https://app.agencyos.ai
NEXT_PUBLIC_SITE_URL=https://agencyos.ai
```

### Optional Variables

```env
# Stripe Price IDs (from Stripe Dashboard)
STRIPE_PRICE_STARTER=price_xxx_starter
STRIPE_PRICE_PROFESSIONAL=price_xxx_professional
STRIPE_PRICE_ENTERPRISE=price_xxx_enterprise

# Analytics (if using)
NEXT_PUBLIC_POSTHOG_KEY=your_key
NEXT_PUBLIC_GA_ID=your_id
```

**Note:** `NODE_ENV=production` and `VERCEL_ENV=production` are set automatically by Vercel.

---

## Step 7: Configure DNS at Your Registrar

Add these records at your domain registrar (e.g., Namecheap, GoDaddy, Cloudflare):

### Root Domain (agencyos.ai)
```
Type: A
Name: @
Value: 76.76.21.21
TTL: 3600
```

### App Subdomain (app.agencyos.ai)
```
Type: CNAME
Name: app
Value: cname.vercel-dns.com
TTL: 3600
```

**DNS propagation can take up to 48 hours** (usually < 1 hour).

---

## Step 8: Configure Stripe Webhook

1. Go to Stripe Dashboard → Developers → Webhooks
2. Add endpoint: `https://app.agencyos.ai/api/stripe/webhook`
3. Select events:
   - `checkout.session.completed`
   - `customer.subscription.created`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
4. Copy webhook signing secret
5. Add to Vercel env vars as `STRIPE_WEBHOOK_SECRET`

---

## Step 9: Post-Deploy Smoke Test (10 minutes)

### Marketing Site (agencyos.ai)
- [ ] `https://agencyos.ai` loads
- [ ] `/pricing` page loads
- [ ] `/about` page loads
- [ ] `/demo` page loads
- [ ] CTA buttons link to `https://app.agencyos.ai/signup` with UTM parameters
- [ ] `https://agencyos.ai/sitemap.xml` accessible
- [ ] `https://agencyos.ai/robots.txt` accessible

### SaaS App (app.agencyos.ai)
- [ ] `https://app.agencyos.ai` redirects to login/signup
- [ ] Signup flow works
- [ ] Login flow works
- [ ] Create agency → trial starts + banner appears
- [ ] Upload CSV works
- [ ] Generate report works
- [ ] Download PDF works
- [ ] Share public report link opens
- [ ] Upgrade → Stripe checkout redirects

### Routing Verification
- [ ] `https://agencyos.ai/dashboard` does NOT show app (redirects to `/`)
- [ ] `https://app.agencyos.ai/pricing` does NOT show marketing (redirects to `/dashboard`)

---

## Step 10: Monitor for Issues

### First 24 Hours
- Check Vercel logs for errors
- Monitor Stripe webhook deliveries
- Test critical user flows
- Verify analytics tracking

### Tools
- Vercel Dashboard → Logs
- Stripe Dashboard → Webhooks → Events
- Supabase Dashboard → Logs
- Browser DevTools → Console

---

## Rollback Plan (If Needed)

### Immediate Rollback
```bash
vercel rollback
```

Or via Vercel Dashboard:
1. Go to Deployments
2. Find previous working deployment
3. Click "Promote to Production"

---

## Common Issues & Solutions

### Issue: Build fails with "Supabase types not generated"
**Solution:** Run `npm run gen:types` and commit the file

### Issue: "supabase: command not found"
**Solution:** Install Supabase CLI: `npm install -g supabase`

### Issue: Middleware not routing correctly
**Solution:** Verify both domains are added in Vercel project settings

### Issue: Stripe webhook not working
**Solution:** 
1. Check webhook URL is correct: `https://app.agencyos.ai/api/stripe/webhook`
2. Verify `STRIPE_WEBHOOK_SECRET` matches Stripe dashboard
3. Check Vercel logs for webhook errors

### Issue: Database connection errors
**Solution:**
1. Verify Supabase env vars are correct
2. Check Supabase project is not paused
3. Verify RLS policies are enabled

---

## Security Checklist

- [ ] All environment variables use production values (not test/dev)
- [ ] Stripe uses live keys (not test keys)
- [ ] HTTPS enforced on all routes
- [ ] Supabase RLS policies enabled
- [ ] Service role key kept secret (never exposed to client)

---

## Success Criteria

✅ Build passes locally: `npm run build`  
✅ Production readiness passes: `npm run verify:prod`  
✅ Both domains accessible (agencyos.ai, app.agencyos.ai)  
✅ Middleware routes correctly  
✅ Signup/login works  
✅ Trial system activates  
✅ Content generation works  
✅ Stripe checkout works  
✅ Webhooks deliver successfully  

---

## Next Steps After Deployment

1. **Monitor**: Watch logs for first 24 hours
2. **Test**: Run through all critical user flows
3. **Optimize**: Check Lighthouse scores
4. **Market**: Announce launch
5. **Iterate**: Gather user feedback

---

## Support Resources

- **Vercel Docs**: https://vercel.com/docs
- **Supabase Docs**: https://supabase.com/docs
- **Stripe Docs**: https://stripe.com/docs
- **Next.js Docs**: https://nextjs.org/docs

---

## Files to Review Before Deploy

- `DEPLOYMENT_CHECKLIST.md` - Comprehensive checklist
- `GENERATE_TYPES.md` - Detailed type generation guide
- `PRODUCTION_READINESS_GATE.md` - Readiness check documentation
- `BUILD_STATUS.md` - Build infrastructure status

---

**Last Updated:** February 19, 2026

**Ready to deploy?** Start with Step 1: `npm run gen:types`

🚀 Good luck!
