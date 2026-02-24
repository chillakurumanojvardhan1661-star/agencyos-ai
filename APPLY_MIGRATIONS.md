# Apply Database Migrations

**Issue:** Your Supabase database is empty. The migrations need to be applied.

---

## 🎯 Quick Fix

Run this command now:

```bash
supabase db push
```

This will apply all 11 migration files to your database and create:
- All tables (users, agencies, clients, subscriptions, etc.)
- All functions
- All RLS policies
- All indexes

---

## 📋 What Migrations Will Be Applied

1. `001_initial_schema.sql` - Core tables (users, agencies, clients, etc.)
2. `002_usage_tracking_and_enhancements.sql` - Usage tracking
3. `003_agency_branding.sql` - Agency branding
4. `004_templates_library.sql` - Templates system
5. `005_user_onboarding.sql` - Onboarding system
6. `006_onboarding_analytics.sql` - Onboarding analytics
7. `007_nudge_system.sql` - Nudge system
8. `008_viral_growth.sql` - Viral growth features
9. `009_pro_trial_system.sql` - Pro trial system
10. `010_analytics_dashboard.sql` - Analytics dashboard
11. `011_referral_analytics.sql` - Referral analytics

---

## ⏱️ Expected Time

- Migration application: ~30 seconds
- Type regeneration: ~10 seconds
- Build: ~2 minutes
- Deploy: ~3 minutes

**Total: ~6 minutes to production**

---

## 🚀 Complete Workflow

```bash
# 1. Apply migrations
supabase db push

# 2. Regenerate types (to include new tables)
npm run gen:types

# 3. Verify production readiness
npm run verify:prod

# 4. Test build
npm run build

# 5. Deploy
vercel --prod
```

---

## ✅ Success Indicators

After `supabase db push`, you should see:
```
Applying migration 001_initial_schema.sql...
Applying migration 002_usage_tracking_and_enhancements.sql...
...
Finished supabase db push.
```

After `npm run gen:types`, the types file should include all your tables.

After `npm run build`, it should complete without errors.

---

## 🚨 Troubleshooting

### Issue: "Cannot connect to database"
- Verify you're linked: `supabase projects list`
- Check your internet connection
- Try relinking: `supabase link --project-ref bqkvakodsxiqkjuvbrqo`

### Issue: "Migration failed"
- Check the error message
- Verify database password is correct
- Check if tables already exist (might need to reset database)

### Issue: "Permission denied"
- Ensure you have admin access to the Supabase project
- Check you're logged in: `supabase login`

---

## 📊 Verify Migrations Applied

After running `supabase db push`, you can verify in the Supabase Dashboard:

1. Go to: https://supabase.com/dashboard/project/bqkvakodsxiqkjuvbrqo/editor
2. You should see tables like:
   - users
   - agencies
   - clients
   - brand_kits
   - content_generations
   - subscriptions
   - etc.

---

## ⏭️ Next Steps

Once migrations are applied:

1. **Regenerate types** to include all tables:
   ```bash
   npm run gen:types
   ```

2. **Verify the build passes**:
   ```bash
   npm run build
   ```

3. **Deploy to production**:
   ```bash
   vercel --prod
   ```

---

**Run this command now:**
```bash
supabase db push
```

Then regenerate types and continue with deployment!
