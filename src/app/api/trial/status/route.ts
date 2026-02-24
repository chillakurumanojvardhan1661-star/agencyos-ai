import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseRouteClient } from '@/lib/supabase/server';


// Force dynamic rendering
export const dynamic = 'force-dynamic';
export async function GET(request: NextRequest) {
  try {
    const supabase = getSupabaseRouteClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get trial status
    const { data: trialStatus, error } = await supabase
      .rpc('get_trial_status' as any)
      .single();

    if (error) throw error;

    return NextResponse.json(trialStatus || {
      is_trial: false,
      days_remaining: 0,
      hours_remaining: 0,
      trial_ends_at: null,
      is_expired: false,
    });
  } catch (error) {
    console.error('Get trial status error:', error);
    return NextResponse.json({
      is_trial: false,
      days_remaining: 0,
      hours_remaining: 0,
      trial_ends_at: null,
      is_expired: false,
    });
  }
}
