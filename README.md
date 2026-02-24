# AgencyOS AI - Marketing Automation Platform

AI-powered marketing automation platform for digital marketing agencies.

## Features

### Core Features
- Multi-client management dashboard
- AI content generation (ad copies, reel scripts, content calendars)
- CSV performance analysis with AI insights
- PDF client reports with industry benchmarks
- Stripe subscription billing with usage limits
- Multi-currency support (USD, INR, GBP, EUR, AUD, AED)

### Production Enhancements ✨
- **Usage Tracking System**: Track every AI call with token usage and cost estimation
- **Plan-Based Limits**: Enforce limits on generations, analyses, reports, and clients
- **AI Client Wrapper**: Centralized OpenAI management with retry logic and validation
- **Client Context Memory**: AI learns from past campaigns (winning hooks, failed angles)
- **Industry Benchmarks**: Compare performance against industry standards
- **Enhanced PDF Reports**: Professional reports with KPIs, charts, and AI insights

## Tech Stack

- Next.js 14 (App Router)
- TypeScript
- Tailwind CSS + ShadCN UI
- Supabase (Auth + Database + Storage)
- OpenAI API
- Stripe

## Getting Started

1. Install dependencies:
```bash
npm install
```

2. Set up environment variables:
```bash
cp .env.example .env.local
```

3. Configure Supabase:
- Create a new Supabase project
- Run migrations in order:
  1. `supabase/migrations/001_initial_schema.sql`
  2. `supabase/migrations/002_usage_tracking_and_enhancements.sql`
- Add your Supabase credentials to `.env.local`

4. Configure Stripe:
- Create products and prices in Stripe dashboard
- Add webhook endpoint: `/api/stripe/webhook`
- Add credentials to `.env.local`

5. Run development server:
```bash
npm run dev
```

## Project Structure

```
src/
├── app/              # Next.js App Router pages
│   ├── api/         # API routes with usage enforcement
│   └── dashboard/   # Dashboard pages
├── components/       # React components
│   ├── ui/          # Reusable UI components
│   └── layout/      # Layout components
├── lib/             # Core utilities
│   ├── ai/          # ✨ Enhanced AI system with wrapper
│   ├── middleware/  # ✨ Usage limiting & enforcement
│   ├── pdf/         # ✨ PDF report generation
│   ├── supabase/    # Database client
│   ├── stripe/      # Payment logic
│   └── csv/         # CSV parsing
└── types/           # ✨ Enhanced TypeScript definitions
```

See [PROJECT_STRUCTURE.md](./PROJECT_STRUCTURE.md) for complete file tree.

## Database Schema

See migrations in `supabase/migrations/` for complete schema.

### Core Tables
- users, agencies, clients
- brand_kits, content_generations
- ad_performance_uploads, reports
- subscriptions

### Enhanced Tables ✨
- **usage_logs**: Track AI calls, tokens, and costs
- **client_contexts**: AI memory for better content generation
- **industry_benchmarks**: Seeded benchmark data for 8 industries

See [ARCHITECTURE.md](./ARCHITECTURE.md) for detailed schema documentation.

## API Routes

### Content & Analysis
- `POST /api/content/generate` - Generate AI content with context memory
- `POST /api/performance/analyze` - Analyze performance with industry benchmarks
- `POST /api/context/update` - Update client AI context

### Management
- `POST /api/clients/create` - Create client with limit enforcement
- `GET /api/usage/stats` - Get monthly usage statistics

### Billing
- `POST /api/stripe/webhook` - Stripe webhook handler

All routes enforce usage limits based on subscription plan.

## Subscription Plans

| Feature | Starter | Professional | Enterprise |
|---------|---------|--------------|------------|
| Price | $49/mo | $149/mo | $399/mo |
| Clients | 5 | 20 | Unlimited |
| AI Generations | 50/mo | 200/mo | Unlimited |
| Performance Analyses | 20/mo | 100/mo | Unlimited |
| Reports | 10/mo | 50/mo | Unlimited |

## Architecture

This project follows a production-grade architecture with:
- **Modular AI System**: Centralized wrapper with retry logic and validation
- **Usage Enforcement**: Middleware checks limits before AI calls
- **Context Memory**: AI learns from past campaigns
- **Industry Benchmarks**: Compare metrics against standards
- **Comprehensive Logging**: Track tokens, costs, and usage patterns

See [ARCHITECTURE.md](./ARCHITECTURE.md) for detailed documentation.

## Deployment

Deploy to Vercel:
```bash
vercel deploy
```

Configure environment variables in Vercel dashboard.

## Documentation

- [ARCHITECTURE.md](./ARCHITECTURE.md) - System architecture and design decisions
- [PROJECT_STRUCTURE.md](./PROJECT_STRUCTURE.md) - Complete file tree and explanations

## License

Proprietary
