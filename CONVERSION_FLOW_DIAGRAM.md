# Conversion Flow Diagrams

## Complete User Journey

```
┌─────────────────────────────────────────────────────────────────┐
│                        LANDING PAGE                              │
│                     (/) Homepage                                 │
│                                                                  │
│  ┌────────────────────────────────────────────────────────┐    │
│  │  AgencyOS AI                                           │    │
│  │  AI Marketing Automation for Agencies                  │    │
│  │                                                         │    │
│  │  [View Pricing]  [Login]  [Sign Up]                   │    │
│  └────────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                       PRICING PAGE                               │
│                    (/pricing)                                    │
│                                                                  │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐         │
│  │   STARTER    │  │ PROFESSIONAL │  │  ENTERPRISE  │         │
│  │   $49/mo     │  │   $149/mo    │  │   $399/mo    │         │
│  │              │  │ [MOST POPULAR]│  │              │         │
│  │ 5 clients    │  │ 20 clients   │  │ Unlimited    │         │
│  │ 50 gens/mo   │  │ 200 gens/mo  │  │ Unlimited    │         │
│  │ 20 analyses  │  │ 100 analyses │  │ Unlimited    │         │
│  │ 10 reports   │  │ 50 reports   │  │ Unlimited    │         │
│  │              │  │              │  │              │         │
│  │ [Start Now]  │  │ [Upgrade]    │  │ [Go Pro]     │         │
│  └──────────────┘  └──────────────┘  └──────────────┘         │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                    STRIPE CHECKOUT                               │
│         (Hosted by Stripe - stripe.com)                         │
│                                                                  │
│  ┌────────────────────────────────────────────────────────┐    │
│  │  Professional Plan - $149/month                        │    │
│  │                                                         │    │
│  │  Card Number: [____________________]                   │    │
│  │  Expiry: [____]  CVC: [___]                           │    │
│  │  Name: [____________________]                          │    │
│  │                                                         │    │
│  │  [Pay $149]                                            │    │
│  └────────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                   WEBHOOK PROCESSING                             │
│                                                                  │
│  Stripe → /api/stripe/webhook                                   │
│  ├─ subscription.created                                        │
│  ├─ Update subscriptions table                                 │
│  └─ Set status = 'active'                                      │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                    BILLING PAGE                                  │
│              (/dashboard/billing?success=true)                  │
│                                                                  │
│  ┌────────────────────────────────────────────────────────┐    │
│  │  Current Plan: Professional                            │    │
│  │  Status: Active                                        │    │
│  │  Renews: March 18, 2026                               │    │
│  │  $149/month                                            │    │
│  └────────────────────────────────────────────────────────┘    │
│                                                                  │
│  Monthly Usage:                                                 │
│  ┌────────────────────────────────────────────────────────┐    │
│  │  AI Content Generations: 0 / 200                       │    │
│  │  [████░░░░░░░░░░░░░░░░] 0%                            │    │
│  │                                                         │    │
│  │  Performance Analyses: 0 / 100                         │    │
│  │  [░░░░░░░░░░░░░░░░░░░░] 0%                            │    │
│  │                                                         │    │
│  │  Reports Generated: 0 / 50                             │    │
│  │  [░░░░░░░░░░░░░░░░░░░░] 0%                            │    │
│  └────────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────────┘
```

## Usage Limit Flow

