import { createServerComponentClient, createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { createClient as createSupabaseClient } from '@supabase/supabase-js';
import { cookies } from 'next/headers';
import { Database } from '@/types/supabase';

/**
 * Create a typed Supabase client for Server Components
 */
export const createClient = () => createServerComponentClient<Database>({ cookies });

/**
 * Create a typed Supabase client for API Route Handlers
 * Use this in all /app/api routes
 */
export const getSupabaseRouteClient = () => createRouteHandlerClient<Database>({ cookies });

/**
 * Create a Supabase Admin client using the service role key.
 * USE WITH CAUTION: This bypasses RLS.
 */
export const getSupabaseAdminClient = () => {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';
    return createSupabaseClient<Database>(supabaseUrl, supabaseServiceKey);
};
