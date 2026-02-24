# AgencyOS AI - Project Structure

## Complete File Tree

```
agencyos-ai/
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   ├── content/
│   │   │   │   └── generate/
│   │   │   │       └── route.ts          # Content generation endpoint
│   │   │   ├── performance/
│   │   │   │   └── analyze/
│   │   │   │       └── route.ts          # Performance analysis endpoint
│   │   │   ├── context/
│   │   │   │   └── update/
│   │   │   │       └── route.ts          # Client context update endpoint
│   │   │   ├── usage/
│   │   │   │   └── stats/
│   │   │   │       └── route.ts          # Usage statistics endpoint
│   │   │   ├── clients/
│   │   │   │   └── create/
│   │   │   │       └── route.ts          # Client creation endpoint
│   │   │   └── stripe/
│   │   │       └── webhook/
│   │   │           └── route.ts          # Stripe webhook handler
│   │   ├── dashboard/
│   │   │   ├── layout.tsx                # Dashboard layout with sidebar
│   │   │   ├── page.tsx                  # Dashboard home
│   │   │   ├── clients/
│   │   │   │   └── page.tsx              # Client management
│   │   │   ├── generate/
│   │   │   │   └── page.tsx              # Content generation UI
│   │   │   ├── reports/
│   │   │   │   └── page.tsx              # Reports listing
│   │   │   └── billing/
│   │   │       └── page.tsx              # Billing & subscription
│   │   ├── auth/
│   │   │   ├── login/
│   │   │   │   └── page.tsx              # Login page
│   │   │   └── signup/
│   │   │       └── page.tsx              # Signup page
│   │   ├── layout.tsx                    # Root layout
│   │   ├── page.tsx                      # Landing page
│   │   └── globals.css                   # Global styles
│   ├── components/
│   │   ├── ui/
│   │   │   ├── button.tsx                # Button component
│   │   │   ├── card.tsx                  # Card component
│   │   │   ├── input.tsx                 # Input component
│   │   │   ├── select.tsx                # Select component
│   │   │   └── badge.tsx                 # Badge component
│   │   └── layout/
│   │       ├── sidebar.tsx               # Dashboard sidebar
│   │       └── header.tsx                # Dashboard header
│   ├── lib/
│   │   ├── ai/
│   │   │   ├── client.ts                 # ✨ AI Client Wrapper (NEW)
│   │   │   ├── generator.ts              # ✨ Enhanced AI Generator
│   │   │   └── prompts.ts                # ✨ Enhanced Prompt Templates
│   │   ├── middleware/
│   │   │   └── usage-limiter.ts          # ✨ Usage Tracking Middleware (NEW)
│   │   ├── pdf/
│   │   │   └── generator.ts              # ✨ PDF Report Generator (NEW)
│   │   ├── csv/
│   │   │   └── parser.ts                 # CSV parsing utilities
│   │   ├── supabase/
│   │   │   ├── client.ts                 # Client-side Supabase client
│   │   │   └── server.ts                 # Server-side Supabase client
│   │   ├── stripe/
│   │   │   └── client.ts                 # Stripe client & config
│   │   ├── openai/
│   │   │   └── client.ts                 # OpenAI client (legacy)
│   │   └── utils.ts                      # Utility functions
│   ├── types/
│   │   ├── index.ts                      # ✨ Enhanced Core types
│   │   └── database.ts                   # Database types
│   └── config/
│       └── constants.ts                  # App constants
├── supabase/
│   └── migrations/
│       ├── 001_initial_schema.sql        # Initial database schema
│       └── 002_usage_tracking_and_enhancements.sql  # ✨ NEW: Enhanced schema
├── public/
│   ├── logo.svg
│   └── favicon.ico
├── .env.example                          # Environment variables template
├── .gitignore
├── package.json                          # ✨ Updated dependencies
├── tsconfig.json                         # TypeScript configuration
├── tailwind.config.ts                    # Tailwind CSS configuration
├── postcss.config.js                     # PostCSS configuration
├── next.config.js                        # Next.js configuration
├── README.md                             # Project README
├── ARCHITECTURE.md                       # ✨ Architecture documentation (NEW)
└── PROJECT_STRUCTURE.md                  # ✨ This file (NEW)
```

## Key Files Explained

### ✨ New/Enhanced Files

#### `/src/lib/ai/client.ts`
**Purpose**: Centralized AI API wrapper
- Handles all OpenAI API calls
- Automatic token usage logging
- Retry logic with exponential backoff
- JSON schema validation
- Cost estimation
- Timeout handling

#### `/src/lib/ai/generator.ts`
**Purpose**: High-level AI operations
- Enhanced with client context injection
- Industry benchmark integration
- Schema validation
- Usage metadata tracking

