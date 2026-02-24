import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseRouteClient } from '@/lib/supabase/server';

// Force dynamic rendering
export const dynamic = 'force-dynamic';

/**
 * GET /api/admin/analytics
 * Returns comprehensive conversion analytics
 * Admin only - requires admin role
 */
export async function GET(request: NextRequest) {
  try {
    const supabase = getSupabaseRouteClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if user is admin
    const { data: isAdmin, error: adminError } = await supabase
      .rpc('is_admin' as any);

    if (adminError || !isAdmin) {
      return NextResponse.json(
        { error: 'Access denied. Admin role required.' },
        { status: 403 }
      );
    }

    // Get query parameters for date range
    const searchParams = request.nextUrl.searchParams;
    const days = parseInt(searchParams.get('days') || '30');
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    // Get conversion analytics
    const { data: conversionData, error: conversionError } = await supabase
      .rpc('get_conversion_analytics' as any, {
        p_start_date: startDate.toISOString(),
        p_end_date: new Date().toISOString(),
      } as any);

    if (conversionError) throw conversionError;

    // Get activation metrics
    const { data: activationData, error: activationError } = await supabase
      .rpc('get_activation_metrics' as any);

    if (activationError) throw activationError;

    // Get MRR metrics
    const { data: mrrData, error: mrrError } = await supabase
      .rpc('get_mrr_metrics' as any);

    if (mrrError) throw mrrError;

    // Get viral coefficient
    const { data: viralData, error: viralError } = await supabase
      .rpc('get_viral_coefficient' as any, {
        p_start_date: startDate.toISOString(),
        p_end_date: new Date().toISOString(),
      } as any);

    if (viralError) throw viralError;

    // Get daily analytics trend
    const { data: dailyData, error: dailyError } = await supabase
      .rpc('get_daily_analytics' as any, {
        p_days: days,
      } as any);

    if (dailyError) throw dailyError;

    // Transform conversion data into object
    const metrics: Record<string, { value: number; percentage: number }> = {};
    (conversionData as any)?.forEach((row: any) => {
      metrics[row.metric] = {
        value: Number(row.value),
        percentage: Number(row.percentage),
      };
    });

    // Calculate derived metrics
    const trialConversionRate = metrics.converted_trials?.percentage || 0;
    const activationRate = metrics.activated_trials?.percentage || 0;
    const referralConversionRate = metrics.converted_referrals?.percentage || 0;

    const activation = (activationData as any)?.[0] || {
      avg_hours_to_activation: 0,
      median_hours_to_activation: 0,
      total_activated: 0,
    };

    const mrr = (mrrData as any)?.[0] || {
      current_mrr: 0,
      professional_count: 0,
      enterprise_count: 0,
      trial_count: 0,
    };

    const viral = (viralData as any)?.[0] || {
      total_users: 0,
      total_referrals: 0,
      viral_coefficient: 0,
    };

    return NextResponse.json({
      period: {
        days,
        start_date: startDate.toISOString(),
        end_date: new Date().toISOString(),
      },
      overview: {
        trial_conversion_rate: trialConversionRate,
        activation_rate: activationRate,
        referral_conversion_rate: referralConversionRate,
        viral_coefficient: Number(viral.viral_coefficient),
      },
      trials: {
        total: metrics.total_trials?.value || 0,
        activated: metrics.activated_trials?.value || 0,
        converted: metrics.converted_trials?.value || 0,
        expired: metrics.expired_trials?.value || 0,
        activation_rate: activationRate,
        conversion_rate: trialConversionRate,
      },
      activation: {
        avg_hours: Number(activation.avg_hours_to_activation),
        median_hours: Number(activation.median_hours_to_activation),
        total_activated: activation.total_activated,
      },
      revenue: {
        current_mrr: Number(mrr.current_mrr),
        professional_count: mrr.professional_count,
        enterprise_count: mrr.enterprise_count,
        trial_count: mrr.trial_count,
        total_paying: mrr.professional_count + mrr.enterprise_count,
      },
      referrals: {
        total_users: viral.total_users,
        total_referrals: viral.total_referrals,
        viral_coefficient: Number(viral.viral_coefficient),
        conversion_rate: referralConversionRate,
      },
      daily_trend: (dailyData as any) || [],
    });
  } catch (error) {
    console.error('Admin analytics error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch analytics' },
      { status: 500 }
    );
  }
}
