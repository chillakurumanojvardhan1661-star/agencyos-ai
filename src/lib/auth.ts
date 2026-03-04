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

    // 1. Try Firebase Auth first
    if (firebaseToken && adminAuth) {
        try {
            const decodedToken = await adminAuth.verifyIdToken(firebaseToken);
            if (decodedToken) {
                return {
                    id: decodedToken.uid,
                    email: decodedToken.email || '',
                    provider: 'firebase', // Retaining provider for type correctness
                };
            }
        } catch (error) {
            console.error('Firebase token verification failed:', error);
            // Fall through to Supabase if token is invalid
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
