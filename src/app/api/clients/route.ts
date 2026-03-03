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

        const { data: agencyData } = await (supabase
            .from('agencies')
            .select('id')
            .eq('owner_id', user.id)
            .single() as any);

        if (!agencyData?.id) {
            return NextResponse.json([]);
        }

        const { data: clients, error } = await (supabase
            .from('clients')
            .select('*, content_generations(count)')
            .eq('agency_id', agencyData.id) as any);

        if (error) throw error;

        // Transform to match local UI expectations
        const transformedClients = (clients as any[] || []).map(client => ({
            ...client,
            context_count: client.content_generations?.[0]?.count || 0
        }));

        return NextResponse.json(transformedClients);
    } catch (error) {
        console.error('Failed to fetch clients:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
