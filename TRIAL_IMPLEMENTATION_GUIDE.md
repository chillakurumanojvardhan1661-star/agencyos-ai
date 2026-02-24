# 7-Day Pro Trial - Quick Implementation Guide

## What Was Implemented

A complete 7-day Pro trial system that:
1. ✅ Auto-activates when users create their first agency
2. ✅ Provides full Professional-tier features (no watermarks, premium insights, Pro limits)
3. ✅ Shows dynamic trial banner with countdown and urgency
4. ✅ Auto-downgrades to starter after 7 days
5. ✅ Returns structured error codes for expired trial features
6. ✅ Integrates with Stripe for trial-to-paid conversion

## Quick Start

### 1. Run Database Migration
```bash
# Apply the trial system migration
supabase db push

# Or manually run:
psql $DATABASE_URL < supabase/migrations/009_pro_trial_system.sql
```

### 2. Set Environment Variables
Add to your `.env` file:
```bash
# Stripe Price IDs (get from Stripe Dashboard)
STRIPE_PROFESSIONAL_PRICE_ID=price_xxxxxxxxxxxxx
STRIPE_ENTERPRISE_PRICE_ID=price_xxxxxxxxxxxxx
```

### 3. Test the Flow

#### Create New Agency (Auto-Trial)
```bash
# User creates agency via UI or API
POST /api/agency/profile
{
  "name": "Test Agency",
  "currency": "USD",
  "timezone": "America/New_York"
}

# Trial automatically initializes:
# - plan = trial_pro
# - trial_ends_at = now + 7 days
# - Full Pro features unlocked
```

#### Check Trial Status
```bash
# Get trial status
GET /api/trial/status

# Response:
{
  "is_trial": true,
  "days_remaining": 7,
  "hours_remaining": 168,
  "trial_ends_at": "2026-02-25T10:30:00Z",
  "is_expired": false
}
```

#### View Trial Banner
- Navigate to `/dashboard`
- Banner appears at top showing days remaining
- Color changes based on urgency (blue → orange → red)
- Click "Upgrade to Professional" → Redirects to Stripe checkout

#### Test Feature Access
```bash
# During trial - No watermark
POST /api/reports/generate
# Response includes full report without watermark

# After trial expires - Watermark added
# System auto-downgrades to starter
# Watermark appears on reports
```

## Key Files

### Database
- `supabase/migrations/009_pro_trial_system.sql` - Schema and functions

### Backend
- `src/lib/trial/initializer.ts` - Trial initialization logic
- `src/lib/middleware/plan-gating.ts` - Feature gating with trial support
- `src/app/api/trial/status/route.ts` - Trial status endpoint
- `src/app/api/trial/initialize/route.ts` - Manual trial activation
- `src/app/api/agency/profile/route.ts` - Auto-trial on agency creation
- `src/app/api/stripe/webhook/route.ts` - Trial-to-paid conversion

### Frontend
- `src/components/trial/trial-banner.tsx` - Trial countdown banner
- `src/app/dashboard/page.tsx` - Displays trial banner

### Types
- `src/types/index.ts` - Added trial_pro plan and trial fields

## How It Works

### Trial Activation Flow
```
User Signs Up
    ↓
Creates Agency (POST /api/agency/profile)
    ↓
System Creates Stripe Customer
    ↓
Calls initialize_trial_subscription()
    ↓
Creates subscription:
  - plan: trial_pro
  - status: trialing
  - trial_ends_at: now + 7 days
    ↓
User Gets Full Pro Features
```

### Trial Expiration Flow
```
Every Request
    ↓
getPlanFeatures() called
    ↓
Runs check_trial_expiration()
    ↓
If now > trial_ends_at:
  - Update plan to 'starter'
  - Set is_trial = false
  - Lock premium features
    ↓
User Sees Upgrade Prompts
```

### Trial Conversion Flow
```
User Clicks "Upgrade"
    ↓
Redirects to Stripe Checkout
    ↓
User Completes Payment
    ↓
Stripe Webhook Fires
    ↓
Detects is_trial = true
    ↓
Calls convert_trial_to_paid()
    ↓
Updates subscription:
  - plan: professional
  - is_trial: false
  - stripe_subscription_id: sub_xxx
    ↓
Features Remain Unlocked
```

## Testing Checklist

### ✅ Trial Activation
- [ ] Create new agency
- [ ] Check subscriptions table: `is_trial=true`, `plan=trial_pro`
- [ ] Verify trial_ends_at is 7 days from now
- [ ] Trial banner appears on dashboard

### ✅ Trial Features
- [ ] Generate content → No watermark
- [ ] Generate report → Premium insights visible
- [ ] Usage limits show 200 generations (Pro tier)
- [ ] Banner shows correct days remaining

### ✅ Trial Expiration
- [ ] Set trial_ends_at to past date in database
- [ ] Refresh page → check_trial_expiration() runs
- [ ] Subscription updated to starter
- [ ] Watermark appears on new reports
- [ ] Premium insights locked

### ✅ Trial Conversion
- [ ] Click "Upgrade to Professional" in banner
- [ ] Complete Stripe checkout
- [ ] Webhook converts trial to paid
- [ ] Subscription shows professional plan
- [ ] Features remain unlocked

