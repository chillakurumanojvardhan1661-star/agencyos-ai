import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseRouteClient } from '@/lib/supabase/server';
import { getAuthUser } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
    try {
        const user = await getAuthUser();

        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const supabase = getSupabaseRouteClient();

        // Get agency ID for this user
        const { data: agencyData, error: agencyError } = await supabase
            .from('agencies')
            .select('id')
            .eq('owner_id', user.id as any) // Use any to bypass lint error
            .single();

        if (agencyError || !agencyData) {
            return NextResponse.json([]);
        }

        const { data: clients, error } = await (supabase.from('clients' as any) as any)
            .select('*')
            .eq('agency_id', agencyData.id);

        if (error) throw error;

        return NextResponse.json(clients);
    } catch (error) {
        console.error('Failed to fetch clients:', error);
        return NextResponse.json(
            { error: 'Internal Server Error' },
            { status: 500 }
        );
    }
}
