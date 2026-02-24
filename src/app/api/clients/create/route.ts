import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseRouteClient } from '@/lib/supabase/server';
import { checkClientLimit } from '@/lib/middleware/usage-limiter';
import { markOnboardingStep, ONBOARDING_STEPS } from '@/lib/onboarding/tracker';
import { z } from 'zod';


// Force dynamic rendering
export const dynamic = 'force-dynamic';
const createClientSchema = z.object({
  name: z.string().min(1),
  industry: z.string().optional(),
  website: z.string().url().optional(),
});

export async function POST(request: NextRequest) {
  try {
    const supabase = getSupabaseRouteClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get user's agency
    const { data: agency, error: agencyError } = await (supabase
      .from('agencies')
      .select('id')
      .eq('owner_id', user.id)
      .single() as any);

    if (agencyError || !agency) {
      return NextResponse.json({ error: 'Agency not found' }, { status: 404 });
    }

    // Check client limit
    const limitCheck = await checkClientLimit((agency as any).id);
    if (!limitCheck.allowed) {
      return NextResponse.json(
        {
          error: limitCheck.reason,
          current_usage: limitCheck.current_usage,
          limit: limitCheck.limit,
          plan: limitCheck.plan,
        },
        { status: 429 }
      );
    }

    const body = await request.json();
    const input = createClientSchema.parse(body);

    // Create client
    const { data: client, error } = await (supabase
      .from('clients')
      // @ts-ignore - Supabase generated types don't match runtime
      .insert({
        agency_id: agency.id,
        name: input.name,
        industry: input.industry,
        website: input.website,
      })
      .select()
      .single() as any);

    if (error) throw error;

    // Mark onboarding step as complete
    await markOnboardingStep(ONBOARDING_STEPS.ADD_CLIENT);

    return NextResponse.json({
      ...client,
      usage: {
        current: limitCheck.current_usage! + 1,
        limit: limitCheck.limit,
        plan: limitCheck.plan,
      },
    });
  } catch (error) {
    console.error('Client creation error:', error);
    return NextResponse.json(
      { error: 'Failed to create client' },
      { status: 500 }
    );
  }
}
