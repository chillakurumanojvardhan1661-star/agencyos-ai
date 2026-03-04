import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseRouteClient } from '@/lib/supabase/server';
import { getSupabaseAdminClient } from '@/lib/supabase/server';
import type { Database } from '@/types/supabase';


// Force dynamic rendering
export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const supabaseAdmin = getSupabaseAdminClient();

    const { searchParams } = new URL(request.url);
    const agency_id = searchParams.get('agency_id');

    if (!agency_id) {
      return NextResponse.json({ error: 'Missing agency_id' }, { status: 400 });
    }

    // Get monthly usage stats
    // TODO: Remove type assertion after generating real Supabase types
    const { data: usageStats, error } = await (supabaseAdmin as any)
      .rpc('get_monthly_usage', { p_agency_id: agency_id });

    if (error) throw error;

    // Get usage by action type
    const { data: usageByType, error: typeError } = await supabaseAdmin
      .from('usage_logs')
      .select('action_type, tokens_used, cost_estimate')
      .eq('agency_id', agency_id)
      .gte('created_at', new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString());

    if (typeError) throw typeError;

    // Aggregate by action type
    const breakdown = usageByType.reduce((acc: any, log: any) => {
      if (!acc[log.action_type]) {
        acc[log.action_type] = { count: 0, tokens: 0, cost: 0 };
      }
      acc[log.action_type].count++;
      acc[log.action_type].tokens += log.tokens_used;
      acc[log.action_type].cost += parseFloat(log.cost_estimate);
      return acc;
    }, {});

    return NextResponse.json({
      total: usageStats[0] || { total_tokens: 0, total_cost: 0, action_count: 0 },
      breakdown,
    });
  } catch (error) {
    console.error('Usage stats error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch usage stats' },
      { status: 500 }
    );
  }
}
