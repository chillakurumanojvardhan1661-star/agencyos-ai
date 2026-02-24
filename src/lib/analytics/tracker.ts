import { createClient } from '@supabase/supabase-js';

// Lazy initialization to avoid build-time errors
let supabaseAdmin: ReturnType<typeof createClient> | null = null;

function getSupabaseAdmin() {
  if (!supabaseAdmin) {
    supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );
  }
  return supabaseAdmin;
}

export type AnalyticsEventType =
  | 'trial_started'
  | 'trial_activated'
  | 'trial_converted'
  | 'trial_expired'
  | 'referral_signup'
  | 'referral_converted';

export interface TrackEventParams {
  eventType: AnalyticsEventType;
  agencyId?: string;
  userId?: string;
  metadata?: Record<string, any>;
}

/**
 * Track an analytics event
 * Uses service role to bypass RLS
 */
export async function trackAnalyticsEvent({
  eventType,
  agencyId,
  userId,
  metadata = {},
}: TrackEventParams): Promise<{ success: boolean; eventId?: string; error?: string }> {
  try {
    // TODO: Remove type assertion after generating real Supabase types
    const { data, error } = await (getSupabaseAdmin() as any).rpc('track_analytics_event', {
      p_event_type: eventType,
      p_agency_id: agencyId || null,
      p_user_id: userId || null,
      p_metadata: metadata,
    });

    if (error) throw error;

    return {
      success: true,
      eventId: data,
    };
  } catch (error) {
    console.error('Failed to track analytics event:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Track trial started event
 */
export async function trackTrialStarted(agencyId: string, userId: string) {
  return trackAnalyticsEvent({
    eventType: 'trial_started',
    agencyId,
    userId,
    metadata: { source: 'agency_creation' },
  });
}

/**
 * Track trial activated event (first report generated)
 */
export async function trackTrialActivated(agencyId: string, userId: string) {
  return trackAnalyticsEvent({
    eventType: 'trial_activated',
    agencyId,
    userId,
    metadata: { milestone: 'first_report' },
  });
}

/**
 * Track trial converted event (paid subscription)
 */
export async function trackTrialConverted(
  agencyId: string,
  userId: string,
  plan: string,
  stripeSubscriptionId?: string
) {
  return trackAnalyticsEvent({
    eventType: 'trial_converted',
    agencyId,
    userId,
    metadata: {
      plan,
      stripe_subscription_id: stripeSubscriptionId,
    },
  });
}

/**
 * Track trial expired event
 */
export async function trackTrialExpired(agencyId: string, userId: string) {
  return trackAnalyticsEvent({
    eventType: 'trial_expired',
    agencyId,
    userId,
    metadata: { auto_downgraded: true },
  });
}

/**
 * Track referral signup event
 */
export async function trackReferralSignup(
  userId: string,
  referrerAgencyId: string,
  referralToken: string
) {
  return trackAnalyticsEvent({
    eventType: 'referral_signup',
    userId,
    metadata: {
      referrer_agency_id: referrerAgencyId,
      referral_token: referralToken,
    },
  });
}

/**
 * Track referral converted event (referred user upgraded)
 */
export async function trackReferralConverted(
  userId: string,
  agencyId: string,
  referrerAgencyId: string,
  plan: string
) {
  return trackAnalyticsEvent({
    eventType: 'referral_converted',
    agencyId,
    userId,
    metadata: {
      referrer_agency_id: referrerAgencyId,
      plan,
    },
  });
}
