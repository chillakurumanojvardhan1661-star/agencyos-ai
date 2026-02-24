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

    // Get active nudges for user
    const { data: nudges, error } = await supabase
      .rpc('get_active_nudges' as any);

    if (error) throw error;

    // Return highest priority nudge (if any)
    const activeNudge = (nudges as any) && (nudges as any).length > 0 
      ? (nudges as any).sort((a: any, b: any) => a.priority - b.priority)[0]
      : null;

    return NextResponse.json(activeNudge);
  } catch (error) {
    console.error('Get nudges error:', error);
    return NextResponse.json(null);
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = getSupabaseRouteClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { nudge_type } = body;

    if (!nudge_type) {
      return NextResponse.json({ error: 'Nudge type required' }, { status: 400 });
    }

    // Dismiss the nudge
    const { error } = await supabase
      .rpc('dismiss_nudge' as any, { nudge_type } as any);

    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Dismiss nudge error:', error);
    return NextResponse.json({ success: true }); // Silent fail
  }
}
