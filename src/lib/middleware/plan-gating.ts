import { createClient } from '@/lib/supabase/server';
import { SubscriptionPlan } from '@/types';

export interface PlanFeatures {
  plan: SubscriptionPlan;
  features: {
    remove_watermark: boolean;
    premium_insights: boolean;
    advanced_analytics: boolean;
    white_label: boolean;
    priority_support: boolean;
    custom_branding: boolean;
  };
}

export const PLAN_FEATURES: Record<SubscriptionPlan, PlanFeatures['features']> = {
  starter: {
    remove_watermark: false,
    premium_insights: false,
    advanced_analytics: false,
    white_label: false,
    priority_support: false,
    custom_branding: false,
  },
  trial_pro: {
    remove_watermark: true,
    premium_insights: true,
    advanced_analytics: true,
    white_label: false,
    priority_support: true,
    custom_branding: false,
  },
  professional: {
    remove_watermark: true,
    premium_insights: true,
    advanced_analytics: true,
    white_label: false,
    priority_support: true,
    custom_branding: false,
  },
  enterprise: {
    remove_watermark: true,
    premium_insights: true,
    advanced_analytics: true,
    white_label: true,
    priority_support: true,
    custom_branding: true,
  },
};

export async function getPlanFeatures(agencyId: string): Promise<PlanFeatures> {
  const supabase = createClient();

  // Check trial expiration first
  // TODO: Remove type assertion after generating real Supabase types
  const { data: trialCheck } = await supabase
    .rpc('check_trial_expiration' as any, { p_agency_id: agencyId } as any);

  // Get current subscription (may have been updated by trial check)
  const { data: subscription } = await supabase
    .from('subscriptions')
    .select('plan, is_trial, trial_ends_at')
    .eq('agency_id', agencyId)
    .in('status', ['active', 'trialing'])
    .single();

  // Type assertion for subscription query
  // TODO: Remove after generating real Supabase types
  const subscriptionData = subscription as any;
  const plan = (subscriptionData?.plan as SubscriptionPlan) || 'starter';

  return {
    plan,
    features: PLAN_FEATURES[plan],
  };
}

export function hasFeature(
  planFeatures: PlanFeatures,
  feature: keyof PlanFeatures['features']
): boolean {
  return planFeatures.features[feature];
}

export interface FeatureAccessResult {
  allowed: boolean;
  code?: 'TRIAL_EXPIRED' | 'FEATURE_LOCKED' | 'UPGRADE_REQUIRED';
  reason?: string;
  current_plan: SubscriptionPlan;
  required_plan?: SubscriptionPlan;
  feature: string;
}

export async function checkFeatureAccess(
  agencyId: string,
  feature: keyof PlanFeatures['features']
): Promise<FeatureAccessResult> {
  const planFeatures = await getPlanFeatures(agencyId);
  const hasAccess = hasFeature(planFeatures, feature);

  if (hasAccess) {
    return {
      allowed: true,
      current_plan: planFeatures.plan,
      feature,
    };
  }

  // Determine required plan for this feature
  let requiredPlan: SubscriptionPlan = 'professional';
  if (feature === 'white_label' || feature === 'custom_branding') {
    requiredPlan = 'enterprise';
  }

  // Check if user was on trial
  const supabase = createClient();
  const { data: subscription } = await supabase
    .from('subscriptions')
    .select('is_trial, trial_ends_at, plan')
    .eq('agency_id', agencyId)
    .single();

  // Type assertion for subscription query
  // TODO: Remove after generating real Supabase types
  const subscriptionData = subscription as any;
  const wasOnTrial = subscriptionData?.plan === 'starter' && subscriptionData?.trial_ends_at;

  return {
    allowed: false,
    code: wasOnTrial ? 'TRIAL_EXPIRED' : 'FEATURE_LOCKED',
    reason: wasOnTrial
      ? `Your trial has ended. Upgrade to ${requiredPlan} to access ${feature.replace(/_/g, ' ')}.`
      : `This feature requires ${requiredPlan} plan. Upgrade to unlock ${feature.replace(/_/g, ' ')}.`,
    current_plan: planFeatures.plan,
    required_plan: requiredPlan,
    feature,
  };
}

export interface UsageWarning {
  should_warn: boolean;
  usage_percentage: number;
  current_usage: number;
  limit: number;
  plan: SubscriptionPlan;
  recommended_plan?: SubscriptionPlan;
}

export async function checkUsageWarning(
  agencyId: string,
  actionType: 'content_generation' | 'performance_analysis' | 'report_generation'
): Promise<UsageWarning> {
  const supabase = createClient();

  // Get subscription
  const { data: subscription } = await supabase
    .from('subscriptions')
    .select('plan')
    .eq('agency_id', agencyId)
    .eq('status', 'active')
    .single();

  // Type assertion for subscription query
  // TODO: Remove after generating real Supabase types
  const subscriptionData = subscription as any;
  const plan = (subscriptionData?.plan as SubscriptionPlan) || 'starter';

  // Get usage for current month
  const startOfMonth = new Date();
  startOfMonth.setDate(1);
  startOfMonth.setHours(0, 0, 0, 0);

  const { count: currentUsage } = await supabase
    .from('usage_logs')
    .select('id', { count: 'exact', head: true })
    .eq('agency_id', agencyId)
    .eq('action_type', actionType)
    .gte('created_at', startOfMonth.toISOString());

  // Get limits
  const limits: Record<SubscriptionPlan, Record<string, number>> = {
    starter: {
      content_generation: 50,
      performance_analysis: 20,
      report_generation: 10,
    },
    trial_pro: {
      content_generation: 200,
      performance_analysis: 100,
      report_generation: 50,
    },
    professional: {
      content_generation: 200,
      performance_analysis: 100,
      report_generation: 50,
    },
    enterprise: {
      content_generation: -1, // unlimited
      performance_analysis: -1,
      report_generation: -1,
    },
  };

  const limit = limits[plan][actionType];
  const usage = currentUsage || 0;

  // Calculate percentage
  const usagePercentage = limit === -1 ? 0 : (usage / limit) * 100;

  // Determine if warning should show (80% threshold)
  const shouldWarn = usagePercentage >= 80 && limit !== -1;

  // Recommend upgrade plan
  let recommendedPlan: SubscriptionPlan | undefined;
  if (shouldWarn) {
    if (plan === 'starter') {
      recommendedPlan = 'professional';
    } else if (plan === 'professional') {
      recommendedPlan = 'enterprise';
    }
  }

  return {
    should_warn: shouldWarn,
    usage_percentage: usagePercentage,
    current_usage: usage,
    limit,
    plan,
    recommended_plan: recommendedPlan,
  };
}
