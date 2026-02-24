import { createServerComponentClient, createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
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
