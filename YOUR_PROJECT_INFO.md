# Your AgencyOS AI Project Information

**Project Reference ID:** `bqkvakodsxiqkjuvbrqo`

---

## 🔗 Quick Commands for Your Project

### Link Your Project
```bash
supabase link --project-ref bqkvakodsxiqkjuvbrqo
```

### Generate Types
```bash
npm run gen:types
```

### Verify Production Readiness
```bash
npm run verify:prod
```

### Build & Deploy
```bash
npm run build
vercel --prod
```

---

## 🔑 Get Your Database Password

**Direct Link:** https://supabase.com/dashboard/project/bqkvakodsxiqkjuvbrqo/settings/database

1. Click the link above
2. Scroll to "Database Password" section
3. If you don't have it, click "Reset Database Password"
4. Copy the new password
5. Use it when running `supabase link`

---

## 📊 Your Project Dashboard

**Main Dashboard:** https://supabase.com/dashboard/project/bqkvakodsxiqkjuvbrqo

**Quick Links:**
- Database: https://supabase.com/dashboard/project/bqkvakodsxiqkjuvbrqo/editor
- API Settings: https://supabase.com/dashboard/project/bqkvakodsxiqkjuvbrqo/settings/api
- Database Settings: https://supabase.com/dashboard/project/bqkvakodsxiqkjuvbrqo/settings/database

---

## 🚀 Deployment Workflow

```bash
# 1. Link project (do this now)
supabase link --project-ref bqkvakodsxiqkjuvbrqo

# 2. Generate types
npm run gen:types

# 3. Verify readiness
npm run verify:prod

# 4. Test build
npm run build

# 5. Deploy
vercel --prod
```

---

## 📋 Environment Variables You'll Need

After deployment, set these in Vercel:

```env
# Supabase (get from: https://supabase.com/dashboard/project/bqkvakodsxiqkjuvbrqo/settings/api)
NEXT_PUBLIC_SUPABASE_URL=https://bqkvakodsxiqkjuvbrqo.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<from API settings>
SUPABASE_SERVICE_ROLE_KEY=<from API settings>

# OpenAI
OPENAI_API_KEY=sk-proj-xxxxx

# Stripe (LIVE mode)
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_xxxxx
STRIPE_SECRET_KEY=sk_live_xxxxx
STRIPE_WEBHOOK_SECRET=whsec_xxxxx

# URLs
NEXT_PUBLIC_APP_URL=https://app.agencyos.ai
NEXT_PUBLIC_SITE_URL=https://agencyos.ai
```

---

## ✅ Next Steps

**Right now:**
1. Run: `supabase link --project-ref bqkvakodsxiqkjuvbrqo`
2. Enter your database password when prompted
3. Run: `npm run gen:types`

**After types are generated:**
1. Run: `npm run verify:prod`
2. Run: `npm run build`
3. Run: `vercel --prod`

---

**Time to Production:** ~10 minutes from now

**Your Project Ref:** `bqkvakodsxiqkjuvbrqo`
