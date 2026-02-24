# AgencyOS AI - System Architecture Diagram

## Complete System Flow

```
┌─────────────────────────────────────────────────────────────────────┐
│                           USER INTERFACE                             │
│  Next.js 14 App Router • React • TypeScript • Tailwind CSS         │
│                                                                      │
│  Pages:                                                             │
│  • Landing Page                                                     │
│  • Auth (Login/Signup)                                             │
│  • Dashboard (KPIs, AI Suggestions)                                │
│  • Clients Management                                              │
│  • Content Generator                                               │
│  • Reports Viewer                                                  │
│  • Billing & Subscription                                          │
└──────────────────────────────┬───────────────────────────────────────┘
                               │
                               ▼
┌─────────────────────────────────────────────────────────────────────┐
│                          API ROUTES LAYER                            │
│                                                                      │
│  Content & Analysis:                                                │
│  • POST /api/content/generate      [Usage Limit ✓]                 │
│  • POST /api/performance/analyze   [Usage Limit ✓]                 │
│  • POST /api/context/update                                        │
│                                                                      │
│  Management:                                                        │
│  • POST /api/clients/create        [Client Limit ✓]               │
│  • GET  /api/usage/stats                                           │
│                                                                      │
│  Billing:                                                           │
│  • POST /api/stripe/webhook                                        │
└──────────────────────────────┬───────────────────────────────────────┘
                               │
                ┌──────────────┴──────────────┐
                ▼                             ▼
┌──────────────────────────┐    ┌──────────────────────────┐
│   MIDDLEWARE LAYER       │    │   SERVICE LAYER          │
│                          │    │                          │
│  Usage Limiter:          │    │  AI Client Wrapper:      │
│  • checkUsageLimit()     │    │  • generateCompletion()  │
│  • checkClientLimit()    │    │  • Retry logic (2x)      │
│  • Plan enforcement      │    │  • Schema validation     │
│  • Upgrade messages      │    │  • Timeout (60s)         │
│                          │    │  • Auto logging          │
│  Auth Verification:      │    │  • Cost estimation       │
│  • Supabase Auth         │    │                          │
│  • RLS policies          │    │  PDF Generator:          │
│                          │    │  • generateReportHTML()  │
│  Rate Limiting:          │    │  • Theme support         │
│  • Per-endpoint limits   │    │  • Brand integration     │
└──────────────────────────┘    │                          │
                                │  CSV Parser:             │
                                │  • parseMetaAdsCSV()     │
                                │  • Data validation       │
                                └──────────────────────────┘
                                               │
                ┌──────────────────────────────┴──────────────────────────────┐
                ▼                             ▼                               ▼
┌──────────────────────────┐  ┌──────────────────────────┐  ┌──────────────────────────┐
│   SUPABASE               │  │   OPENAI API             │  │   STRIPE                 │
│   (PostgreSQL)           │  │   (GPT-4 Turbo)          │  │   (Payments)             │
│                          │  │                          │  │                          │
│  Core Tables:            │  │  Models:                 │  │  Products:               │
│  • users                 │  │  • gpt-4-turbo-preview   │  │  • Starter ($49)         │
│  • agencies              │  │  • gpt-4                 │  │  • Professional ($149)   │
│  • clients               │  │  • gpt-3.5-turbo         │  │  • Enterprise ($399)     │
│  • brand_kits            │  │                          │  │                          │
│  • content_generations   │  │  Features:               │  │  Webhooks:               │
│  • ad_performance_uploads│  │  • JSON mode             │  │  • subscription.created  │
│  • reports               │  │  • Function calling      │  │  • subscription.updated  │
│  • subscriptions         │  │  • Streaming             │  │  • subscription.deleted  │
│                          │  │                          │  │                          │
│  Enhanced Tables ✨:     │  │  Pricing:                │  │  Features:               │
│  • usage_logs            │  │  • $0.01/1K input tokens │  │  • Customer portal       │
│  • client_contexts       │  │  • $0.03/1K output tokens│  │  • Invoice management    │
│  • industry_benchmarks   │  │                          │  │  • Subscription mgmt     │
│                          │  │                          │  │                          │
│  Auth:                   │  │                          │  │                          │
│  • Email + Password      │  │                          │  │                          │
│  • Google OAuth          │  │                          │  │                          │
│                          │  │                          │  │                          │
│  Storage:                │  │                          │  │                          │
│  • Client logos          │  │                          │  │                          │
│  • CSV files             │  │                          │  │                          │
│  • PDF reports           │  │                          │  │                          │
└──────────────────────────┘  └──────────────────────────┘  └──────────────────────────┘
```

## Data Flow: Content Generation

