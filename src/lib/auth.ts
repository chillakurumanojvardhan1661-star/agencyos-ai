import { cookies } from 'next/headers';
import { getSupabaseRouteClient } from '@/lib/supabase/server';
import { adminAuth } from '@/lib/firebase/admin';

export interface AuthUser {
    id: string;
    email?: string;
    provider: 'firebase' | 'supabase';
}

/**
 * Consolidates user authentication from both Firebase and Supabase.
 * Use this in Server Components and API Routes.
 */
export async function getAuthUser(): Promise<AuthUser | null> {
    const cookieStore = cookies();
    const firebaseToken = cookieStore.get('firebase-token')?.value;

    // 1. Check Firebase (highest priority for new flow)
    if (firebaseToken) {
        try {
            const decodedToken = await adminAuth.verifyIdToken(firebaseToken);
            if (decodedToken) {
                return {
                    id: decodedToken.uid,
                    email: decodedToken.email,
                    provider: 'firebase',
                };
            }
        } catch (error) {
            // Token invalid or expired, continue to fallback
        }
    }

    // 2. Fallback to Supabase
    const supabase = getSupabaseRouteClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (user) {
        return {
            id: user.id,
            email: user.email,
            provider: 'supabase',
        };
    }

    return null;
}
