import { createClient } from '@supabase/supabase-js';
import { trackTrialStarted } from '@/lib/analytics/tracker';

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

export interface TrialInitResult {
  success: boolean;
  subscription_id?: string;
  error?: string;
}

/**
 * Initialize a 7-day Pro trial for a new agency
 * This should be called after agency creation during signup
 */
export async function initializeProTrial(
  agencyId: string,
  stripeCustomerId: string
): Promise<TrialInitResult> {
  try {
    // Check if subscription already exists
    const { data: existing } = await getSupabaseAdmin()
      .from('subscriptions')
      .select('id')
      .eq('agency_id', agencyId)
      .single();

    if (existing) {
      return {
        success: false,
        error: 'Subscription already exists for this agency',
      };
    }

    // Initialize trial using database function
    // TODO: Remove type assertion after generating real Supabase types
    const { data: subscriptionId, error } = await (getSupabaseAdmin() as any)
      .rpc('initialize_trial_subscription', {
        p_agency_id: agencyId,
        p_stripe_customer_id: stripeCustomerId,
      });

    if (error) throw error;

    // Track analytics event
    await trackTrialStarted(agencyId, agencyId);

    return {
      success: true,
      subscription_id: subscriptionId,
    };
  } catch (error) {
    console.error('Trial initialization error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to initialize trial',
    };
  }
}

/**
 * Check if an agency is eligible for a trial
 */
export async function isEligibleForTrial(agencyId: string): Promise<boolean> {
  try {
    // Check if agency has ever had a subscription
    const { data: subscriptions } = await getSupabaseAdmin()
      .from('subscriptions')
      .select('id')
      .eq('agency_id', agencyId);

    // Eligible if no previous subscriptions
    return !subscriptions || subscriptions.length === 0;
  } catch (error) {
    console.error('Trial eligibility check error:', error);
    return false;
  }
}
