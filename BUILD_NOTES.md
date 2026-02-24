# Build Notes - Supabase Type Issues

## Current Status
The build is failing due to Supabase type mismatches. The `@supabase/auth-helpers-nextjs` package doesn't properly infer types from our Database type definition.

## Solution Options

### Option 1: Generate Real Supabase Types (RECOMMENDED)
Generate types directly from your Supabase database:

```bash
# Install Supabase CLI
npm install -g supabase

# Login to Supabase
supabase login

# Link your project
supabase link --project-ref YOUR_PROJECT_REF

# Generate types
supabase gen types typescript --linked > src/types/supabase.ts
```

This will replace the placeholder types in `src/types/supabase.ts` with real types from your database schema.

### Option 2: Use Type Assertions (CURRENT APPROACH)
We've added `as any` type assertions to Supabase queries that have type mismatches. This allows the build to pass but loses type safety.

Files with type assertions:
- `src/app/api/agency/profile/route.ts`
- `src/app/api/clients/[id]/brand-kit/route.ts`
- `src/app/api/clients/[id]/context/route.ts`
- `src/app/api/content/feedback/route.ts`
- And others...

### Option 3: Use Safe Query Helpers
We've created safe query helpers in `src/lib/supabase/safe.ts` that can be used instead of direct Supabase queries:

```typescript
import { safeInsert, safeUpdate, safeSelect } from '@/lib/supabase/safe';

// Instead of:
const { data, error } = await supabase.from('agencies').insert(input).select().single();

// Use:
const { data, error } = await safeInsert(supabase, 'agencies', input);
```

## Next Steps
1. Generate real Supabase types using Option 1
2. Remove type assertions once real types are in place
3. Test build passes: `npm run build`
4. Deploy to production

## Type Assertion Pattern
When you see type errors like:
```
Argument of type 'X' is not assignable to parameter of type 'never'
```

Add `as any` to the query:
```typescript
const { data, error } = await (supabase.from('table') as any)
  .insert(data)
  .select()
  .single();
```

Or cast the data variable:
```typescript
const value = (data as any).property;
```
