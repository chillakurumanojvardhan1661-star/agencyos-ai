#!/usr/bin/env node

/**
 * Prebuild Check: Verify Supabase Types Are Generated
 * 
 * This script ensures that real Supabase types have been generated
 * before building for production. It prevents deploying with placeholder types.
 * 
 * PRODUCTION ENFORCEMENT:
 * - In production (NODE_ENV=production OR VERCEL_ENV=production):
 *   - REQUIRES __SUPABASE_TYPES_GENERATED__ === true
 *   - IGNORES __DEV_MODE_UNBLOCK__ completely
 *   - FAILS build if placeholder types detected
 * 
 * - In development:
 *   - Allows __DEV_MODE_UNBLOCK__ mode
 *   - Shows warning banner
 *   - Allows build to continue
 */

import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const TYPES_FILE = join(__dirname, '..', 'src', 'types', 'supabase.ts');

// Check if we're in production
const isProduction = 
  process.env.NODE_ENV === 'production' || 
  process.env.VERCEL_ENV === 'production';

// ANSI color codes for terminal output
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  cyan: '\x1b[36m',
  bold: '\x1b[1m',
  bgRed: '\x1b[41m',
  bgYellow: '\x1b[43m',
};

function printError(message) {
  console.error(`${colors.red}${colors.bold}✗ ERROR${colors.reset} ${message}`);
}

function printWarning(message) {
  console.warn(`${colors.yellow}⚠ WARNING${colors.reset} ${message}`);
}

function printInfo(message) {
  console.log(`${colors.cyan}ℹ INFO${colors.reset} ${message}`);
}

function printBox(lines) {
  const maxLength = Math.max(...lines.map(l => l.length));
  const border = '═'.repeat(maxLength + 4);
  
  console.log(`\n╔${border}╗`);
  lines.forEach(line => {
    const padding = ' '.repeat(maxLength - line.length);
    console.log(`║  ${line}${padding}  ║`);
  });
  console.log(`╚${border}╝\n`);
}

function printProductionError() {
  console.log('\n');
  console.log(`${colors.bgRed}${colors.bold}                                                                    ${colors.reset}`);
  console.log(`${colors.bgRed}${colors.bold}  🚫  PRODUCTION BUILD BLOCKED - PLACEHOLDER TYPES DETECTED  🚫    ${colors.reset}`);
  console.log(`${colors.bgRed}${colors.bold}                                                                    ${colors.reset}`);
  console.log('\n');
  
  printBox([
    '❌  CANNOT DEPLOY TO PRODUCTION WITH PLACEHOLDER TYPES',
    '',
    'You are attempting to build for production with placeholder',
    'Supabase types. This is NOT ALLOWED for security and reliability.',
    '',
    'Environment detected:',
    `  NODE_ENV: ${process.env.NODE_ENV || 'not set'}`,
    `  VERCEL_ENV: ${process.env.VERCEL_ENV || 'not set'}`,
  ]);

  printError('Build blocked: Placeholder Supabase types in production\n');

  console.log(`${colors.bold}${colors.red}REQUIRED ACTION:${colors.reset} Generate real types from your Supabase database\n`);
  
  console.log(`${colors.cyan}Option 1: Quick command (recommended)${colors.reset}`);
  console.log('  npm run gen:types\n');
  
  console.log(`${colors.cyan}Option 2: Manual steps${colors.reset}`);
  console.log('  1. Install Supabase CLI:');
  console.log('     npm install -g supabase\n');
  console.log('  2. Login to Supabase:');
  console.log('     supabase login\n');
  console.log('  3. Link your project:');
  console.log('     supabase link --project-ref YOUR_PROJECT_REF\n');
  console.log('  4. Generate types:');
  console.log('     supabase gen types typescript --linked > src/types/supabase.ts\n');
  console.log('  5. Verify the generated flag:');
  console.log('     grep "__SUPABASE_TYPES_GENERATED__" src/types/supabase.ts\n');
  console.log('     (should show: export const __SUPABASE_TYPES_GENERATED__ = true;)\n');

  console.log(`${colors.cyan}Option 3: Generate from database URL${colors.reset}`);
  console.log('  supabase gen types typescript --db-url "$SUPABASE_DB_URL" > src/types/supabase.ts\n');

  console.log(`${colors.bold}For detailed instructions, see:${colors.reset} GENERATE_TYPES.md\n`);
  console.log(`${colors.red}${colors.bold}Production builds will NOT proceed until real types are generated.${colors.reset}\n`);
}

function printDevWarning() {
  console.log('\n');
  console.log(`${colors.bgYellow}                                                                    ${colors.reset}`);
  console.log(`${colors.bgYellow}  ⚠️   DEV MODE: BUILDING WITH PLACEHOLDER SUPABASE TYPES  ⚠️       ${colors.reset}`);
  console.log(`${colors.bgYellow}                                                                    ${colors.reset}`);
  console.log('\n');
  
  printWarning('Building with placeholder types (DEV MODE UNBLOCK)');
  printWarning('This is TEMPORARY and NOT recommended for production!');
  console.log('');
  console.log(`${colors.yellow}${colors.bold}TODO:${colors.reset} Generate real Supabase types before production deployment`);
  console.log(`${colors.cyan}Run:${colors.reset} npm run gen:types`);
  console.log(`${colors.cyan}See:${colors.reset} GENERATE_TYPES.md for instructions`);
  console.log('');
}

try {
  // Read the types file
  const content = readFileSync(TYPES_FILE, 'utf-8');

  // Check if the generated flag exists and is true
  const generatedFlagMatch = content.match(/export\s+const\s+__SUPABASE_TYPES_GENERATED__\s*=\s*(true|false)/);
  const devModeMatch = content.match(/export\s+const\s+__DEV_MODE_UNBLOCK__\s*=\s*([^;]+);/);

  if (!generatedFlagMatch) {
    printError('Could not find __SUPABASE_TYPES_GENERATED__ flag in supabase.ts');
    printWarning('The types file may be corrupted or modified incorrectly.');
    process.exit(1);
  }

  const isGenerated = generatedFlagMatch[1] === 'true';

  // PRODUCTION ENFORCEMENT: Ignore dev mode flag completely
  if (isProduction) {
    if (!isGenerated) {
      printProductionError();
      process.exit(1);
    }
    
    // Success in production
    printInfo('✓ Production build: Real Supabase types verified');
    process.exit(0);
  }

  // DEVELOPMENT MODE: Allow unblock but warn
  if (!isGenerated) {
    // Check if dev mode unblock is enabled
    const devModeEnabled = devModeMatch && !devModeMatch[1].includes('false');
    
    if (devModeEnabled) {
      printDevWarning();
      process.exit(0); // Allow build to continue in dev
    }
    
    // Dev mode not enabled, show error
    printBox([
      '🚫  SUPABASE TYPES NOT GENERATED',
      '',
      'You are using placeholder Supabase types.',
      'Generate real types or enable dev mode unblock.',
    ]);

    printError('Build blocked: Placeholder Supabase types detected\n');

    console.log(`${colors.bold}To fix this, generate real types:${colors.reset}\n`);
    console.log('  npm run gen:types\n');
    console.log(`${colors.bold}For detailed instructions, see:${colors.reset} GENERATE_TYPES.md\n`);

    process.exit(1);
  }

  // Success! Real types detected
  printInfo('✓ Supabase types verified - real types detected');
  process.exit(0);

} catch (error) {
  printError(`Failed to check Supabase types: ${error.message}`);
  console.error(error);
  process.exit(1);
}
