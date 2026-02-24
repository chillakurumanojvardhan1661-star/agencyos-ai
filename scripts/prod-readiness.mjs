#!/usr/bin/env node

/**
 * Production Readiness Gate
 * 
 * This script performs comprehensive checks before production deployment.
 * Run this in CI/CD pipeline before deploying to production.
 * 
 * Checks:
 * 1. Supabase types are generated (not placeholder)
 * 2. Required environment variables are documented
 * 3. Middleware configuration is valid
 * 4. SEO routes (sitemap, robots) exist
 * 5. Critical files and configurations are present
 * 
 * Usage:
 *   npm run verify:prod
 *   node scripts/prod-readiness.mjs
 */

import { readFileSync, existsSync, readdirSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// ANSI color codes
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  cyan: '\x1b[36m',
  bold: '\x1b[1m',
  bgGreen: '\x1b[42m',
  bgRed: '\x1b[41m',
};

// Track check results
const results = {
  passed: [],
  failed: [],
  warnings: [],
};

function printSuccess(message) {
  console.log(`${colors.green}✓${colors.reset} ${message}`);
  results.passed.push(message);
}

function printError(message) {
  console.error(`${colors.red}✗${colors.reset} ${message}`);
  results.failed.push(message);
}

function printWarning(message) {
  console.warn(`${colors.yellow}⚠${colors.reset} ${message}`);
  results.warnings.push(message);
}

function printInfo(message) {
  console.log(`${colors.cyan}ℹ${colors.reset} ${message}`);
}

function printHeader(title) {
  console.log(`\n${colors.bold}${colors.cyan}${title}${colors.reset}`);
  console.log('─'.repeat(title.length));
}

function printSummary() {
  console.log('\n');
  console.log('═'.repeat(70));
  console.log(`${colors.bold}PRODUCTION READINESS SUMMARY${colors.reset}`);
  console.log('═'.repeat(70));
  
  console.log(`\n${colors.green}Passed:${colors.reset} ${results.passed.length}`);
  console.log(`${colors.yellow}Warnings:${colors.reset} ${results.warnings.length}`);
  console.log(`${colors.red}Failed:${colors.reset} ${results.failed.length}`);
  
  if (results.warnings.length > 0) {
    console.log(`\n${colors.yellow}${colors.bold}Warnings:${colors.reset}`);
    results.warnings.forEach(w => console.log(`  ${colors.yellow}⚠${colors.reset} ${w}`));
  }
  
  if (results.failed.length > 0) {
    console.log(`\n${colors.red}${colors.bold}Failed Checks:${colors.reset}`);
    results.failed.forEach(f => console.log(`  ${colors.red}✗${colors.reset} ${f}`));
  }
  
  console.log('\n' + '═'.repeat(70));
  
  if (results.failed.length === 0) {
    console.log(`\n${colors.bgGreen}${colors.bold}  ✓ PRODUCTION READY  ${colors.reset}\n`);
    return true;
  } else {
    console.log(`\n${colors.bgRed}${colors.bold}  ✗ NOT PRODUCTION READY  ${colors.reset}\n`);
    console.log(`${colors.red}Fix the failed checks above before deploying to production.${colors.reset}\n`);
    return false;
  }
}

// ============================================================================
// CHECK 1: Supabase Types Generated
// ============================================================================
function checkSupabaseTypes() {
  printHeader('1. Checking Supabase Types');
  
  const typesFile = join(__dirname, '..', 'src', 'types', 'supabase.ts');
  
  if (!existsSync(typesFile)) {
    printError('Supabase types file not found: src/types/supabase.ts');
    return;
  }
  
  try {
    const content = readFileSync(typesFile, 'utf-8');
    const generatedMatch = content.match(/export\s+const\s+__SUPABASE_TYPES_GENERATED__\s*=\s*(true|false)/);
    
    if (!generatedMatch) {
      printError('Cannot find __SUPABASE_TYPES_GENERATED__ flag in supabase.ts');
      return;
    }
    
    const isGenerated = generatedMatch[1] === 'true';
    
    if (isGenerated) {
      printSuccess('Supabase types are generated (not placeholder)');
    } else {
      printError('Supabase types are PLACEHOLDER - must generate real types');
      printInfo('  Run: npm run gen:types');
    }
  } catch (error) {
    printError(`Failed to read Supabase types: ${error.message}`);
  }
}

