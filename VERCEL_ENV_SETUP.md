# Vercel Environment Variables Setup

## 🎯 Your Vercel Project

**Project URL:** https://vercel.com/manojs-projects-5f211bbe/agencyos-ai

**Deployment Failed Because:** Environment variables are not set yet.

---

## 🔑 Step 1: Get Your Supabase Keys

1. Go to: https://supabase.com/dashboard/project/bqkvakodsxiqkjuvbrqo/settings/api
2. Copy these values:

```
Project URL: https://bqkvakodsxiqkjuvbrqo.supabase.co
anon/public key: [Copy from "Project API keys" section]
service_role key: [Copy from "Project API keys" section - KEEP SECRET]
```

---

## 🔑 Step 2: Set Environment Variables in Vercel

1. Go to: https://vercel.com/manojs-projects-5f211bbe/agencyos-ai/settings/environment-variables

2. Add these variables (click "Add" for each):

### Supabase Variables

| Name | Value | Environment |
|------|-------|-------------|
| `NEXT_PUBLIC_SUPABASE_URL` | `https://bqkvakodsxiqkjuvbrqo.supabase.co` | Production, Preview, Development |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | [Your anon key from Supabase] | Production, Preview, Development |
| `SUPABASE_SERVICE_ROLE_KEY` | [Your service_role key from Supabase] | Production, Preview, Development |

### OpenAI Variable

| Name | Value | Environment |
|------|-------|-------------|
| `OPENAI_API_KEY` | [Your OpenAI API key] | Production, Preview, Development |

### Stripe Variables (Use TEST keys for now)

| Name | Value | Environment |
|------|-------|-------------|
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | `pk_test_...` | Production, Preview, Development |
| `STRIPE_SECRET_KEY` | `sk_test_...` | Production, Preview, Development |
| `STRIPE_WEBHOOK_SECRET` | `whsec_...` (leave empty for now) | Production, Preview, Development |

### Stripe Price IDs (Create in Stripe Dashboard first)

| Name | Value | Environment |
|------|-------|-------------|
| `STRIPE_PRICE_STARTER` | `price_...` (create in Stripe) | Production, Preview, Development |
| `STRIPE_PRICE_PROFESSIONAL` | `price_...` (create in Stripe) | Production, Preview, Development |
| `STRIPE_PRICE_ENTERPRISE` | `price_...` (create in Stripe) | Production, Preview, Development |

### App URLs

| Name | Value | Environment |
|------|-------|-------------|
| `NEXT_PUBLIC_APP_URL` | `https://agencyos-o0iu5haz2-manojs-projects-5f211bbe.vercel.app` | Production |
| `NEXT_PUBLIC_SITE_URL` | `https://agencyos-o0iu5haz2-manojs-projects-5f211bbe.vercel.app` | Production |

---

## 🚀 Step 3: Redeploy

After adding all environment variables:

```bash
vercel --prod
```

Or trigger a redeploy from the Vercel dashboard.

---

## 📝 Notes

1. **Stripe Setup:** You'll need to create products and prices in Stripe Dashboard first
   - Go to: https://dashboard.stripe.com/test/products
   - Create 3 products: Starter, Professional, Enterprise
   - Copy the price IDs

2. **Webhook Secret:** After deployment, you'll need to:
   - Create a webhook endpoint in Stripe pointing to: `https://your-domain.vercel.app/api/stripe/webhook`
   - Copy the webhook secret
   - Add it to Vercel environment variables
   - Redeploy

3. **Custom Domains:** After successful deployment, add custom domains:
   - `agencyos.ai` → Marketing site
   - `app.agencyos.ai` → SaaS app

---

## ⚡ Quick Start (Minimum Required)

If you want to deploy quickly with minimal setup, you only need:

1. ✅ Supabase keys (3 variables)
2. ✅ OpenAI API key (1 variable)
3. ✅ App URLs (2 variables)

You can add Stripe later when you're ready to test payments.

---

## 🔗 Useful Links

- **Vercel Project:** https://vercel.com/manojs-projects-5f211bbe/agencyos-ai
- **Supabase API Settings:** https://supabase.com/dashboard/project/bqkvakodsxiqkjuvbrqo/settings/api
- **Stripe Dashboard:** https://dashboard.stripe.com/test/products
- **Current Deployment:** https://agencyos-o0iu5haz2-manojs-projects-5f211bbe.vercel.app

---

**Next Command:** After setting environment variables, run:
```bash
vercel --prod
```