```
┌─────────────────────────────────────────────────────────────────┐
│                   USER GENERATES CONTENT                         │
│                                                                  │
│  User clicks "Generate Content" (50th time this month)          │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                    API REQUEST                                   │
│                                                                  │
│  POST /api/content/generate                                     │
│  {                                                              │
│    client_id: "uuid",                                          │
│    platform: "meta",                                           │
│    objective: "leads",                                         │
│    tone: "professional",                                       │
│    offer: "Free trial"                                         │
│  }                                                              │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                  USAGE LIMITER MIDDLEWARE                        │
│                                                                  │
│  1. Get subscription: plan = "starter"                          │
│  2. Get monthly usage: current = 50                             │
│  3. Get plan limit: limit = 50                                  │
│  4. Check: 50 >= 50 ? YES                                       │
│  5. Determine recommended: "professional"                       │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                   RETURN 429 ERROR                               │
│                                                                  │
│  HTTP 429 Too Many Requests                                     │
│  {                                                              │
│    "code": "LIMIT_EXCEEDED",                                   │
│    "error": "Monthly content_generation limit reached (50)",   │
│    "action_type": "content_generation",                        │
│    "current_usage": 50,                                        │
│    "limit": 50,                                                │
│    "plan": "starter",                                          │
│    "recommended_plan": "professional"                          │
│  }                                                              │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                  FRONTEND ERROR HANDLING                         │
│                                                                  │
│  if (response.status === 429 && data.code === 'LIMIT_EXCEEDED') {│
│    setUpgradeData({                                            │
│      currentPlan: data.plan,                                   │
│      recommendedPlan: data.recommended_plan,                   │
│      actionType: data.action_type,                             │
│      currentUsage: data.current_usage,                         │
│      limit: data.limit                                         │
│    });                                                          │
│    setIsUpgradeModalOpen(true);                                │
│  }                                                              │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                    UPGRADE MODAL                                 │
│                                                                  │
│  ┌────────────────────────────────────────────────────────┐    │
│  │  ⚠️  Usage Limit Reached                               │    │
│  │                                                         │    │
│  │  You've reached your monthly limit for                 │    │
│  │  content generations                                    │    │
│  │                                                         │    │
│  │  ┌─────────────────────────────────────────────┐      │    │
│  │  │  50 / 50                                    │      │    │
│  │  └─────────────────────────────────────────────┘      │    │
│  │                                                         │    │
│  │  Upgrade to Professional                               │    │
│  │                                                         │    │
│  │  Clients:      5  →  20                                │    │
│  │  Generations:  50  →  200                              │    │
│  │  Analyses:     20  →  100                              │    │
│  │  Reports:      10  →  50                               │    │
│  │                                                         │    │
│  │  What you'll get:                                      │    │
│  │  ✓ 200 content generations per month                  │    │
│  │  ✓ Priority support                                   │    │
│  │  ✓ Advanced analytics                                 │    │
│  │                                                         │    │
│  │  [Upgrade to Professional →]                           │    │
│  │  [Maybe Later]                                         │    │
│  └────────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│              REDIRECT TO STRIPE CHECKOUT                         │
│                                                                  │
│  GET /api/stripe/create-checkout?plan=professional              │
│  ├─ Create/retrieve Stripe customer                            │
│  ├─ Create checkout session                                    │
│  └─ Redirect to Stripe                                         │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                   PAYMENT COMPLETE                               │
│                                                                  │
│  Webhook updates subscription:                                  │
│  ├─ plan: "professional"                                       │
│  ├─ status: "active"                                           │
│  └─ current_period_end: +30 days                              │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                  USER CAN CONTINUE                               │
│                                                                  │
│  Generate content again:                                        │
│  ├─ Check usage: 50 / 200 (25%)                               │
│  ├─ Within limit ✓                                            │
│  └─ Generate content successfully                              │
└─────────────────────────────────────────────────────────────────┘
```

## Billing Page Usage Display

```
┌─────────────────────────────────────────────────────────────────┐
│                    BILLING PAGE                                  │
│              (/dashboard/billing)                                │
│                                                                  │
│  ┌────────────────────────────────────────────────────────┐    │
│  │  Current Plan                                          │    │
│  │  ┌──────────────────────────────────────────────┐     │    │
│  │  │  Professional  [Active]                      │     │    │
│  │  │  📅 Renews on March 18, 2026                │     │    │
│  │  │                                              │     │    │
│  │  │                                      $149    │     │    │
│  │  │                                   per month  │     │    │
│  │  │                                              │     │    │
│  │  │  [💳 Manage Subscription]                   │     │    │
│  │  └──────────────────────────────────────────────┘     │    │
│  └────────────────────────────────────────────────────────┘    │
│                                                                  │
│  ┌────────────────────────────────────────────────────────┐    │
│  │  Monthly Usage                                         │    │
│  │                                                         │    │
│  │  AI Content Generations          45 / 200              │    │
│  │  [████████░░░░░░░░░░░░] 22.5%                         │    │
│  │                                                         │    │
│  │  Performance Analyses            12 / 100              │    │
│  │  [███░░░░░░░░░░░░░░░░░] 12%                           │    │
│  │                                                         │    │
│  │  Reports Generated                3 / 50               │    │
│  │  [█░░░░░░░░░░░░░░░░░░░] 6%                            │    │
│  │                                                         │    │
│  │  ─────────────────────────────────────────────         │    │
│  │  Total API Cost This Month:              $2.28        │    │
│  │  Total Tokens Used:                      75,750       │    │
│  └────────────────────────────────────────────────────────┘    │
│                                                                  │
│  ┌────────────────────────────────────────────────────────┐    │
│  │  💡 Need more capacity?                                │    │
│  │  Upgrade to Enterprise for unlimited usage limits.     │    │
│  │                                      [Upgrade Now]     │    │
│  └────────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────────┘
```

