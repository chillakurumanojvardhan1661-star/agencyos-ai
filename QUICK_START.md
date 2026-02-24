# Quick Start Guide

## 🚀 Get Started in 5 Minutes

### Prerequisites
- Node.js 18+ installed
- Supabase account
- OpenAI API key
- Stripe account (for billing)

### Step 1: Clone & Install (1 min)

```bash
# Install dependencies
npm install

# Copy environment template
cp .env.example .env.local
```

### Step 2: Configure Environment (2 min)

Edit `.env.local`:

```bash
# Supabase (get from supabase.com/dashboard)
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# OpenAI (get from platform.openai.com)
OPENAI_API_KEY=sk-your-key

# Stripe (get from dashboard.stripe.com)
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_your_key
STRIPE_SECRET_KEY=sk_test_your_key
STRIPE_WEBHOOK_SECRET=whsec_your_secret

# App URL
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### Step 3: Setup Database (1 min)

1. Go to Supabase SQL Editor
2. Run migrations in order:

```sql
-- First, run 001_initial_schema.sql
-- Copy entire file content and execute

-- Then, run 002_usage_tracking_and_enhancements.sql
-- Copy entire file content and execute
```

3. Verify tables created:
```sql
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public';
```

Should show 11 tables including:
- usage_logs ✨
- client_contexts ✨
- industry_benchmarks ✨

### Step 4: Run Development Server (1 min)

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

### Step 5: Test the System

#### Create Account
1. Go to `/auth/signup`
2. Sign up with email
3. Verify email (check Supabase Auth)

#### Create Agency
```sql
-- Run in Supabase SQL Editor
INSERT INTO agencies (owner_id, name, currency)
VALUES ('your-user-id', 'Test Agency', 'USD');

-- Create subscription
INSERT INTO subscriptions (
  agency_id, 
  stripe_customer_id, 
  plan, 
  status
)
VALUES (
  'your-agency-id',
  'cus_test',
  'professional',
  'active'
);
```

#### Create Client
```bash
curl -X POST http://localhost:3000/api/clients/create \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test Client",
    "industry": "fitness"
  }'
```

#### Generate Content
```bash
curl -X POST http://localhost:3000/api/content/generate \
  -H "Content-Type: application/json" \
  -d '{
    "client_id": "your-client-id",
    "platform": "meta",
    "objective": "leads",
    "tone": "professional",
    "offer": "Free trial for 30 days"
  }'
```

Response:
```json
{
  "id": "uuid",
  "ad_copies": [
    {
      "primary_text": "Transform your fitness journey...",
      "headline": "Start Your Free Trial Today",
      "cta": "Get Started Free"
    }
  ],
  "reel_scripts": [...],
  "content_calendar": [...],
  "usage": {
    "current": 1,
    "limit": 200,
    "plan": "professional"
  }
}
```

#### Check Usage Stats
```bash
curl http://localhost:3000/api/usage/stats?agency_id=your-agency-id
```

Response:
```json
{
  "total": {
    "total_tokens": 1250,
    "total_cost": 0.0375,
    "action_count": 1
  },
  "breakdown": {
    "content_generation": {
      "count": 1,
      "tokens": 1250,
      "cost": 0.0375
    }
  }
}
```

## 🎯 Key Features to Test

### 1. Usage Limits
Try generating content 201 times (Professional plan limit is 200):

```bash
# Should succeed for first 200
# 201st request should return:
{
  "error": "Monthly content_generation limit reached (200). Upgrade your plan for more.",
  "current_usage": 200,
  "limit": 200,
  "plan": "professional"
}
```

### 2. Client Context Memory
Update client context:

```bash
curl -X POST http://localhost:3000/api/context/update \
  -H "Content-Type: application/json" \
  -d '{
    "client_id": "your-client-id",
    "winning_hooks": ["Free trial", "Limited time offer"],
    "failed_angles": ["Generic benefits", "Feature lists"],
    "audience_pain_points": ["Time constraints", "Budget concerns"]
  }'
```

Generate content again - it will use this context!

### 3. Industry Benchmarks
Upload CSV and analyze:

```bash
# 1. Upload CSV to Supabase Storage
# 2. Create ad_performance_uploads record
# 3. Analyze:

curl -X POST http://localhost:3000/api/performance/analyze \
  -H "Content-Type: application/json" \
  -d '{
    "upload_id": "your-upload-id"
  }'
