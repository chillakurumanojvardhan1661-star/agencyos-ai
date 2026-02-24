import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseRouteClient } from '@/lib/supabase/server';


// Force dynamic rendering
export const dynamic = 'force-dynamic';
export async function POST(request: NextRequest) {
  try {
    const supabase = getSupabaseRouteClient();
    const body = await request.json();
    const { report_token, user_id } = body;

    if (!report_token) {
      return NextResponse.json({ error: 'Report token required' }, { status: 400 });
    }

    // Track referral
    // TODO: Remove type assertion after generating real Supabase types
    const { data: referralId, error } = await supabase
      .rpc('track_referral' as any, {
        report_token,
        user_id: user_id || null,
      } as any);

    if (error) throw error;

    return NextResponse.json({
      referral_id: referralId,
      success: true,
    });
  } catch (error) {
    console.error('Track referral error:', error);
    // Silent fail - don't break user flow
    return NextResponse.json({ success: true });
  }
}
