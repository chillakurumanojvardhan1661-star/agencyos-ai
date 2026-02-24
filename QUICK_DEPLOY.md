# 🚀 Quick Deploy Guide

**Time:** 15 minutes | **Status:** Ready (pending type generation)

---

## 1️⃣ Generate Types (2 min)

```bash
npm run gen:types
```

**If error:** `supabase link --project-ref YOUR_PROJECT_REF` then retry

---

## 2️⃣ Verify (30 sec)

```bash
npm run verify:prod
```

**Must show:** `✓ PRODUCTION READY` with 0 failed checks

---

## 3️⃣ Test Build (2 min)

```bash
npm run build
```

**Must complete** without errors

---

## 4️⃣ Deploy (5 min)

```bash
vercel --prod
```

**Or:** Push to GitHub (if auto-deploy enabled)

---

## 5️⃣ Configure Vercel (3 min)

### Add Domains
- `agencyos.ai`
- `app.agencyos.ai`

### Set Environment Variables
```env
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=xxx
SUPABASE_SERVICE_ROLE_KEY=xxx
OPENAI_API_KEY=sk-xxx
STRIPE_SECRET_KEY=sk_live_xxx
STRIPE_WEBHOOK_SECRET=whsec_xxx
NEXT_PUBLIC_APP_URL=https://app.agencyos.ai
NEXT_PUBLIC_SITE_URL=https://agencyos.ai
```

---

## 6️⃣ DNS Setup (2 min)

At your domain registrar:

```
Type: A, Name: @, Value: 76.76.21.21
Type: CNAME, Name: app, Value: cname.vercel-dns.com
```

---

## 7️⃣ Stripe Webhook (1 min)

Add endpoint: `https://app.agencyos.ai/api/stripe/webhook`

Events: `checkout.session.*`, `customer.subscription.*`

---

## 8️⃣ Smoke Test (2 min)

- [ ] `agencyos.ai` loads
- [ ] `app.agencyos.ai` redirects to login
- [ ] Signup works
- [ ] Trial activates
- [ ] Generate content works
- [ ] Upgrade redirects to Stripe

---

## ✅ Done!

**Monitor:** Vercel logs for first 24 hours

**Rollback:** `vercel rollback` if needed

---

**Full Guide:** See `DEPLOY_NOW.md`  
**Checklist:** See `DEPLOYMENT_CHECKLIST.md`
