import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseRouteClient } from '@/lib/supabase/server';
import { generateReportHTML } from '@/lib/pdf/generator';
import { checkUsageLimit } from '@/lib/middleware/usage-limiter';
import { markOnboardingStep, setFirstReportGenerated, ONBOARDING_STEPS } from '@/lib/onboarding/tracker';
import { trackTrialActivated } from '@/lib/analytics/tracker';
import { getAuthUser } from '@/lib/auth';


// Force dynamic rendering
export const dynamic = 'force-dynamic';
export async function POST(request: NextRequest) {
  try {
    const user = await getAuthUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const supabase = getSupabaseRouteClient();
    const body = await request.json();
    const { upload_id } = body;

    // Get upload with all related data
    const { data: upload, error: uploadError } = await supabase
      .from('ad_performance_uploads')
      .select(`
        *,
        clients!inner(
          *,
          agency_id,
          agencies!inner(*)
        )
      `)
      .eq('id', upload_id)
      .single();

    if (uploadError || !upload) {
      return NextResponse.json({ error: 'Upload not found' }, { status: 404 });
    }

    // Type assertion for complex joined query
    // TODO: Remove after generating real Supabase types
    const uploadData = upload as any;
    const client = uploadData.clients;
    const agency = client.agencies;

    // Check usage limits
    const usageCheck = await checkUsageLimit(agency.id, 'report_generation');
    if (!usageCheck.allowed) {
      return NextResponse.json(
        {
          code: usageCheck.code,
          error: usageCheck.reason,
          action_type: usageCheck.action_type,
          current_usage: usageCheck.current_usage,
          limit: usageCheck.limit,
          plan: usageCheck.plan,
          recommended_plan: usageCheck.recommended_plan,
        },
        { status: 429 }
      );
    }

    // Get brand kit
    const { data: brandKit } = await supabase
      .from('brand_kits')
      .select('*')
      .eq('client_id', client.id)
      .single();

    // Get report preferences
    const { data: reportPreferences } = await supabase
      .from('report_preferences')
      .select('*')
      .eq('agency_id', agency.id)
      .single();

    // Get subscription plan
    const { data: subscription } = await supabase
      .from('subscriptions')
      .select('plan')
      .eq('agency_id', agency.id)
      .eq('status', 'active')
      .single();

    // Type assertion for subscription query
    // TODO: Remove after generating real Supabase types
    const subscriptionData = subscription as any;
    const subscriptionPlan = subscriptionData?.plan || 'starter';

    // Ensure analysis exists
    if (!uploadData.analysis) {
      return NextResponse.json(
        { error: 'Analysis not found. Please analyze the upload first.' },
        { status: 400 }
      );
    }

    // Generate HTML report
    const html = generateReportHTML({
      client,
      brand_kit: brandKit || undefined,
      agency,
      report_preferences: reportPreferences || undefined,
      performance_data: uploadData.data,
      analysis: uploadData.analysis,
      period: {
        start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
        end: new Date().toISOString(),
      },
      subscription_plan: subscriptionPlan as any, // NEW: Pass plan for watermark and premium insights
    });

    // In production, you would:
    // 1. Generate PDF using Puppeteer
    // 2. Upload to Supabase Storage
    // 3. Save report record to database
    // 4. Return PDF URL

    // For now, return HTML for preview
    // TODO: Remove type assertion after generating real Supabase types
    const { data: report, error: reportError } = await (supabase.from('reports') as any)
      .insert({
        client_id: client.id,
        user_id: user.id,
        upload_id: uploadData.id,
        report_type: 'performance',
        data: {
          html,
          generated_at: new Date().toISOString(),
        },
      })
      .select()
      .single();

    if (reportError) throw reportError;

    // Check if this is the first report for this user
    const { count: reportCount } = await supabase
      .from('reports')
      .select('id', { count: 'exact', head: true })
      .eq('user_id', user.id);

    const isFirstReport = reportCount === 1; // Just created first report

    // Mark onboarding step as complete
    await markOnboardingStep(ONBOARDING_STEPS.UPLOAD_CSV_REPORT);

    // Track first report generation timestamp
    await setFirstReportGenerated();

    // Track trial activation (first report generated)
    if (isFirstReport) {
      await trackTrialActivated(agency.id, user.id);
    }

    return NextResponse.json({
      ...report,
      html, // Include HTML for preview
      is_first_report: isFirstReport, // Flag for celebration modal
      usage: {
        current: usageCheck.current_usage! + 1,
        limit: usageCheck.limit,
        plan: usageCheck.plan,
      },
    });
  } catch (error) {
    console.error('Report generation error:', error);
    return NextResponse.json(
      { error: 'Failed to generate report' },
      { status: 500 }
    );
  }
}