```

Response includes industry comparison:
```json
{
  "industry_comparison": {
    "ctr_vs_industry": "15% above industry average",
    "cpc_vs_industry": "8% below industry average",
    "roas_vs_industry": "22% above industry average"
  }
}
```

## 📊 Monitor Your System

### Check Usage Logs
```sql
SELECT 
  action_type,
  COUNT(*) as calls,
  SUM(tokens_used) as tokens,
  SUM(cost_estimate) as cost
FROM usage_logs
WHERE created_at >= NOW() - INTERVAL '24 hours'
GROUP BY action_type;
```

### Check Industry Benchmarks
```sql
SELECT * FROM industry_benchmarks;
```

### Check Client Contexts
```sql
SELECT 
  c.name,
  cc.winning_hooks,
  cc.failed_angles,
  cc.audience_pain_points
FROM client_contexts cc
JOIN clients c ON c.id = cc.client_id;
```

## 🔧 Common Issues

### "Unauthorized" Error
- Check Supabase Auth token
- Verify RLS policies
- Check user session

### "Usage limit exceeded"
- Check subscription status
- Verify plan in subscriptions table
- Check usage_logs count

### "Failed to generate content"
- Verify OpenAI API key
- Check OpenAI account balance
- Review error logs

### Database Connection Failed
- Check Supabase URL
- Verify service role key
- Check RLS policies

## 📚 Next Steps

1. **Read Documentation**
   - [ARCHITECTURE.md](./ARCHITECTURE.md) - System design
   - [PROJECT_STRUCTURE.md](./PROJECT_STRUCTURE.md) - File organization
   - [ENHANCEMENTS_SUMMARY.md](./ENHANCEMENTS_SUMMARY.md) - Feature details

2. **Configure Stripe**
   - Create products
   - Set up webhook
   - Test subscription flow

3. **Deploy to Production**
   - Follow [DEPLOYMENT_CHECKLIST.md](./DEPLOYMENT_CHECKLIST.md)
   - Configure environment variables
   - Test all endpoints

4. **Monitor & Optimize**
   - Set up error tracking
   - Monitor usage costs
   - Optimize slow queries

## 🎓 Learn More

### Key Concepts

**Usage Tracking**
- Every AI call is logged
- Tokens and cost tracked
- Monthly aggregation available

**Plan Limits**
- Enforced before AI calls
- Clear upgrade messages
- Usage stats in responses

**Client Context**
- AI learns from past campaigns
- Winning/failed patterns stored
- Better outputs over time

**Industry Benchmarks**
- 8 industries seeded
- Compare performance
- Actionable insights

### Code Examples

**Using AI Client**
```typescript
import { AIClient } from '@/lib/ai/client';

const aiClient = new AIClient({ temperature: 0.8 });
const result = await aiClient.generateCompletion(
  systemPrompt,
  userPrompt,
  { agency_id, user_id, action_type },
  { schema: validationSchema }
);
```

**Checking Usage Limits**
```typescript
import { checkUsageLimit } from '@/lib/middleware/usage-limiter';

const check = await checkUsageLimit(agency_id, 'content_generation');
if (!check.allowed) {
  return { error: check.reason };
}
```

**Generating PDF Reports**
```typescript
import { generateReportHTML } from '@/lib/pdf/generator';

const html = generateReportHTML({
  client,
  brand_kit,
  performance_data,
  analysis,
  period: { start, end },
  theme: 'dark',
});
```

## 🚀 Production Deployment

When ready for production:

1. Run full test suite
2. Configure production environment variables
3. Deploy to Vercel
4. Run database migrations
5. Configure Stripe webhook
6. Test all endpoints
7. Monitor logs

See [DEPLOYMENT_CHECKLIST.md](./DEPLOYMENT_CHECKLIST.md) for complete guide.

---

**Need Help?**
- Check [ARCHITECTURE.md](./ARCHITECTURE.md) for system design
- Review [BEFORE_AFTER.md](./BEFORE_AFTER.md) for feature comparison
- See [SYSTEM_DIAGRAM.md](./SYSTEM_DIAGRAM.md) for visual flows

**Ready to Deploy?**
- Follow [DEPLOYMENT_CHECKLIST.md](./DEPLOYMENT_CHECKLIST.md)
- Review [IMPLEMENTATION_COMPLETE.md](./IMPLEMENTATION_COMPLETE.md)

---

**Version**: 2.0 (Production-Grade)
**Status**: Ready for Development
