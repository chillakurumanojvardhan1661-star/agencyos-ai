#!/usr/bin/env node

import { readFileSync, writeFileSync } from 'fs';
import { execSync } from 'child_process';

// Find all route.ts files (excluding .bak files)
const files = execSync('find src/app/api -name "route.ts" -not -name "*.bak"', { encoding: 'utf-8' })
  .trim()
  .split('\n')
  .filter(Boolean);

console.log(`Found ${files.length} API route files\n`);

let updated = 0;
let skipped = 0;

files.forEach(file => {
  try {
    const content = readFileSync(file, 'utf-8');
    
    // Check if already has dynamic export
    if (content.includes('export const dynamic')) {
      console.log(`✓ Skip: ${file} (already has dynamic export)`);
      skipped++;
      return;
    }
    
    // Find the position after imports and before first export
    const lines = content.split('\n');
    let insertIndex = -1;
    
    // Find last import line
    for (let i = 0; i < lines.length; i++) {
      if (lines[i].startsWith('import ')) {
        insertIndex = i + 1;
      }
    }
    
    // If no imports found, insert at beginning
    if (insertIndex === -1) {
      insertIndex = 0;
    }
    
    // Skip empty lines after imports
    while (insertIndex < lines.length && lines[insertIndex].trim() === '') {
      insertIndex++;
    }
    
    // Insert the dynamic export
    lines.splice(insertIndex, 0, '', '// Force dynamic rendering', 'export const dynamic = \'force-dynamic\';');
    
    const newContent = lines.join('\n');
    writeFileSync(file, newContent, 'utf-8');
    
    console.log(`✓ Updated: ${file}`);
    updated++;
  } catch (error) {
    console.error(`✗ Error processing ${file}:`, error.message);
  }
});

console.log(`\n✅ Done! Updated ${updated} files, skipped ${skipped} files`);