### ✅ Error Handling
- [ ] Try premium feature post-trial
- [ ] Verify TRIAL_EXPIRED error code returned
- [ ] Check error includes upgrade link
- [ ] Confirm RLS prevents bypass

## Manual Testing Commands

### Check Trial Status (SQL)
```sql
SELECT 
  s.plan,
  s.is_trial,
  s.trial_ends_at,
  s.trial_ends_at - NOW() as time_remaining
FROM subscriptions s
JOIN agencies a ON a.id = s.agency_id
WHERE a.owner_id = 'USER_ID';
```

### Manually Expire Trial (SQL)
```sql
UPDATE subscriptions
SET trial_ends_at = NOW() - INTERVAL '1 day'
WHERE agency_id = 'AGENCY_ID';
```

### Force Trial Check (SQL)
```sql
SELECT * FROM check_trial_expiration('AGENCY_ID');
```

### Batch Expire All Trials (SQL)
```sql
SELECT expire_trials_batch();
```

## Troubleshooting

### Trial Didn't Activate
**Symptom:** New agency created but no trial subscription

**Fix:**
1. Check agency creation logs
2. Verify Stripe customer was created
3. Manually initialize trial:
```bash
POST /api/trial/initialize
```

### Trial Not Expiring
**Symptom:** Trial expired but features still unlocked

**Fix:**
1. Check trial_ends_at timestamp
2. Manually run expiration check:
```sql
SELECT * FROM check_trial_expiration('AGENCY_ID');
```
3. Verify RLS policies are active

### Banner Not Showing
**Symptom:** Trial active but banner doesn't appear

**Fix:**
1. Check browser console for errors
2. Verify `/api/trial/status` returns correct data
3. Check if banner was dismissed (localStorage)

### Stripe Conversion Failed
**Symptom:** Payment succeeded but still on trial

**Fix:**
1. Check Stripe webhook logs
2. Verify webhook secret is correct
3. Manually convert trial:
```sql
SELECT convert_trial_to_paid(
  'AGENCY_ID',
  'professional',
  'sub_xxxxx'
);
```

## Production Deployment

### Pre-Deployment
1. ✅ Run migration on staging database
2. ✅ Test full trial flow on staging
3. ✅ Verify Stripe webhook on staging
4. ✅ Set production environment variables

### Deployment
```bash
# 1. Run migration
supabase db push --db-url $PRODUCTION_DB_URL

# 2. Deploy application
vercel --prod

# 3. Verify webhook
stripe listen --forward-to https://yourdomain.com/api/stripe/webhook
```

### Post-Deployment
1. ✅ Create test agency → Verify trial activates
2. ✅ Check trial banner appears
3. ✅ Test feature access during trial
4. ✅ Test Stripe checkout flow
5. ✅ Monitor webhook logs

## Monitoring

### Key Metrics to Track
- Trial activation rate (% of new agencies)
- Trial-to-paid conversion rate
- Average trial usage (generations, reports)
- Trial expiration without conversion
- Time to first upgrade

### Database Queries

**Trial Conversion Rate:**
```sql
SELECT 
  COUNT(*) FILTER (WHERE is_trial = false AND plan != 'starter') as converted,
  COUNT(*) FILTER (WHERE is_trial = true OR trial_ends_at IS NOT NULL) as total_trials,
  ROUND(100.0 * COUNT(*) FILTER (WHERE is_trial = false AND plan != 'starter') / 
    NULLIF(COUNT(*) FILTER (WHERE is_trial = true OR trial_ends_at IS NOT NULL), 0), 2) as conversion_rate
FROM subscriptions;
```

**Active Trials:**
```sql
SELECT COUNT(*)
FROM subscriptions
WHERE is_trial = true
  AND trial_ends_at > NOW();
```

**Expired Trials (Not Converted):**
```sql
SELECT COUNT(*)
FROM subscriptions
WHERE trial_ends_at < NOW()
  AND plan = 'starter';
```

## Next Steps

### Immediate (Done ✅)
- [x] Database schema and functions
- [x] Trial initialization on signup
- [x] Trial banner component
- [x] Feature gating with trial support
- [x] Stripe webhook integration
- [x] Structured error codes

### Phase 2 (Optional)
- [ ] Email notifications (Day 5, 7, 8)
- [ ] Trial extension (one-time 3-day)
- [ ] Trial analytics dashboard
- [ ] Personalized upgrade prompts
- [ ] A/B test trial duration

### Phase 3 (Future)
- [ ] Trial reactivation for old users
- [ ] Team member invites during trial
- [ ] Usage-based trial extension
- [ ] Trial success score prediction

## Support

For issues or questions:
1. Check `PRO_TRIAL_SYSTEM.md` for detailed documentation
2. Review database function comments
3. Check Stripe webhook logs
4. Monitor application logs for trial-related errors

## Summary

The 7-day Pro trial system is fully implemented and production-ready. It automatically activates on agency creation, provides full Professional features, shows a dynamic countdown banner, and auto-downgrades after expiration. The system integrates seamlessly with Stripe for conversion and includes proper error handling and security.

**Status:** ✅ COMPLETE - Ready for Production
