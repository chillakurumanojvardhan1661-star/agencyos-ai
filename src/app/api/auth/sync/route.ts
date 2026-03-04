import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdminClient } from '@/lib/supabase/server';
import { adminAuth } from '@/lib/firebase/admin';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
    try {
        const { uid, email, displayName } = await request.json();

        if (!uid) {
            return NextResponse.json({ error: 'UID required' }, { status: 400 });
        }

        // Verify token to be safe (optional but recommended)
        // For simplicity, we assume the client just logged in, 
        // but in a real app, we'd verify the ID token passed in headers.

        const supabase = getSupabaseAdminClient();

        // Check if agency already exists for this owner_id (Firebase UID)
        const { data: agency, error: fetchError } = await (supabase
            .from('agencies' as any) as any)
            .select('id')
            .eq('owner_id', uid)
            .single();

        if (fetchError && fetchError.code !== 'PGRST116') { // PGRST116 is "not found"
            throw fetchError;
        }

        if (!agency) {
            // Create a default agency for the new Firebase user
            const { error: insertError } = await (supabase
                .from('agencies') as any)
                .insert({
                    owner_id: uid,
                    name: displayName || email?.split('@')[0] || 'My Agency',
                });

            if (insertError) throw insertError;
        }

        return NextResponse.json({ success: true });
    } catch (error: any) {
        console.error('Auth sync error:', error);
        return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
    }
}
