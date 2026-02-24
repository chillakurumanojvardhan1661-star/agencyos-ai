# Generate Supabase Types - REQUIRED FOR BUILD

## ⚠️ Build Guard Enabled
This project has a **prebuild check** that prevents deploying with placeholder types. When you run `npm run build`, it will automatically verify that real Supabase types have been generated.

## The Problem
The build is failing because we're using placeholder Supabase types. TypeScript can't infer proper types, causing `never` type errors throughout the codebase.

## The Solution
Generate real types from your Supabase database using one of the methods below.

---

## 🚀 Quick Start (Recommended)

### One-Command Generation
```bash
npm run gen:types
```

This runs: `supabase gen types typescript --linked > src/types/supabase.ts`

**Prerequisites:**
- Supabase CLI installed globally: `npm install -g supabase`
- Logged in: `supabase login`
- Project linked: `supabase link --project-ref YOUR_PROJECT_REF`

---

## 📋 Step-by-Step Guide

### Step 1: Install Supabase CLI
```bash
npm install -g supabase
```

### Step 2: Login to Supabase
```bash
supabase login
```

This will open your browser for authentication.

### Step 3: Link Your Project
```bash
supabase link --project-ref YOUR_PROJECT_REF
```

**To find your project ref:**
1. Go to https://app.supabase.com
2. Select your project
3. Go to Settings → General
4. Copy the "Reference ID"

### Step 4: Generate Types
```bash
npm run gen:types
```

Or manually:
```bash
supabase gen types typescript --linked > src/types/supabase.ts
```

### Step 5: Verify Build
```bash
npm run build
```

The prebuild check will verify types are generated, then the build should pass!

---

## 🔄 Alternative Methods

### Method 1: Generate from Database URL
If you can't link the project, generate types directly from the database URL:

```bash
# Set your database URL
export SUPABASE_DB_URL="postgresql://postgres:[PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres"

# Generate types
npm run gen:types:url
```

**Get your database URL:**
1. Supabase Dashboard → Settings → Database
2. Copy the "Connection string" (URI format)
3. Replace `[PASSWORD]` with your database password

### Method 2: CI/CD with Environment Variable
For automated deployments, you can link using an environment variable:

```bash
# In your CI/CD environment
export SUPABASE_PROJECT_REF="your-project-ref"

# Link and generate
supabase link --project-ref $SUPABASE_PROJECT_REF
npm run gen:types
```

**Security Note:** Store `SUPABASE_PROJECT_REF` as a secret in your CI/CD platform (GitHub Actions, Vercel, etc.)

---

## 🛠️ CI/CD Integration

### GitHub Actions Example
```yaml
name: Build

on: [push]

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node
        uses: actions/setup-node@v3
        with:
          node-version: '18'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Install Supabase CLI
        run: npm install -g supabase
      
      - name: Generate Supabase types
        env:
          SUPABASE_ACCESS_TOKEN: ${{ secrets.SUPABASE_ACCESS_TOKEN }}
          SUPABASE_PROJECT_REF: ${{ secrets.SUPABASE_PROJECT_REF }}
        run: |
          supabase link --project-ref $SUPABASE_PROJECT_REF
          npm run gen:types
      
      - name: Build
        run: npm run build
```

**Required Secrets:**
- `SUPABASE_ACCESS_TOKEN` - Get from https://app.supabase.com/account/tokens
- `SUPABASE_PROJECT_REF` - Your project reference ID

### Vercel Integration
Add to your Vercel project settings:

1. Go to Project Settings → Environment Variables
2. Add:
   - `SUPABASE_PROJECT_REF` = your-project-ref
   - `SUPABASE_ACCESS_TOKEN` = your-access-token

3. Add to `vercel.json`:
```json
{
  "buildCommand": "npm install -g supabase && supabase link --project-ref $SUPABASE_PROJECT_REF && npm run gen:types && npm run build"
}
```

---

## 🔍 What This Does

When you generate types:
1. Supabase CLI connects to your database
2. Reads your actual schema (tables, columns, relationships)
3. Generates TypeScript types that match exactly
4. Replaces placeholder types in `src/types/supabase.ts`
5. Sets `__SUPABASE_TYPES_GENERATED__ = true` (automatically)
6. Enables proper type inference for all Supabase queries

---

## ✅ Verification

### Check if types are generated:
```bash
grep "__SUPABASE_TYPES_GENERATED__" src/types/supabase.ts
```

Should show: `export const __SUPABASE_TYPES_GENERATED__ = true;`

### Test the build:
```bash
npm run build
```

If types are not generated, you'll see:
```
╔═══════════════════════════════════════════════╗
║  🚫  SUPABASE TYPES NOT GENERATED             ║
║                                               ║
║  You are using placeholder Supabase types.    ║
║  Production builds require real generated     ║
║  types from your database.                    ║
╚═══════════════════════════════════════════════╝

✗ ERROR Build blocked: Placeholder Supabase types detected
```

---

## 🐛 Troubleshooting

### Error: "supabase: command not found"
```bash
npm install -g supabase
```

### Error: "Not logged in"
```bash
supabase login
```

### Error: "Project not linked"
```bash
supabase link --project-ref YOUR_PROJECT_REF
```

### Error: "Invalid project ref"
- Verify your project ref in Supabase Dashboard → Settings → General
- Make sure you're logged into the correct Supabase account

### Error: "Permission denied"
- Ensure your Supabase account has access to the project
- Check that your access token is valid (if using CI/CD)

### Error: "Database connection failed"
- Verify your database is running
- Check firewall rules allow connections
- Ensure database password is correct (if using DB URL method)

### Types generated but build still fails
```bash
# Verify the flag is set correctly
grep "__SUPABASE_TYPES_GENERATED__" src/types/supabase.ts

# Should show: export const __SUPABASE_TYPES_GENERATED__ = true;

# If it shows false, regenerate:
npm run gen:types
```

### Want to skip the check temporarily (NOT RECOMMENDED)
```bash
# Only for local development/testing
npm run build --ignore-scripts
```

**Warning:** This bypasses the safety check. Never deploy to production this way!

---

## 📚 After Generating Types

### Benefits
- ✅ Build passes without type errors
- ✅ Full TypeScript autocomplete for database queries
- ✅ Compile-time safety for database operations
- ✅ Better IDE support and refactoring

### Optional Cleanup
You can gradually remove `as any` casts from API routes (they're safe to keep, but not needed with real types):

```typescript
// Before (with placeholder types)
const { data } = await (supabase.from('agencies') as any).select('*');

// After (with real types)
const { data } = await supabase.from('agencies').select('*');
// TypeScript now knows the exact shape of 'data'!
```

### Keep Types Updated
Whenever you change your database schema:
```bash
npm run gen:types
```

---

## 🚀 Ready to Deploy

Once types are generated:
1. ✅ `npm run build` passes
2. ✅ Prebuild check succeeds
3. ✅ Ready for production deployment

See `DEPLOYMENT_CHECKLIST.md` for next steps!

---

## 📖 Additional Resources

- [Supabase CLI Documentation](https://supabase.com/docs/guides/cli)
- [Generating Types Guide](https://supabase.com/docs/guides/api/generating-types)
- [TypeScript Support](https://supabase.com/docs/guides/api/typescript-support)

---

**Last Updated:** February 19, 2026
