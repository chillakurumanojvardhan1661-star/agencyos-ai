#!/bin/bash

# AgencyOS AI - Deployment Script
# This script guides you through the deployment process

set -e  # Exit on error

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Functions
print_header() {
    echo ""
    echo -e "${BLUE}═══════════════════════════════════════════════════════════════${NC}"
    echo -e "${BLUE}$1${NC}"
    echo -e "${BLUE}═══════════════════════════════════════════════════════════════${NC}"
    echo ""
}

print_success() {
    echo -e "${GREEN}✓${NC} $1"
}

print_error() {
    echo -e "${RED}✗${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}⚠${NC} $1"
}

print_info() {
    echo -e "${BLUE}ℹ${NC} $1"
}

check_command() {
    if command -v $1 &> /dev/null; then
        print_success "$1 is installed"
        return 0
    else
        print_error "$1 is not installed"
        return 1
    fi
}

# Main script
clear
print_header "AgencyOS AI - Deployment Script"

echo "This script will guide you through deploying AgencyOS AI to production."
echo ""
read -p "Press Enter to continue..."

# Step 1: Check prerequisites
print_header "Step 1: Checking Prerequisites"

MISSING_TOOLS=0

if ! check_command "node"; then
    print_error "Node.js is required. Install from https://nodejs.org"
    MISSING_TOOLS=1
fi

if ! check_command "npm"; then
    print_error "npm is required. Install Node.js from https://nodejs.org"
    MISSING_TOOLS=1
fi

if ! check_command "supabase"; then
    print_warning "Supabase CLI not installed"
    echo ""
    echo "Install with: npm install -g supabase"
    echo "Or on macOS: brew install supabase/tap/supabase"
    echo ""
    read -p "Install now? (y/n) " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        npm install -g supabase
        if check_command "supabase"; then
            print_success "Supabase CLI installed"
        else
            print_error "Failed to install Supabase CLI"
            MISSING_TOOLS=1
        fi
    else
        MISSING_TOOLS=1
    fi
fi

if ! check_command "vercel"; then
    print_warning "Vercel CLI not installed"
    echo ""
    echo "Install with: npm install -g vercel"
    echo ""
    read -p "Install now? (y/n) " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        npm install -g vercel
        if check_command "vercel"; then
            print_success "Vercel CLI installed"
        else
            print_error "Failed to install Vercel CLI"
            MISSING_TOOLS=1
        fi
    else
        MISSING_TOOLS=1
    fi
fi

if [ $MISSING_TOOLS -eq 1 ]; then
    print_error "Please install missing tools and run this script again"
    exit 1
fi

print_success "All prerequisites met"
echo ""
read -p "Press Enter to continue..."

# Step 2: Login to services
print_header "Step 2: Login to Services"

print_info "Logging in to Supabase..."
if supabase login; then
    print_success "Logged in to Supabase"
else
    print_error "Failed to login to Supabase"
    exit 1
fi

echo ""
print_info "Logging in to Vercel..."
if vercel login; then
    print_success "Logged in to Vercel"
else
    print_error "Failed to login to Vercel"
    exit 1
fi

echo ""
read -p "Press Enter to continue..."

# Step 3: Link Supabase project
print_header "Step 3: Link Supabase Project"

print_info "Available projects:"
supabase projects list

echo ""
read -p "Enter your Supabase project reference ID: " PROJECT_REF

if [ -z "$PROJECT_REF" ]; then
    print_error "Project reference is required"
    exit 1
fi

print_info "Linking to project: $PROJECT_REF"
if supabase link --project-ref "$PROJECT_REF"; then
    print_success "Project linked successfully"
else
    print_error "Failed to link project"
    exit 1
fi

echo ""
read -p "Press Enter to continue..."

# Step 4: Generate Supabase types
print_header "Step 4: Generate Supabase Types"

print_info "Generating types from database..."
if npm run gen:types; then
    print_success "Types generated successfully"
    print_info "File updated: src/types/supabase.ts"
else
    print_error "Failed to generate types"
    exit 1
fi

echo ""
read -p "Press Enter to continue..."

# Step 5: Verify production readiness
print_header "Step 5: Verify Production Readiness"

print_info "Running production readiness checks..."
if npm run verify:prod; then
    print_success "All production readiness checks passed"
else
    print_error "Production readiness checks failed"
    print_info "Please fix the issues above and run: npm run verify:prod"
    exit 1
fi

echo ""
read -p "Press Enter to continue..."

# Step 6: Test build
print_header "Step 6: Test Production Build"

print_info "Building for production..."
if npm run build; then
    print_success "Production build successful"
else
    print_error "Production build failed"
    print_info "Please fix the build errors and try again"
    exit 1
fi

echo ""
read -p "Press Enter to continue..."

# Step 7: Deploy
print_header "Step 7: Deploy to Vercel"

print_warning "This will deploy your application to production"
echo ""
read -p "Continue with deployment? (y/n) " -n 1 -r
echo

if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    print_info "Deployment cancelled"
    exit 0
fi

print_info "Deploying to Vercel..."
if vercel --prod; then
    print_success "Deployment successful!"
else
    print_error "Deployment failed"
    exit 1
fi

# Step 8: Post-deployment instructions
print_header "Deployment Complete! 🎉"

echo "Your application has been deployed successfully!"
echo ""
echo "Next steps:"
echo ""
echo "1. Configure Domains in Vercel:"
echo "   - Go to: Vercel Dashboard → Your Project → Settings → Domains"
echo "   - Add: agencyos.ai"
echo "   - Add: app.agencyos.ai"
echo ""
echo "2. Set Environment Variables in Vercel:"
echo "   - Go to: Vercel Dashboard → Your Project → Settings → Environment Variables"
echo "   - Add all required variables (see .env.example)"
echo ""
echo "3. Configure DNS at your registrar:"
echo "   - Type: A, Name: @, Value: 76.76.21.21"
echo "   - Type: CNAME, Name: app, Value: cname.vercel-dns.com"
echo ""
echo "4. Configure Stripe Webhook:"
echo "   - Endpoint: https://app.agencyos.ai/api/stripe/webhook"
echo "   - Events: checkout.session.*, customer.subscription.*"
echo ""
echo "5. Test your deployment:"
echo "   - Marketing: https://agencyos.ai"
echo "   - App: https://app.agencyos.ai"
echo ""
echo "For detailed instructions, see: DEPLOY_NOW.md"
echo ""
print_success "Deployment script complete!"
