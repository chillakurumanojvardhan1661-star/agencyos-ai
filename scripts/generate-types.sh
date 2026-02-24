#!/bin/bash

# AgencyOS AI - Supabase Type Generation Helper
# This script automates the process of generating Supabase types

set -e  # Exit on error

echo "🚀 AgencyOS AI - Supabase Type Generation"
echo "=========================================="
echo ""

# Check if Supabase CLI is installed
if ! command -v supabase &> /dev/null; then
    echo "❌ Supabase CLI not found"
    echo ""
    echo "Install it with:"
    echo "  npm install -g supabase"
    echo ""
    exit 1
fi

echo "✓ Supabase CLI found"
echo ""

# Check if project is linked
if [ ! -f ".supabase/config.toml" ]; then
    echo "⚠️  Project not linked to Supabase"
    echo ""
    echo "Please run:"
    echo "  supabase login"
    echo "  supabase link --project-ref YOUR_PROJECT_REF"
    echo ""
    exit 1
fi

echo "✓ Project is linked"
echo ""

# Generate types
echo "📝 Generating types from database..."
supabase gen types typescript --linked > src/types/supabase.ts

# Add the generated flag
echo "" >> src/types/supabase.ts
echo "export const __SUPABASE_TYPES_GENERATED__ = true;" >> src/types/supabase.ts

echo ""
echo "✅ Types generated successfully!"
echo ""
echo "Next steps:"
echo "  1. Review the generated types: src/types/supabase.ts"
echo "  2. Run build: npm run build"
echo "  3. Proceed to deployment: see DEPLOYMENT_CHECKLIST.md"
echo ""
