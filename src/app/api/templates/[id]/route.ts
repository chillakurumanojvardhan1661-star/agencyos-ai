import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseRouteClient } from '@/lib/supabase/server';
import { z } from 'zod';


// Force dynamic rendering
export const dynamic = 'force-dynamic';
const updateTemplateSchema = z.object({
  title: z.string().min(1).max(100).optional(),
  description: z.string().max(500).optional(),
  category: z.enum(['ad_copy', 'reel_script', 'social_post', 'email', 'landing_page']).optional(),
  industry: z.enum(['fitness', 'ecommerce', 'real_estate', 'coaching', 'local_business', 'saas', 'healthcare', 'education', 'general']).optional(),
  template_json: z.object({}).passthrough().optional(),
  is_public: z.boolean().optional(),
});

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = getSupabaseRouteClient();
    const templateId = params.id;

    const { data: template, error } = await supabase
      .from('templates')
      .select('*')
      .eq('id', templateId)
      .single();

    if (error) throw error;

    return NextResponse.json(template);
  } catch (error) {
    console.error('Get template error:', error);
    return NextResponse.json(
      { error: 'Template not found' },
      { status: 404 }
    );
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = getSupabaseRouteClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const templateId = params.id;
    const body = await request.json();
    const input = updateTemplateSchema.parse(body);

    // Update template (RLS will ensure ownership)
    // TODO: Remove type assertion after generating real Supabase types
    const { data: template, error } = await (supabase
      .from('templates') as any)
      .update(input)
      .eq('id', templateId)
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json(template);
  } catch (error) {
    console.error('Update template error:', error);
    return NextResponse.json(
      { error: 'Failed to update template' },
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

    const templateId = params.id;

    // Delete template (RLS will ensure ownership)
    const { error } = await supabase
      .from('templates')
      .delete()
      .eq('id', templateId);

    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Delete template error:', error);
    return NextResponse.json(
      { error: 'Failed to delete template' },
      { status: 500 }
    );
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = getSupabaseRouteClient();
    const templateId = params.id;

    // Increment usage count
    // TODO: Remove type assertion after generating real Supabase types
    const { data: template, error } = await supabase
      .rpc('increment_template_usage' as any, { template_id: templateId } as any);

    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Increment usage error:', error);
    return NextResponse.json(
      { error: 'Failed to increment usage' },
      { status: 500 }
    );
  }
}