```
1. User Request
   │
   ├─→ POST /api/content/generate
   │   {
   │     client_id: "uuid",
   │     platform: "meta",
   │     objective: "leads",
   │     tone: "professional",
   │     offer: "Free trial"
   │   }
   │
   ▼
2. API Route Handler
   │
   ├─→ Authenticate user (Supabase Auth)
   │
   ├─→ Get client & agency info
   │   SELECT agency_id FROM clients WHERE id = client_id
   │
   ├─→ Check usage limit
   │   ├─→ Get subscription plan
   │   ├─→ Query monthly usage
   │   ├─→ Compare against limit
   │   └─→ [If exceeded] Return 429 + upgrade message
   │
   ├─→ Fetch client context (AI memory)
   │   SELECT * FROM client_contexts WHERE client_id = client_id
   │
   ▼
3. AI Client Wrapper
   │
   ├─→ Build prompt with context
   │   • Platform, objective, tone, offer
   │   • Winning hooks from past campaigns
   │   • Failed angles to avoid
   │   • Audience pain points
   │
   ├─→ Call OpenAI API
   │   ├─→ [Attempt 1] Try generation
   │   ├─→ [If fails] Wait 1s, retry
   │   ├─→ [If fails] Wait 2s, retry
   │   └─→ [If fails] Throw error
   │
   ├─→ Validate response schema
   │   ├─→ Check ad_copies (3 items)
   │   ├─→ Check reel_scripts (3 items)
   │   └─→ Check content_calendar (7 days)
   │
   ├─→ Calculate usage
   │   ├─→ tokens_used: 1250
   │   └─→ cost_estimate: $0.0375
   │
   ├─→ Log to usage_logs (async)
   │   INSERT INTO usage_logs (
   │     agency_id, user_id, action_type,
   │     tokens_used, cost_estimate
   │   )
   │
   ▼
4. Save & Return
   │
   ├─→ Save to content_generations
   │   INSERT INTO content_generations (...)
   │
   └─→ Return response
       {
         id: "uuid",
         ad_copies: [...],
         reel_scripts: [...],
         content_calendar: [...],
         usage: {
           current: 15,
           limit: 50,
           plan: "starter"
         }
       }
```

## Data Flow: Performance Analysis

```
1. User Upload CSV
   │
   ├─→ Upload to Supabase Storage
   │
   ├─→ Parse CSV data
   │   parseMetaAdsCSV(csvText)
   │
   ├─→ Save to ad_performance_uploads
   │   INSERT INTO ad_performance_uploads (
   │     client_id, user_id, file_url,
   │     platform, data
   │   )
   │
   ▼
2. User Request Analysis
   │
   ├─→ POST /api/performance/analyze
   │   { upload_id: "uuid" }
   │
   ▼
3. API Route Handler
   │
   ├─→ Authenticate user
   │
   ├─→ Get upload with client info
   │   SELECT * FROM ad_performance_uploads
   │   JOIN clients ON clients.id = client_id
   │
   ├─→ Check usage limit
   │   [Same as content generation]
   │
   ├─→ Fetch industry benchmark
   │   SELECT * FROM industry_benchmarks
   │   WHERE industry_name = client.industry
   │
   ▼
4. AI Client Wrapper
   │
   ├─→ Build analysis prompt
   │   • Campaign performance data
   │   • Industry benchmarks for comparison
   │   • Analysis requirements
   │
   ├─→ Call OpenAI API
   │   [Same retry logic as content generation]
   │
   ├─→ Validate response schema
   │   ├─→ what_worked (array)
   │   ├─→ what_underperformed (array)
   │   ├─→ optimization_suggestions (array)
   │   ├─→ benchmarks (object)
   │   └─→ industry_comparison (object) ✨
   │
   ├─→ Log usage
   │   [Same as content generation]
   │
   ▼
5. Update & Return
   │
   ├─→ Update ad_performance_uploads
   │   UPDATE ad_performance_uploads
   │   SET analysis = {...}
   │   WHERE id = upload_id
   │
   └─→ Return response
       {
         ...upload,
         analysis: {
           what_worked: [...],
           what_underperformed: [...],
           optimization_suggestions: [...],
           benchmarks: {...},
           industry_comparison: {
             ctr_vs_industry: "15% above average",
             cpc_vs_industry: "8% below average",
             roas_vs_industry: "22% above average"
           }
         },
         usage: {...}
       }
```

## Database Schema Relationships

```
users (1) ──────────────────────────────────┐
  │                                          │
  │ owner_id                                 │ user_id
  ▼                                          ▼
agencies (1) ────────────────────────────→ usage_logs (N)
  │                                          ▲
  │ agency_id                                │
  ├──────────────────────────────────────────┤
  │                                          │
  ├─→ clients (N)                            │
  │     │                                    │
  │     │ client_id                          │
  │     ├─→ brand_kits (1)                   │
  │     │                                    │
  │     ├─→ client_contexts (1) ✨          │
  │     │                                    │
  │     ├─→ content_generations (N) ─────────┤
  │     │                                    │
  │     ├─→ ad_performance_uploads (N) ──────┤
  │     │                                    │
  │     └─→ reports (N) ─────────────────────┤
  │                                          │
  └─→ subscriptions (1)                      │
                                             │
industry_benchmarks (N) ──────────────────────┘
  (referenced by clients.industry)
```

