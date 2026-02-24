'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { trackPageView } from '@/lib/marketing-analytics';

/**
 * Marketing Analytics Tracker Component
 * 
 * Automatically tracks page views on marketing pages
 * Place in marketing layout to track all page views
 */
export function Track() {
  const pathname = usePathname();

  useEffect(() => {
    // Track page view on mount and pathname change
    trackPageView(pathname);
  }, [pathname]);

  return null; // This component renders nothing
}
