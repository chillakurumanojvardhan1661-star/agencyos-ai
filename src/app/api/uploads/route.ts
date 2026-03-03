import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseRouteClient } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
    try {
        const supabase = getSupabaseRouteClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const agencyResponse = await supabase.from('agencies').select('id').eq('owner_id', user.id).single();
        const agencyId = (agencyResponse.data as any)?.id;

        if (!agencyId) {
            return NextResponse.json([]);
        }

        const { data: uploads, error } = await supabase
            .from('uploads' as any)
            .select('*')
            .eq('agency_id', agencyId)
            .order('created_at', { ascending: false });

        if (error) throw error;

        return NextResponse.json(uploads);
    } catch (error) {
        console.error('Failed to fetch uploads:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
