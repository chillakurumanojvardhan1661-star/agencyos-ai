import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseRouteClient } from '@/lib/supabase/server';


// Force dynamic rendering
export const dynamic = 'force-dynamic';
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = getSupabaseRouteClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const reportId = params.id;

    // Enable sharing and get token
    // TODO: Remove type assertion after generating real Supabase types
    const { data: token, error } = await supabase
      .rpc('enable_report_sharing' as any, { report_id: reportId } as any);

    if (error) throw error;

    // Get full URL
    const baseUrl = request.headers.get('origin') || process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    const shareUrl = `${baseUrl}/public/report/${token}`;

    return NextResponse.json({
      token,
      share_url: shareUrl,
      success: true,
    });
  } catch (error) {
    console.error('Enable sharing error:', error);
    return NextResponse.json(
      { error: 'Failed to enable sharing' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = getSupabaseRouteClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const reportId = params.id;

    // Disable sharing
    // TODO: Remove type assertion after generating real Supabase types
    const { error } = await supabase
      .rpc('disable_report_sharing' as any, { report_id: reportId } as any);

    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Disable sharing error:', error);
    return NextResponse.json(
      { error: 'Failed to disable sharing' },
      { status: 500 }
    );
  }
}
