import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseRouteClient } from '@/lib/supabase/server';
import { generateContent } from '@/lib/ai/generator';
import { checkUsageLimit } from '@/lib/middleware/usage-limiter';
import { checkUsageWarning } from '@/lib/middleware/plan-gating';
import { markOnboardingStep, setFirstContentGenerated, ONBOARDING_STEPS } from '@/lib/onboarding/tracker';
import { z } from 'zod';


// Force dynamic rendering
export const dynamic = 'force-dynamic';
const generateSchema = z.object({
  client_id: z.string().uuid(),
  platform: z.enum(['meta', 'google', 'linkedin']),
  objective: z.enum(['leads', 'sales', 'awareness']),
  tone: z.enum(['professional', 'casual', 'friendly', 'authoritative', 'playful']),
  offer: z.string().min(1),
  target_audience: z.string().optional(),
  brand_colors: z.string().optional(),
});

export async function POST(request: NextRequest) {
  try {
    const supabase = getSupabaseRouteClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const input = generateSchema.parse(body);

    // Get client and agency info
    const { data: client, error: clientError } = await supabase
      .from('clients')
      .select('agency_id, industry')
      .eq('id', input.client_id)
      .single();

    if (clientError || !client) {
      return NextResponse.json({ error: 'Client not found' }, { status: 404 });
    }

    // Check usage limits
    const usageCheck = await checkUsageLimit((client as any).agency_id, 'content_generation');
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

    // Get client context for AI memory
    const { data: clientContext } = await supabase
      .from('client_contexts')
      .select('*')
      .eq('client_id', input.client_id)
      .single();

    // Generate content using AI with context
    const content = await generateContent(
      {
        ...input,
        client_context: clientContext || undefined,
      },
      {
        agency_id: (client as any).agency_id,
        user_id: user.id,
      }
    );

    // Save to database
    const { data, error } = await (supabase.from('content_generations') as any)
      .insert({
        client_id: input.client_id,
        user_id: user.id,
        platform: input.platform,
        objective: input.objective,
        tone: input.tone,
        offer: input.offer,
        ad_copies: content.ad_copies,
        reel_scripts: content.reel_scripts,
        content_calendar: content.content_calendar,
      })
      .select()
      .single();

    if (error) throw error;

    // Check if this is the first content for this user
    const { count: contentCount } = await supabase
      .from('content_generations')
      .select('id', { count: 'exact', head: true })
      .eq('user_id', user.id);

    const isFirstContent = contentCount === 1; // Just created first content

    // Mark onboarding step as complete
    await markOnboardingStep(ONBOARDING_STEPS.GENERATE_CONTENT);
    
    // Track first content generation timestamp
    await setFirstContentGenerated();

    // Check usage warning (80% threshold)
    const usageWarning = await checkUsageWarning((client as any).agency_id, 'content_generation');

    return NextResponse.json({
      ...data,
      is_first_content: isFirstContent, // Flag for celebration modal
      usage: {
        current: usageCheck.current_usage! + 1,
        limit: usageCheck.limit,
        plan: usageCheck.plan,
      },
      usage_warning: usageWarning.should_warn ? usageWarning : undefined, // NEW: Usage warning for upgrade modal
    });
  } catch (error) {
    console.error('Content generation error:', error);
    return NextResponse.json(
      { error: 'Failed to generate content' },
      { status: 500 }
    );
  }
}
