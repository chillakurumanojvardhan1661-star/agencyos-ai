# AgencyOS AI - Production Architecture

## Overview
This document outlines the production-grade architecture enhancements for AgencyOS AI.

## System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                        Frontend Layer                        │
│  Next.js 14 App Router + React + TypeScript + Tailwind     │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                      API Route Layer                         │
│  • /api/content/generate    • /api/clients/create          │
│  • /api/performance/analyze • /api/context/update          │
│  • /api/usage/stats         • /api/stripe/webhook          │
└─────────────────────────────────────────────────────────────┘
                              │
                    ┌─────────┴─────────┐
                    ▼                   ▼
┌──────────────────────────┐  ┌──────────────────────────┐
│   Middleware Layer       │  │   Service Layer          │
│  • Usage Limiter         │  │  • AI Client Wrapper     │
│  • Auth Verification     │  │  • PDF Generator         │
│  • Rate Limiting         │  │  • CSV Parser            │
└──────────────────────────┘  └──────────────────────────┘
                    │                   │
                    └─────────┬─────────┘
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                    External Services                         │
│  • Supabase (Auth + DB + Storage)                           │
│  • OpenAI API (GPT-4 Turbo)                                 │
│  • Stripe (Payments)                                        │
└─────────────────────────────────────────────────────────────┘
```

## Database Schema

### Core Tables

#### 1. users
- Extends Supabase auth.users
- Stores profile information

#### 2. agencies
- Multi-tenant root entity
- Owns clients and subscriptions
- Supports multi-currency

#### 3. clients
- Belongs to agency
- Has industry classification
- Links to brand_kits and client_contexts

#### 4. brand_kits
- One-to-one with client
- Stores visual identity (logo, colors)
- Defines tone and messaging

#### 5. client_contexts (NEW)
- AI memory system
- Tracks winning/failed content patterns
- Stores audience insights
- Enables context-aware generation

#### 6. content_generations
- Stores AI-generated content
- Includes ad copies, reel scripts, calendars
- Tracks platform and objective

#### 7. ad_performance_uploads
- CSV upload storage
- Parsed performance data
- AI analysis results

#### 8. reports
- Generated PDF reports
- Links to performance data
- Supports multiple report types

#### 9. subscriptions
- Stripe integration
- Plan-based limits
- Status tracking

#### 10. usage_logs (NEW)
- Tracks every AI API call
- Records token usage and cost
- Enables usage analytics
- Enforces plan limits

#### 11. industry_benchmarks (NEW)
- Seeded benchmark data
- Industry-specific metrics (CTR, CPC, ROAS, CPM)
- Used for comparative analysis

### Key Relationships

```
agencies (1) ──→ (N) clients
clients (1) ──→ (1) brand_kits
clients (1) ──→ (1) client_contexts
clients (1) ──→ (N) content_generations
clients (1) ──→ (N) ad_performance_uploads
clients (1) ──→ (N) reports
agencies (1) ──→ (1) subscriptions
agencies (1) ──→ (N) usage_logs
```

## AI System Architecture

### 1. AI Client Wrapper (`/lib/ai/client.ts`)

**Purpose**: Centralized OpenAI API management

**Features**:
- Automatic token usage logging
- Cost estimation per call
- Retry logic (max 2 retries with exponential backoff)
- Timeout handling (60s default)
- JSON schema validation
- Response format enforcement

**Usage**:
```typescript
const aiClient = new AIClient({ temperature: 0.8 });
const result = await aiClient.generateCompletion(
  systemPrompt,
  userPrompt,
  { agency_id, user_id, action_type },
  { schema: validationSchema }
);
```

### 2. AI Generator Layer (`/lib/ai/generator.ts`)

**Purpose**: High-level AI operations

**Functions**:
- `generateContent()` - Creates ad content with context
- `analyzePerformance()` - Analyzes metrics with benchmarks

**Enhancements**:
- Injects client context memory
- Compares against industry benchmarks
- Validates output schemas
- Logs usage automatically

### 3. Prompt Engineering (`/lib/ai/prompts.ts`)

**Structure**:
- System prompts define AI role
- User prompts include:
  - Platform/objective context
  - Brand kit information
  - Client context memory
  - Industry benchmarks
  - Output format specifications

**Context Injection**:
```typescript
if (client_context) {
  - Winning hooks from past campaigns
  - Failed angles to avoid
  - Audience pain points
  - Best performing platforms
  - Seasonal notes
}
```

## Usage Tracking & Limits

### Plan Limits

| Feature | Starter | Professional | Enterprise |
|---------|---------|--------------|------------|
| Clients | 5 | 20 | Unlimited |
| Monthly Generations | 50 | 200 | Unlimited |
| Monthly Analyses | 20 | 100 | Unlimited |
| Monthly Reports | 10 | 50 | Unlimited |

### Middleware Flow

```
API Request
    │
    ▼
Check Authentication
    │
    ▼
Get Agency Subscription
    │
    ▼
Query Monthly Usage (usage_logs)
    │
    ▼
Compare Against Plan Limits
    │
    ├─→ [Limit Exceeded] → Return 429 + Upgrade Message
    │
    └─→ [Within Limit] → Proceed to AI Call
                              │
                              ▼
                        Log Usage Automatically
