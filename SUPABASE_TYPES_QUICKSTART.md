# Supabase Types - Quick Reference

## 🚨 Build Blocked?

If you see this error when running `npm run build`:

```
🚫  SUPABASE TYPES NOT GENERATED
```

**Fix it in 30 seconds:**

```bash
# 1. Install CLI (if not already installed)
npm install -g supabase

# 2. Login
supabase login

# 3. Link your project (get ref from Supabase dashboard)
supabase link --project-ref YOUR_PROJECT_REF

# 4. Generate types
npm run gen:types

# 5. Build should now work!
npm run build
```

---

## 📋 Available Commands

```bash
# Generate types (requires linked project)
npm run gen:types

# Generate types from database URL
npm run gen:types:url  # Set SUPABASE_DB_URL first

# Check if types are generated
node scripts/check-supabase-types.mjs

# Build (includes automatic type check)
npm run build
```

---

## 🔍 Quick Checks

### Is my project linked?
```bash
supabase link --project-ref YOUR_PROJECT_REF
```

### Are types generated?
```bash
grep "__SUPABASE_TYPES_GENERATED__" src/types/supabase.ts
```

Should show: `export const __SUPABASE_TYPES_GENERATED__ = true;`

### Where do I find my project ref?
1. Go to https://app.supabase.com
2. Select your project
3. Settings → General → Reference ID

---

## 🤖 CI/CD Setup

### GitHub Actions
```yaml
- name: Generate Supabase types
  env:
    SUPABASE_ACCESS_TOKEN: ${{ secrets.SUPABASE_ACCESS_TOKEN }}
    SUPABASE_PROJECT_REF: ${{ secrets.SUPABASE_PROJECT_REF }}
  run: |
    npm install -g supabase
    supabase link --project-ref $SUPABASE_PROJECT_REF
    npm run gen:types
```

### Vercel
Add environment variables:
- `SUPABASE_PROJECT_REF`
- `SUPABASE_ACCESS_TOKEN`

Build command:
```bash
npm install -g supabase && supabase link --project-ref $SUPABASE_PROJECT_REF && npm run gen:types && npm run build
```

---

## 🆘 Troubleshooting

| Error | Solution |
|-------|----------|
| `supabase: command not found` | `npm install -g supabase` |
| `Not logged in` | `supabase login` |
| `Project not linked` | `supabase link --project-ref YOUR_REF` |
| `Invalid project ref` | Check Supabase dashboard for correct ref |
| Build still fails | Verify flag: `grep __SUPABASE_TYPES_GENERATED__ src/types/supabase.ts` |

---

## 📚 Full Documentation

See `GENERATE_TYPES.md` for:
- Detailed step-by-step guide
- Alternative generation methods
- CI/CD integration examples
- Complete troubleshooting guide

---

**Need help?** Check `GENERATE_TYPES.md` or `DEPLOYMENT_CHECKLIST.md`