#### `/src/lib/ai/prompts.ts`
**Purpose**: AI prompt templates
- Enhanced with context memory
- Industry benchmark comparison
- Structured output formats

#### `/src/lib/middleware/usage-limiter.ts`
**Purpose**: Usage enforcement
- Checks plan limits before AI calls
- Validates client count limits
- Returns upgrade messages
- Tracks current usage

#### `/src/lib/pdf/generator.ts`
**Purpose**: PDF report generation
- HTML template generation
- Industry comparison section
- Branded theming (dark/light)
- KPI visualization
- AI insights formatting

#### `/supabase/migrations/002_usage_tracking_and_enhancements.sql`
**Purpose**: Enhanced database schema
- `usage_logs` table for tracking
- `client_contexts` table for AI memory
- `industry_benchmarks` table with seed data
- `get_monthly_usage()` function
- Additional indexes and RLS policies

### API Routes

#### `/api/content/generate`
- Validates usage limits
- Fetches client context
- Generates AI content
- Logs usage
- Returns content + usage stats

#### `/api/performance/analyze`
- Validates usage limits
- Fetches industry benchmarks
- Analyzes performance with AI
- Compares to industry standards
- Returns analysis + usage stats

#### `/api/context/update`
- Updates client AI memory
- Stores winning/failed patterns
- Enables context-aware generation

#### `/api/usage/stats`
- Returns monthly usage breakdown
- Shows cost per action type
- Displays token consumption

#### `/api/clients/create`
- Validates client limit
- Creates new client
- Returns usage stats

#### `/api/stripe/webhook`
- Handles Stripe events
- Updates subscription status
- Manages billing lifecycle

## Component Structure

### UI Components (`/components/ui/`)
- Reusable, styled components
- Based on ShadCN UI patterns
- Consistent design system
- Dark mode support

### Layout Components (`/components/layout/`)
- Sidebar navigation
- Header with user menu
- Dashboard wrapper
- Responsive layouts

## Type System

### `/types/index.ts`
Core application types:
- User, Agency, Client
- BrandKit, ClientContext (NEW)
- ContentGeneration, AdPerformanceUpload
- Report, Subscription
- UsageLog (NEW), IndustryBenchmark (NEW)
- PLAN_LIMITS constant (NEW)

### `/types/database.ts`
Supabase-generated types:
- Database schema types
- Table row types
- Insert/Update types

## Configuration Files

### `package.json`
Dependencies:
- Next.js 14
- React 18
- Supabase client
- OpenAI SDK
- Stripe SDK
- Zod (validation)
- Puppeteer (PDF generation) ✨ NEW
- Recharts (charts) ✨ NEW

### `tsconfig.json`
TypeScript configuration:
- Strict mode enabled
- Path aliases (@/*)
- Next.js plugin

### `tailwind.config.ts`
Tailwind CSS configuration:
- Dark mode support
- Custom color scheme
- Component paths

## Database Schema

### Core Tables
1. `users` - User profiles
2. `agencies` - Multi-tenant root
3. `clients` - Agency clients
4. `brand_kits` - Client branding
5. `client_contexts` - AI memory ✨ NEW
6. `content_generations` - Generated content
7. `ad_performance_uploads` - CSV uploads
8. `reports` - PDF reports
9. `subscriptions` - Billing
10. `usage_logs` - AI usage tracking ✨ NEW
11. `industry_benchmarks` - Benchmark data ✨ NEW

### Key Enhancements
- Usage tracking for all AI calls
- Client context memory for better AI
- Industry benchmarks for comparison
- Monthly usage aggregation function
- Enhanced RLS policies

## Development Workflow

### Setup
```bash
npm install
cp .env.example .env.local
# Configure environment variables
npm run dev
```

### Database Setup
```bash
# Run migrations in Supabase dashboard
# 1. 001_initial_schema.sql
# 2. 002_usage_tracking_and_enhancements.sql
```

### Stripe Setup
```bash
# Create products in Stripe dashboard
# Configure webhook endpoint
# Add webhook secret to .env.local
```

## Deployment

### Vercel Deployment
```bash
vercel deploy
```

### Environment Variables
- Set all variables in Vercel dashboard
- Configure Supabase connection
- Add OpenAI API key
- Configure Stripe keys

### Post-Deployment
- Run database migrations
- Seed industry benchmarks
- Test webhook endpoints
- Verify RLS policies

## Monitoring

### Key Metrics
- Usage logs (tokens, cost)
- API response times
- Error rates
- Plan upgrade conversions

### Logging
- Server-side console logs
- Supabase logs
- Stripe webhook logs
- OpenAI API logs

---

**Version**: 2.0 (Production-Grade)
**Last Updated**: February 2026
