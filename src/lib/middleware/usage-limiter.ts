import { createClient } from '@supabase/supabase-js';
import { ActionType, PLAN_LIMITS, SubscriptionPlan } from '@/types';

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

interface UsageLimitResult {
  allowed: boolean;
  reason?: string;
  current_usage?: number;
  limit?: number;
  plan?: SubscriptionPlan;
  code?: 'LIMIT_EXCEEDED' | 'NO_SUBSCRIPTION' | 'INACTIVE_SUBSCRIPTION';
  action_type?: ActionType;
  recommended_plan?: SubscriptionPlan;
}

export async function checkUsageLimit(
  agency_id: string,
  action_type: ActionType
): Promise<UsageLimitResult> {
  try {
    // Get agency subscription
    const { data: subscription, error: subError } = await getSupabaseAdmin()
      .from('subscriptions')
      .select('plan, status')
      .eq('agency_id', agency_id)
      .single();

    if (subError || !subscription) {
      return {
        allowed: false,
        code: 'NO_SUBSCRIPTION',
        reason: 'No active subscription found. Please subscribe to a plan.',
        recommended_plan: 'professional',
      };
    }

    // Type assertion for subscription query
    // TODO: Remove after generating real Supabase types
    const subscriptionData = subscription as any;

    if (subscriptionData.status !== 'active' && subscriptionData.status !== 'trialing') {
      return {
        allowed: false,
        code: 'INACTIVE_SUBSCRIPTION',
        reason: 'Subscription is not active. Please update your billing.',
        plan: subscriptionData.plan as SubscriptionPlan,
      };
    }

    const plan = subscriptionData.plan as SubscriptionPlan;
    const limits = PLAN_LIMITS[plan];

    // Enterprise has unlimited usage
    if (plan === 'enterprise') {
      return { allowed: true, plan };
    }

    // Get monthly usage
    // TODO: Remove type assertion after generating real Supabase types
    const { data: usageData, error: usageError } = await (getSupabaseAdmin() as any)
      .rpc('get_monthly_usage', {
        p_agency_id: agency_id,
        p_action_type: action_type,
      })
      .single();

    if (usageError) {
      console.error('Usage check error:', usageError);
      return {
        allowed: false,
        reason: 'Failed to check usage limits. Please try again.',
      };
    }

    // Type assertion for usage data
    // TODO: Remove after generating real Supabase types
    const usageDataTyped = usageData as any;
    const currentUsage = Number(usageDataTyped.action_count || 0);
    let limit: number;

    switch (action_type) {
      case 'content_generation':
        limit = limits.monthly_generations;
        break;
      case 'performance_analysis':
        limit = limits.monthly_analyses;
        break;
      case 'report_generation':
        limit = limits.monthly_reports;
        break;
      default:
        return { allowed: false, reason: 'Invalid action type' };
    }

    if (currentUsage >= limit) {
      // Determine recommended plan
      const recommended_plan: SubscriptionPlan = 
        plan === 'starter' ? 'professional' : 'enterprise';

      return {
        allowed: false,
        code: 'LIMIT_EXCEEDED',
        reason: `Monthly ${action_type.replace('_', ' ')} limit reached (${limit}). Upgrade your plan for more.`,
        current_usage: currentUsage,
        limit,
        plan,
        action_type,
        recommended_plan,
      };
    }

    return {
      allowed: true,
      current_usage: currentUsage,
      limit,
      plan,
    };
  } catch (error) {
    console.error('Usage limit check error:', error);
    return {
      allowed: false,
      reason: 'Failed to verify usage limits. Please try again.',
    };
  }
}

export async function checkClientLimit(agency_id: string): Promise<UsageLimitResult> {
  try {
    // Get agency subscription
    const { data: subscription } = await getSupabaseAdmin()
      .from('subscriptions')
      .select('plan')
      .eq('agency_id', agency_id)
      .single();

    if (!subscription) {
      return {
        allowed: false,
        reason: 'No active subscription found.',
      };
    }

    // Type assertion for subscription query
    // TODO: Remove after generating real Supabase types
    const subscriptionData = subscription as any;
    const plan = subscriptionData.plan as SubscriptionPlan;
    const limits = PLAN_LIMITS[plan];

    // Enterprise has unlimited clients
    if (limits.max_clients === -1) {
      return { allowed: true, plan };
    }

    // Count current clients
    const { count, error } = await getSupabaseAdmin()
      .from('clients')
      .select('*', { count: 'exact', head: true })
      .eq('agency_id', agency_id);

    if (error) {
      console.error('Client count error:', error);
      return { allowed: false, reason: 'Failed to check client limit.' };
    }

    const currentClients = count || 0;

    if (currentClients >= limits.max_clients) {
      return {
        allowed: false,
        reason: `Client limit reached (${limits.max_clients}). Upgrade your plan for more clients.`,
        current_usage: currentClients,
        limit: limits.max_clients,
        plan,
      };
    }

    return {
      allowed: true,
      current_usage: currentClients,
      limit: limits.max_clients,
      plan,
    };
  } catch (error) {
    console.error('Client limit check error:', error);
    return { allowed: false, reason: 'Failed to verify client limit.' };
  }
}
