import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseRouteClient } from '@/lib/supabase/server';
import { markOnboardingStep, ONBOARDING_STEPS } from '@/lib/onboarding/tracker';
import { z } from 'zod';


// Force dynamic rendering
export const dynamic = 'force-dynamic';
const brandKitSchema = z.object({
  logo_url: z.string().url().optional(),
  primary_color: z.string().optional(),
  secondary_color: z.string().optional(),
  tone: z.enum(['professional', 'casual', 'friendly', 'authoritative', 'playful', 'urgent']).optional(),
  offer: z.string().optional(),
  target_audience: z.string().optional(),
});

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

    const clientId = params.id;
    const body = await request.json();
    const input = brandKitSchema.parse(body);

    // Verify client belongs to user's agency
    const { data: client, error: clientError } = await supabase
      .from('clients')
      .select('agency_id, agencies!inner(owner_id)')
      .eq('id', clientId)
      .single();

    if (clientError || !client) {
      return NextResponse.json({ error: 'Client not found' }, { status: 404 });
    }

    // Check if brand kit exists
    const { data: existingKit } = await supabase
      .from('brand_kits')
      .select('id')
      .eq('client_id', clientId)
      .single();

    let brandKit: any;

    if (existingKit) {
      // Update existing brand kit
      const { data, error } = await (supabase.from('brand_kits') as any)
        .update(input)
        .eq('id', (existingKit as any).id)
        .select()
        .single();

      if (error) throw error;
      brandKit = data;
    } else {
      // Create new brand kit
      const { data, error } = await (supabase.from('brand_kits') as any)
        .insert({
          client_id: clientId,
          ...input,
        })
        .select()
        .single();

      if (error) throw error;
      brandKit = data;
    }

    // Mark onboarding step as complete
    await markOnboardingStep(ONBOARDING_STEPS.UPLOAD_BRAND_KIT);

    return NextResponse.json(brandKit);
  } catch (error) {
    console.error('Brand kit error:', error);
    return NextResponse.json(
      { error: 'Failed to save brand kit' },
      { status: 500 }
    );
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = getSupabaseRouteClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const clientId = params.id;

    const { data: brandKit, error } = await supabase
      .from('brand_kits')
      .select('*')
      .eq('client_id', clientId)
      .single();

    if (error && error.code !== 'PGRST116') {
      throw error;
    }

    return NextResponse.json(brandKit || null);
  } catch (error) {
    console.error('Get brand kit error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch brand kit' },
      { status: 500 }
    );
  }
}