## Progress Bar Color Logic

```
Usage Percentage:

0% ──────────────────────────────────────────────────── 100%
│                    │                    │              │
│                    │                    │              │
0%                  75%                  90%           100%
│                    │                    │              │
└─ GREEN ───────────┴─ YELLOW ───────────┴─── RED ──────┘

Examples:
- 45/200 = 22.5% → GREEN (bg-primary)
- 150/200 = 75% → YELLOW (bg-yellow-500)
- 185/200 = 92.5% → RED (bg-red-500)
- 200/200 = 100% → RED + Modal trigger
```

## Stripe Customer Portal Flow

```
┌─────────────────────────────────────────────────────────────────┐
│                    BILLING PAGE                                  │
│                                                                  │
│  User clicks "Manage Subscription"                              │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                  API REQUEST                                     │
│                                                                  │
│  GET /api/stripe/customer-portal                                │
│  ├─ Get user's subscription                                    │
│  ├─ Get stripe_customer_id                                     │
│  ├─ Create portal session                                      │
│  └─ Redirect to Stripe                                         │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│              STRIPE CUSTOMER PORTAL                              │
│           (Hosted by Stripe)                                    │
│                                                                  │
│  ┌────────────────────────────────────────────────────────┐    │
│  │  Your Subscription                                     │    │
│  │                                                         │    │
│  │  Professional Plan - $149/month                        │    │
│  │  Next payment: March 18, 2026                         │    │
│  │                                                         │    │
│  │  [Update Payment Method]                               │    │
│  │  [View Invoices]                                       │    │
│  │  [Cancel Subscription]                                 │    │
│  │                                                         │    │
│  │  Payment Method:                                       │    │
│  │  •••• 4242  Expires 12/25                             │    │
│  │  [Update]                                              │    │
│  └────────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                  RETURN TO BILLING                               │
│                                                                  │
│  User clicks "Return to AgencyOS AI"                            │
│  → Redirect to /dashboard/billing                               │
└─────────────────────────────────────────────────────────────────┘
```

## Recommended Plan Logic

```
Current Plan → Action → Recommended Plan

Starter (50 gens) → Hit limit → Professional (200 gens)
Professional (200 gens) → Hit limit → Enterprise (unlimited)
Enterprise → Never hits limit → N/A

Logic:
if (currentPlan === 'starter') {
  recommendedPlan = 'professional';
} else if (currentPlan === 'professional') {
  recommendedPlan = 'enterprise';
} else {
  // Enterprise users never see upgrade modal
  recommendedPlan = null;
}
```

## Complete Conversion Funnel

```
┌─────────────────────────────────────────────────────────────────┐
│  STAGE 1: AWARENESS                                             │
│  Landing Page → View Pricing                                    │
│  Conversion Goal: 50% click-through                             │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│  STAGE 2: CONSIDERATION                                         │
│  Pricing Page → Compare Plans → Select Plan                     │
│  Conversion Goal: 30% select plan                               │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│  STAGE 3: DECISION                                              │
│  Stripe Checkout → Enter Payment → Complete                     │
│  Conversion Goal: 80% completion                                │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│  STAGE 4: ACTIVATION                                            │
│  Billing Page → Dashboard → First Generation                    │
│  Conversion Goal: 90% activation                                │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│  STAGE 5: RETENTION                                             │
│  Regular Usage → Hit Limit → Upgrade Modal                      │
│  Conversion Goal: 40% upgrade                                   │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│  STAGE 6: EXPANSION                                             │
│  Professional → Hit Limit → Enterprise                          │
│  Conversion Goal: 20% upgrade to enterprise                     │
└─────────────────────────────────────────────────────────────────┘
```

---

**Version**: 2.1 (Conversion UX)
**Last Updated**: February 18, 2026
