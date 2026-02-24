import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseRouteClient } from '@/lib/supabase/server';


// Force dynamic rendering
export const dynamic = 'force-dynamic';
export async function GET(
  request: NextRequest,
  { params }: { params: { token: string } }
) {
  try {
    const supabase = getSupabaseRouteClient();
    const token = params.token;

    // Get report by share token (no auth required)
    const { data: report, error } = await supabase
      .from('reports')
      .select(`
        *,
        clients!inner(
          name,
          industry,
          agency_id,
          agencies!inner(
            name,
            subscriptions!inner(plan, status)
          )
        )
      `)
      .eq('share_token', token)
      .eq('is_public', true)
      .single();

    if (error || !report) {
      return NextResponse.json(
        { error: 'Report not found or not public' },
        { status: 404 }
      );
    }

    // Increment view count
    await supabase.rpc('increment_report_views' as any, { token } as any);

    // Type assertion for complex joined query
    // TODO: Remove after generating real Supabase types
    const reportData = report as any;
    const clientData = reportData.clients;
    const agencyData = clientData.agencies;
    const subscription = agencyData.subscriptions[0];
    const plan = subscription?.plan || 'starter';

    // Return sanitized data (hide internal info)
    return NextResponse.json({
      id: reportData.id,
      client_name: clientData.name,
      client_industry: clientData.industry,
      agency_name: agencyData.name,
      report_data: reportData.data,
      created_at: reportData.created_at,
      plan: plan,
      public_views: reportData.public_views + 1,
      share_token: token,
    });
  } catch (error) {
    console.error('Get public report error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch report' },
      { status: 500 }
    );
  }
}
