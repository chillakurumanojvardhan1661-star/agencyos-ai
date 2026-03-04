import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseRouteClient } from '@/lib/supabase/server';
import { getAuthUser } from '@/lib/auth';


// Force dynamic rendering
export const dynamic = 'force-dynamic';
export async function GET(request: NextRequest) {
  try {
    const user = await getAuthUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const supabase = getSupabaseRouteClient();

    // Get onboarding status using database function
    const { data, error } = await (supabase
      .rpc('get_onboarding_status' as any) as any)
      .single();

    if (error) throw error;

    return NextResponse.json(data);
  } catch (error) {
    console.error('Get onboarding status error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch onboarding status' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await getAuthUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const supabase = getSupabaseRouteClient();
    const body = await request.json();
    const { step } = body;

    if (!step) {
      return NextResponse.json({ error: 'Step name required' }, { status: 400 });
    }

    // Update onboarding step using database function
    const { error } = await (supabase
      .rpc('update_onboarding_step' as any, {
        step_name: step,
        completed: true,
      } as any) as any);

    if (error) throw error;

    // Get updated status
    const { data: status } = await (supabase
      .rpc('get_onboarding_status' as any) as any)
      .single();

    return NextResponse.json(status);
  } catch (error) {
    console.error('Update onboarding step error:', error);
    return NextResponse.json(
      { error: 'Failed to update onboarding step' },
      { status: 500 }
    );
  }
}
