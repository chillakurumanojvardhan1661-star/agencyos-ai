/**
 * Marketing Analytics Tracker
 * 
 * Lightweight analytics abstraction for marketing site
 * Can be plugged into PostHog, GA4, or any analytics provider
 */

export type MarketingEvent =
  | 'marketing_view_home'
  | 'marketing_view_pricing'
  | 'marketing_view_about'
  | 'marketing_view_demo'
  | 'marketing_click_start_trial';

export interface MarketingEventProperties {
  source?: string;
  content?: string;
  campaign?: string;
  [key: string]: any;
}

/**
 * Track a marketing event
 * Currently logs to console in development
 * Ready to plug into analytics provider
 */
export function trackMarketingEvent(
  event: MarketingEvent,
  properties?: MarketingEventProperties
) {
  // In development, log to console
  if (process.env.NODE_ENV === 'development') {
    console.log('[Marketing Analytics]', event, properties);
  }

  // TODO: Integrate with analytics provider
  // Examples:
  // - PostHog: posthog.capture(event, properties)
  // - GA4: gtag('event', event, properties)
  // - Segment: analytics.track(event, properties)
  
  // For now, we can use browser's sendBeacon for basic tracking
  if (typeof window !== 'undefined' && process.env.NEXT_PUBLIC_ANALYTICS_ENDPOINT) {
    const data = {
      event,
      properties: {
        ...properties,
        timestamp: new Date().toISOString(),
        url: window.location.href,
        referrer: document.referrer,
      },
    };

    // Use sendBeacon for reliable tracking even on page unload
    navigator.sendBeacon(
      process.env.NEXT_PUBLIC_ANALYTICS_ENDPOINT,
      JSON.stringify(data)
    );
  }
}

/**
 * Track page view
 */
export function trackPageView(page: string, properties?: MarketingEventProperties) {
  const eventMap: Record<string, MarketingEvent> = {
    '/': 'marketing_view_home',
    '/pricing': 'marketing_view_pricing',
    '/about': 'marketing_view_about',
    '/demo': 'marketing_view_demo',
  };

  const event = eventMap[page];
  if (event) {
    trackMarketingEvent(event, properties);
  }
}

/**
 * Track CTA click with source attribution
 */
export function trackCTAClick(source: string, properties?: MarketingEventProperties) {
  trackMarketingEvent('marketing_click_start_trial', {
    source,
    ...properties,
  });
}