// ============================================================================
// CHECK 2: Required Environment Variables Documented
// ============================================================================
function checkEnvDocumentation() {
  printHeader('2. Checking Environment Variables Documentation');
  
  const envExampleFile = join(__dirname, '..', '.env.example');
  
  if (!existsSync(envExampleFile)) {
    printError('.env.example file not found');
    printInfo('  Create .env.example with all required environment variables');
    return;
  }
  
  try {
    const content = readFileSync(envExampleFile, 'utf-8');
    
    // Required environment variables for this project
    const requiredVars = [
      'NEXT_PUBLIC_SUPABASE_URL',
      'NEXT_PUBLIC_SUPABASE_ANON_KEY',
      'SUPABASE_SERVICE_ROLE_KEY',
      'OPENAI_API_KEY',
      'STRIPE_SECRET_KEY',
      'NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY',
      'STRIPE_WEBHOOK_SECRET',
      'NEXT_PUBLIC_APP_URL',
      'NEXT_PUBLIC_SITE_URL',
    ];
    
    const missingVars = [];
    
    requiredVars.forEach(varName => {
      if (!content.includes(varName)) {
        missingVars.push(varName);
      }
    });
    
    if (missingVars.length === 0) {
      printSuccess('All required environment variables are documented in .env.example');
    } else {
      printError(`Missing environment variables in .env.example: ${missingVars.join(', ')}`);
      printInfo('  Add these variables to .env.example');
    }
    
    // Check for Stripe price IDs (optional but recommended)
    const optionalVars = [
      'STRIPE_PRICE_STARTER',
      'STRIPE_PRICE_PROFESSIONAL',
      'STRIPE_PRICE_ENTERPRISE',
    ];
    
    const missingOptional = optionalVars.filter(v => !content.includes(v));
    if (missingOptional.length > 0) {
      printWarning(`Optional Stripe price IDs not documented: ${missingOptional.join(', ')}`);
    }
    
  } catch (error) {
    printError(`Failed to read .env.example: ${error.message}`);
  }
}

// ============================================================================
// CHECK 3: Middleware Configuration
// ============================================================================
function checkMiddleware() {
  printHeader('3. Checking Middleware Configuration');
  
  const middlewareFile = join(__dirname, '..', 'src', 'middleware.ts');
  
  if (!existsSync(middlewareFile)) {
    printWarning('No middleware.ts found (optional)');
    return;
  }
  
  try {
    const content = readFileSync(middlewareFile, 'utf-8');
    
    // Check if middleware exports config with matcher
    const hasConfig = content.includes('export const config') || content.includes('export config');
    const hasMatcher = content.includes('matcher');
    
    if (hasConfig && hasMatcher) {
      printSuccess('Middleware configuration found with matcher');
    } else if (hasConfig) {
      printWarning('Middleware config found but no matcher specified');
      printInfo('  Consider adding matcher to optimize middleware execution');
    } else {
      printWarning('Middleware exists but no config export found');
      printInfo('  Add: export const config = { matcher: [...] }');
    }
    
    // Check for domain-based routing (specific to this project)
    if (content.includes('agencyos.ai') || content.includes('hostname')) {
      printSuccess('Domain-based routing detected in middleware');
    }
    
  } catch (error) {
    printError(`Failed to read middleware: ${error.message}`);
  }
}

// ============================================================================
// CHECK 4: SEO Routes (Sitemap & Robots)
// ============================================================================
function checkSEORoutes() {
  printHeader('4. Checking SEO Routes');
  
  const sitemapFile = join(__dirname, '..', 'src', 'app', 'sitemap.ts');
  const robotsFile = join(__dirname, '..', 'src', 'app', 'robots.ts');
  
  // Check sitemap
  if (existsSync(sitemapFile)) {
    printSuccess('Sitemap route exists: src/app/sitemap.ts');
  } else {
    printError('Sitemap route not found: src/app/sitemap.ts');
    printInfo('  Create src/app/sitemap.ts for SEO');
  }
  
  // Check robots.txt
  if (existsSync(robotsFile)) {
    printSuccess('Robots.txt route exists: src/app/robots.ts');
  } else {
    printError('Robots.txt route not found: src/app/robots.ts');
    printInfo('  Create src/app/robots.ts for SEO');
  }
}

