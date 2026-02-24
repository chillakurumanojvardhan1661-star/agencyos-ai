# How to Link Your Supabase Project

You're seeing this error because the Supabase CLI doesn't know which project to connect to yet.

---

## 🎯 Quick Solution

### Step 1: Login to Supabase
```bash
supabase login
```
This will open your browser to authenticate.

### Step 2: Find Your Project Reference ID

**Option A: From Supabase Dashboard URL**
1. Go to https://supabase.com/dashboard
2. Click on your project
3. Look at the URL in your browser
4. Format: `https://supabase.com/dashboard/project/YOUR_PROJECT_REF`
5. Copy the `YOUR_PROJECT_REF` part (20-25 characters)

**Option B: List All Projects**
```bash
supabase projects list
```
This shows all your projects with their reference IDs.

### Step 3: Link Your Project
```bash
supabase link --project-ref YOUR_PROJECT_REF
```
Replace `YOUR_PROJECT_REF` with your actual project reference ID.

### Step 4: Generate Types
```bash
npm run gen:types
```

---

## 📋 Complete Example

```bash
# 1. Login
$ supabase login
# Browser opens, you authenticate

# 2. List projects (optional, to find your project ref)
$ supabase projects list
# Output shows:
# ┌─────────────────────────┬──────────────────────┬───────────────┐
# │ NAME                    │ ORGANIZATION         │ PROJECT REF   │
# ├─────────────────────────┼──────────────────────┼───────────────┤
# │ AgencyOS AI             │ My Organization      │ abcdefghijk   │
# └─────────────────────────┴──────────────────────┴───────────────┘

# 3. Link to your project
$ supabase link --project-ref abcdefghijk
# Enter your database password when prompted

# 4. Generate types
$ npm run gen:types
# Types generated successfully!
```

---

## 🔑 Database Password

When you run `supabase link`, it will ask for your database password.

**Where to find it:**
1. Go to Supabase Dashboard → Project Settings → Database
2. Look for "Database Password" or "Connection String"
3. If you don't have it, you can reset it in the dashboard

**Default password:** If you saved it during project creation, use that.

---

## 🚨 Common Issues

### Issue: "Cannot find project ref"
**Solution:** You need to link first: `supabase link --project-ref YOUR_REF`

### Issue: "Invalid project ref"
**Solution:** 
- Verify the project ref is correct
- Check you're logged in: `supabase login`
- List projects: `supabase projects list`

### Issue: "Authentication failed"
**Solution:**
- Logout and login again: `supabase logout && supabase login`
- Check your internet connection

### Issue: "Database password incorrect"
**Solution:**
- Reset password in Supabase Dashboard → Project Settings → Database
- Try again with new password

---

## 🎯 Alternative: Generate Types Without Linking

If you have your database connection string, you can generate types directly:

```bash
# Set your database URL
export SUPABASE_DB_URL="postgresql://postgres:[PASSWORD]@db.[PROJECT_REF].supabase.co:5432/postgres"

# Generate types
npm run gen:types:url
```

**Where to find connection string:**
1. Supabase Dashboard → Project Settings → Database
2. Copy "Connection string" (URI format)
3. Replace `[YOUR-PASSWORD]` with your actual password

---

## ✅ Verification

After linking, verify it worked:

```bash
# Check if project is linked
ls -la supabase/.temp/project-ref

# Try generating types
npm run gen:types

# Should see:
# Generating types...
# Types generated successfully!
```

---

## 🚀 Next Steps After Linking

Once your project is linked and types are generated:

```bash
# 1. Verify production readiness
npm run verify:prod

# 2. Test build
npm run build

# 3. Deploy
vercel --prod
```

---

## 📞 Need Help?

If you're still having issues:

1. **Check you're logged in:**
   ```bash
   supabase projects list
   ```
   If this fails, run `supabase login` again

2. **Verify project exists:**
   - Go to https://supabase.com/dashboard
   - Ensure your project is active (not paused)

3. **Try manual connection:**
   - Use database URL method (see Alternative section above)

---

**Ready to link?**

```bash
# Step 1: Login
supabase login

# Step 2: List projects (to find your ref)
supabase projects list

# Step 3: Link (replace with your actual ref)
supabase link --project-ref YOUR_PROJECT_REF

# Step 4: Generate types
npm run gen:types
```

---

**Status:** Waiting for project linking  
**Next:** Link your Supabase project to continue deployment