## Plan Limits Enforcement

```
┌─────────────────────────────────────────────────────────────┐
│                      PLAN LIMITS                             │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  Starter ($49/mo):                                          │
│  ├─ Clients: 5                                              │
│  ├─ Generations: 50/month                                   │
│  ├─ Analyses: 20/month                                      │
│  └─ Reports: 10/month                                       │
│                                                              │
│  Professional ($149/mo):                                    │
│  ├─ Clients: 20                                             │
│  ├─ Generations: 200/month                                  │
│  ├─ Analyses: 100/month                                     │
│  └─ Reports: 50/month                                       │
│                                                              │
│  Enterprise ($399/mo):                                      │
│  ├─ Clients: Unlimited                                      │
│  ├─ Generations: Unlimited                                  │
│  ├─ Analyses: Unlimited                                     │
│  └─ Reports: Unlimited                                      │
│                                                              │
└─────────────────────────────────────────────────────────────┘
                               │
                               ▼
┌─────────────────────────────────────────────────────────────┐
│                  ENFORCEMENT FLOW                            │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  1. Get agency subscription                                 │
│     SELECT plan, status FROM subscriptions                  │
│     WHERE agency_id = ?                                     │
│                                                              │
│  2. Check subscription status                               │
│     IF status NOT IN ('active', 'trialing')                │
│       RETURN "Subscription not active"                      │
│                                                              │
│  3. Get plan limits                                         │
│     limits = PLAN_LIMITS[plan]                             │
│                                                              │
│  4. Query monthly usage                                     │
│     SELECT COUNT(*) FROM usage_logs                         │
│     WHERE agency_id = ?                                     │
│       AND action_type = ?                                   │
│       AND created_at >= start_of_month                      │
│                                                              │
│  5. Compare usage vs limit                                  │
│     IF current_usage >= limit                               │
│       RETURN 429 + upgrade message                          │
│     ELSE                                                    │
│       ALLOW + return usage stats                            │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

## AI Context Memory Flow

```
┌─────────────────────────────────────────────────────────────┐
│                   CLIENT CONTEXT MEMORY                      │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  Learning Cycle:                                            │
│                                                              │
│  1. Initial Generation (No Context)                         │
│     ├─→ Use brand kit only                                  │
│     └─→ Generate content                                    │
│                                                              │
│  2. User Reviews & Updates Context                          │
│     ├─→ POST /api/context/update                           │
│     └─→ {                                                   │
│           winning_hooks: ["Free trial", "Limited time"],   │
│           failed_angles: ["Generic benefits"],             │
│           audience_pain_points: ["Time", "Budget"]         │
│         }                                                   │
│                                                              │
│  3. Next Generation (With Context)                          │
│     ├─→ Fetch client_contexts                              │
│     ├─→ Inject into prompt:                                │
│     │   "Use these winning hooks: ..."                     │
│     │   "Avoid these angles: ..."                          │
│     │   "Address these pain points: ..."                   │
│     └─→ Generate improved content                          │
│                                                              │
│  4. Continuous Learning                                     │
│     └─→ Context updated based on performance               │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

## Cost Tracking Flow

```
Every AI Call:
  │
  ├─→ OpenAI API Response
  │   {
  │     usage: {
  │       prompt_tokens: 850,
  │       completion_tokens: 400,
  │       total_tokens: 1250
  │     }
  │   }
  │
  ├─→ Calculate Cost
  │   input_cost = 850 × $0.01/1000 = $0.0085
  │   output_cost = 400 × $0.03/1000 = $0.0120
  │   total_cost = $0.0205
  │
  ├─→ Log to usage_logs
  │   INSERT INTO usage_logs (
  │     agency_id,
  │     user_id,
  │     action_type,
  │     tokens_used: 1250,
  │     cost_estimate: 0.0205,
  │     metadata: {
  │       model: "gpt-4-turbo-preview",
  │       duration_ms: 2340,
  │       attempt: 1
  │     }
  │   )
  │
  └─→ Monthly Aggregation
      SELECT 
        action_type,
        COUNT(*) as calls,
        SUM(tokens_used) as total_tokens,
        SUM(cost_estimate) as total_cost
      FROM usage_logs
      WHERE agency_id = ?
        AND created_at >= start_of_month
      GROUP BY action_type

      Result:
      content_generation    | 45 | 56,250 | $1.69
      performance_analysis  | 18 | 22,400 | $0.67
      report_generation     | 8  | 9,600  | $0.29
      ────────────────────────────────────────────
      TOTAL                 | 71 | 88,250 | $2.65
```

---

**System Version**: 2.0 (Production-Grade)
**Last Updated**: February 18, 2026