// ============================================================================
// CHECK 5: Critical Files
// ============================================================================
function checkCriticalFiles() {
  printHeader('5. Checking Critical Files');
  
  const criticalFiles = [
    { path: 'package.json', description: 'Package configuration' },
    { path: 'next.config.js', description: 'Next.js configuration', optional: true },
    { path: 'tsconfig.json', description: 'TypeScript configuration' },
    { path: 'tailwind.config.ts', description: 'Tailwind configuration' },
    { path: 'src/app/layout.tsx', description: 'Root layout' },
    { path: 'src/lib/supabase/server.ts', description: 'Supabase server client' },
    { path: 'src/lib/supabase/client.ts', description: 'Supabase browser client' },
  ];
  
  criticalFiles.forEach(({ path, description, optional }) => {
    const fullPath = join(__dirname, '..', path);
    if (existsSync(fullPath)) {
      printSuccess(`${description}: ${path}`);
    } else {
      if (optional) {
        printWarning(`Optional file not found: ${path}`);
      } else {
        printError(`Critical file missing: ${path}`);
      }
    }
  });
}

// ============================================================================
// CHECK 6: Package.json Scripts
// ============================================================================
function checkPackageScripts() {
  printHeader('6. Checking Package.json Scripts');
  
  const packageFile = join(__dirname, '..', 'package.json');
  
  try {
    const content = JSON.parse(readFileSync(packageFile, 'utf-8'));
    const scripts = content.scripts || {};
    
    const requiredScripts = ['build', 'start', 'dev'];
    const recommendedScripts = ['lint', 'gen:types', 'verify:prod'];
    
    requiredScripts.forEach(script => {
      if (scripts[script]) {
        printSuccess(`Required script exists: ${script}`);
      } else {
        printError(`Required script missing: ${script}`);
      }
    });
    
    recommendedScripts.forEach(script => {
      if (scripts[script]) {
        printSuccess(`Recommended script exists: ${script}`);
      } else {
        printWarning(`Recommended script missing: ${script}`);
      }
    });
    
  } catch (error) {
    printError(`Failed to read package.json: ${error.message}`);
  }
}

// ============================================================================
// CHECK 7: Database Migrations
// ============================================================================
function checkDatabaseMigrations() {
  printHeader('7. Checking Database Migrations');
  
  const migrationsDir = join(__dirname, '..', 'supabase', 'migrations');
  
  if (!existsSync(migrationsDir)) {
    printWarning('No migrations directory found: supabase/migrations');
    printInfo('  Ensure database schema is properly managed');
    return;
  }
  
  try {
    const files = readdirSync(migrationsDir);
    const sqlFiles = files.filter(f => f.endsWith('.sql'));
    
    if (sqlFiles.length > 0) {
      printSuccess(`Found ${sqlFiles.length} database migration(s)`);
      printInfo(`  Latest: ${sqlFiles[sqlFiles.length - 1]}`);
    } else {
      printWarning('No SQL migration files found');
    }
  } catch (error) {
    printWarning(`Could not read migrations directory: ${error.message}`);
  }
}

// ============================================================================
// Main Execution
// ============================================================================
async function main() {
  console.log('\n');
  console.log('═'.repeat(70));
  console.log(`${colors.bold}${colors.cyan}PRODUCTION READINESS CHECK${colors.reset}`);
  console.log('═'.repeat(70));
  console.log(`\n${colors.cyan}Running comprehensive checks before production deployment...${colors.reset}\n`);
  
  // Run all checks
  checkSupabaseTypes();
  checkEnvDocumentation();
  checkMiddleware();
  checkSEORoutes();
  checkCriticalFiles();
  checkPackageScripts();
  checkDatabaseMigrations();
  
  // Print summary and exit
  const isReady = printSummary();
  process.exit(isReady ? 0 : 1);
}

// Run the checks
main().catch(error => {
  console.error(`\n${colors.red}${colors.bold}Fatal error:${colors.reset} ${error.message}`);
  process.exit(1);
});
