#!/bin/bash

# Add dynamic export to all API routes

find src/app/api -name "route.ts" -not -name "*.bak" | while read file; do
  # Check if file already has dynamic export
  if ! grep -q "export const dynamic" "$file"; then
    echo "Adding dynamic export to: $file"
    
    # Add after imports, before first export function
    sed -i.tmp '1a\
\
// Force dynamic rendering for API routes\
export const dynamic = '\''force-dynamic'\'';
' "$file"
    
    rm "${file}.tmp" 2>/dev/null || true
  else
    echo "Skipping (already has dynamic export): $file"
  fi
done

echo "Done!"
