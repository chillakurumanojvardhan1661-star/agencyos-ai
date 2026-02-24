import { NextRequest, NextResponse } from 'next/server';

/**
 * Domain-based routing middleware for AgencyOS AI
 * 
 * Handles routing between:
 * - Marketing site (agencyos.ai) → (marketing) route group
 * - SaaS app (app.agencyos.ai) → dashboard, admin, api routes
 * 
 * Prevents route conflicts and ensures clean separation
 */

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const hostname = request.headers.get('host') || '';

  // Extract domain (handle localhost and production)
  const isLocalhost = hostname.includes('localhost') || hostname.includes('127.0.0.1');
  const isAppSubdomain = hostname.startsWith('app.');
  const isRootDomain = !isAppSubdomain && !isLocalhost;

  // Never interfere with API routes - they work on both domains
  if (pathname.startsWith('/api/')) {
    return NextResponse.next();
  }

  // Never interfere with Next.js internals
  if (
    pathname.startsWith('/_next/') ||
    pathname.startsWith('/static/') ||
    pathname.includes('.') // files like favicon.ico, robots.txt, etc.
  ) {
    return NextResponse.next();
  }

  // APP SUBDOMAIN (app.agencyos.ai)
  // Allow: /dashboard, /admin, /pricing (SaaS), /public, /api
  // Block: marketing routes
  if (isAppSubdomain) {
    // Allow SaaS app routes
    if (
      pathname.startsWith('/dashboard') ||
      pathname.startsWith('/admin') ||
      pathname.startsWith('/pricing') ||
      pathname.startsWith('/public') ||
      pathname === '/'
    ) {
      return NextResponse.next();
    }

    // Block marketing routes on app subdomain
    if (
      pathname === '/about' ||
      pathname === '/demo' ||
      pathname.startsWith('/about/') ||
      pathname.startsWith('/demo/')
    ) {
      // Redirect to app home
      const url = request.nextUrl.clone();
      url.pathname = '/dashboard';
      return NextResponse.redirect(url);
    }

    return NextResponse.next();
  }

  // ROOT DOMAIN (agencyos.ai)
  // Allow: /, /pricing (marketing), /about, /demo, /public (for shared reports)
  // Block: /dashboard, /admin
  if (isRootDomain || isLocalhost) {
    // Allow marketing routes
    if (
      pathname === '/' ||
      pathname === '/pricing' ||
      pathname === '/about' ||
      pathname === '/demo' ||
      pathname.startsWith('/public/') // Allow public reports on root domain
    ) {
      return NextResponse.next();
    }

    // Block SaaS app routes on root domain
    if (
      pathname.startsWith('/dashboard') ||
      pathname.startsWith('/admin')
    ) {
      // Redirect to marketing home
      const url = request.nextUrl.clone();
      url.pathname = '/';
      return NextResponse.redirect(url);
    }

    return NextResponse.next();
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public files (images, etc.)
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
