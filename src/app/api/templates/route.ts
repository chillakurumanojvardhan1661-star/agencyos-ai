import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseRouteClient } from '@/lib/supabase/server';
import { z } from 'zod';


// Force dynamic rendering
export const dynamic = 'force-dynamic';
const createTemplateSchema = z.object({
  title: z.string().min(1).max(100),
  description: z.string().max(500).optional(),
  category: z.enum(['ad_copy', 'reel_script', 'social_post', 'email', 'landing_page']),
  industry: z.enum(['fitness', 'ecommerce', 'real_estate', 'coaching', 'local_business', 'saas', 'healthcare', 'education', 'general']).optional(),
  template_json: z.object({}).passthrough(),
  is_public: z.boolean().default(false),
});

export async function GET(request: NextRequest) {
  try {
    const supabase = getSupabaseRouteClient();
    const { searchParams } = new URL(request.url);
    
    const category = searchParams.get('category');
    const industry = searchParams.get('industry');
    const isPublic = searchParams.get('public');

    let query = supabase
      .from('templates')
      .select('*')
      .order('usage_count', { ascending: false });

    // Apply filters
    if (category) {
      query = query.eq('category', category);
    }
    if (industry) {
      query = query.eq('industry', industry);
    }
    if (isPublic === 'true') {
      query = query.eq('is_public', true);
    }

    const { data: templates, error } = await query;

    if (error) throw error;

    return NextResponse.json(templates || []);
  } catch (error) {
    console.error('Get templates error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch templates' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = getSupabaseRouteClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get user's agency
    const { data: agency, error: agencyError } = await supabase
      .from('agencies')
      .select('id')
      .eq('owner_id', user.id)
      .single();

    if (agencyError || !agency) {
      return NextResponse.json({ error: 'Agency not found' }, { status: 404 });
    }

    // Type assertion for agency query
    // TODO: Remove after generating real Supabase types
    const agencyData = agency as any;

    const body = await request.json();
    const input = createTemplateSchema.parse(body);

    // Create template
    // TODO: Remove type assertion after generating real Supabase types
    const { data: template, error } = await (supabase
      .from('templates') as any)
      .insert({
        ...input,
        created_by_agency_id: agencyData.id,
      })
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json(template);
  } catch (error) {
    console.error('Create template error:', error);
    return NextResponse.json(
      { error: 'Failed to create template' },
      { status: 500 }
    );
  }
}