```

### Usage Limiter (`/lib/middleware/usage-limiter.ts`)

**Functions**:
- `checkUsageLimit()` - Validates action against plan
- `checkClientLimit()` - Validates client count

**Returns**:
```typescript
{
  allowed: boolean,
  reason?: string,
  current_usage?: number,
  limit?: number,
  plan?: SubscriptionPlan
}
```

## API Routes

### Enhanced Routes

#### POST `/api/content/generate`
- Checks usage limits
- Fetches client context
- Generates content with AI
- Logs token usage
- Returns usage stats

#### POST `/api/performance/analyze`
- Checks usage limits
- Fetches industry benchmarks
- Analyzes with AI
- Compares to industry
- Returns insights + usage

#### POST `/api/context/update`
- Updates client AI memory
- Stores winning/failed patterns
- Enables learning over time

#### GET `/api/usage/stats`
- Returns monthly usage breakdown
- Shows cost per action type
- Displays token consumption

#### POST `/api/clients/create`
- Checks client limit
- Creates client
- Returns usage stats

## PDF Report Generation

### Report Structure

1. **Header Section**
   - Client logo (from brand_kit)
   - Report title and period
   - Branded colors

2. **KPI Summary**
   - Total Spend
   - Average CTR
   - Average CPC
   - ROAS

3. **Industry Comparison** (if available)
   - CTR vs industry
   - CPC vs industry
   - ROAS vs industry

4. **AI Insights**
   - What worked (positive patterns)
   - What underperformed (issues)
   - Optimization suggestions (actionable)

5. **Campaign Details Table**
   - Full performance breakdown
   - Sortable metrics

6. **Footer**
   - Generation timestamp
   - Branding

### Theme Support
- Dark mode (default)
- Light mode
- Brand color integration

## Security & Performance

### Row Level Security (RLS)
- All tables have RLS enabled
- Policies enforce multi-tenant isolation
- Users can only access their agency's data

### Indexes
- Optimized for common queries
- Composite indexes on foreign keys
- Time-based indexes for logs

### Caching Strategy
- Industry benchmarks (rarely change)
- Client contexts (invalidate on update)
- Usage stats (5-minute cache)

## Deployment Checklist

### Environment Variables
```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=

# OpenAI
OPENAI_API_KEY=

# Stripe
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=
STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=

# App
NEXT_PUBLIC_APP_URL=
```

### Database Migrations
1. Run `001_initial_schema.sql`
2. Run `002_usage_tracking_and_enhancements.sql`

### Stripe Setup
1. Create products for each plan
2. Set up webhook endpoint
3. Configure webhook events:
   - `customer.subscription.created`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`

### Monitoring
- Track usage_logs for cost analysis
- Monitor OpenAI API latency
- Alert on high error rates
- Track plan upgrade conversions

## Future Enhancements

### Phase 2 (Post-MVP)
- Team collaboration features
- API integrations (Meta, Google Ads)
- Social posting automation
- Advanced analytics dashboard
- White-label options
- Webhook notifications
- Bulk operations
- Export capabilities

### Scalability Considerations
- Implement Redis for caching
- Add queue system for long-running tasks
- Implement CDN for static assets
- Add database read replicas
- Implement rate limiting per IP
- Add comprehensive logging (DataDog/Sentry)

## Code Organization

```
src/
├── app/
│   ├── api/                    # API routes
│   │   ├── content/
│   │   ├── performance/
│   │   ├── context/
│   │   ├── usage/
│   │   ├── clients/
│   │   └── stripe/
│   ├── dashboard/              # Dashboard pages
│   └── auth/                   # Auth pages
├── components/
│   ├── ui/                     # Reusable UI components
│   └── layout/                 # Layout components
├── lib/
│   ├── ai/                     # AI system
│   │   ├── client.ts          # AI wrapper
│   │   ├── generator.ts       # High-level operations
│   │   └── prompts.ts         # Prompt templates
│   ├── middleware/            # Middleware functions
│   │   └── usage-limiter.ts   # Usage enforcement
│   ├── pdf/                   # PDF generation
│   ├── csv/                   # CSV parsing
│   ├── supabase/              # Database clients
│   ├── stripe/                # Payment logic
│   └── utils.ts               # Utilities
├── types/
│   ├── index.ts               # Core types
│   └── database.ts            # Database types
└── config/                    # Configuration
```

## Testing Strategy

### Unit Tests
- AI prompt generation
- CSV parsing logic
- Usage limit calculations
- Cost estimation

### Integration Tests
- API route flows
- Database operations
- Stripe webhooks
- OpenAI API calls

### E2E Tests
- User signup → client creation → content generation
- CSV upload → analysis → report generation
- Subscription upgrade flow

## Monitoring & Analytics

### Key Metrics
- AI generation success rate
- Average token usage per action
- Cost per client per month
- Plan upgrade conversion rate
- API response times
- Error rates by endpoint

### Alerts
- Usage approaching plan limits
- High OpenAI API costs
- Failed payment attempts
- Database connection issues
- High error rates

---

**Last Updated**: February 2026
**Version**: 2.0 (Production-Grade)
