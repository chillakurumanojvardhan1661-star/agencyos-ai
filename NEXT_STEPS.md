# 🎯 Next Steps - Link Supabase Project

**Current Status:** ✅ Supabase CLI installed and logged in  
**Next Action:** Link your Supabase project

---

## 📋 What You Need to Do Now

### 1. Get Your Project Reference ID

**Go to:** https://supabase.com/dashboard

1. Click on your project (AgencyOS AI or whatever you named it)
2. Look at the URL in your browser address bar
3. It will look like: `https://supabase.com/dashboard/project/xyzabcdefghijk`
4. Copy the part after `/project/` (that's your project ref)

**Example:**
- URL: `https://supabase.com/dashboard/project/abcdefghijklmnop`
- Project Ref: `abcdefghijklmnop`

---

### 2. Link Your Project

Once you have your project ref, run:

```bash
supabase link --project-ref YOUR_PROJECT_REF
```

**Replace `YOUR_PROJECT_REF` with your actual project reference.**

**Example:**
```bash
supabase link --project-ref abcdefghijklmnop
```

You'll be prompted for your database password.

---

### 3. Enter Database Password

When prompted, enter your database password.

**Don't have it?**
1. Go to: Supabase Dashboard → Project Settings → Database
2. Look for "Database Password" section
3. Click "Reset Database Password" if needed
4. Copy the new password
5. Use it when linking

---

### 4. Generate Types

After successfully linking, run:

```bash
npm run gen:types
```

This will generate TypeScript types from your database schema.

---

### 5. Continue Deployment

Once types are generated:

```bash
# Verify production readiness
npm run verify:prod

# Test build
npm run build

# Deploy
vercel --prod
```

---

## 🚨 Troubleshooting

### "Cannot find project ref"
- You haven't linked yet
- Run: `supabase link --project-ref YOUR_REF`

### "Invalid project ref"
- Double-check you copied the correct ref from the URL
- Make sure there are no extra spaces

### "Authentication failed" or "Invalid password"
- Reset your database password in Supabase Dashboard
- Try linking again with the new password

### "Project not found"
- Verify you're logged into the correct Supabase account
- Check the project exists and is not paused

---

## ✅ Success Indicators

After linking successfully, you should see:
```
Finished supabase link.
```

Then when you run `npm run gen:types`, you should see:
```
Generating types...
Types generated successfully!
```

---

## 📞 Alternative Method (If Linking Fails)

If you can't link for some reason, you can generate types using the database URL:

```bash
# Get your connection string from Supabase Dashboard → Project Settings → Database
# Format: postgresql://postgres:[PASSWORD]@db.[PROJECT_REF].supabase.co:5432/postgres

export SUPABASE_DB_URL="your_connection_string_here"
npm run gen:types:url
```

---

## 🎯 Quick Command Reference

```bash
# 1. Link project (do this now)
supabase link --project-ref YOUR_PROJECT_REF

# 2. Generate types
npm run gen:types

# 3. Verify readiness
npm run verify:prod

# 4. Test build
npm run build

# 5. Deploy
vercel --prod
```

---

## ⏱️ Time Remaining to Production

- Link project: 2 minutes
- Generate types: 1 minute
- Verify & build: 3 minutes
- Deploy: 3 minutes
- Configure: 5 minutes

**Total: ~15 minutes**

---

**Current Step:** Link your Supabase project  
**Command to run:** `supabase link --project-ref YOUR_PROJECT_REF`  
**After that:** `npm run gen:types`

---

**Need help?** See `LINK_SUPABASE_PROJECT.md` for detailed instructions.
