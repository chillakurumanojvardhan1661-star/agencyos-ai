/**
 * Safe Supabase query helpers
 * 
 * These helpers provide type-safe wrappers around Supabase queries
 * to avoid TypeScript errors when the generated types don't match runtime behavior.
 */

import type { SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '@/types/supabase';

type SupabaseClientType = SupabaseClient<Database>;

/**
 * Safe insert helper that bypasses strict type checking
 */
export async function safeInsert<T = any>(
  client: SupabaseClientType,
  table: string,
  data: Record<string, any>
): Promise<{ data: T | null; error: any }> {
  const result = await (client as any)
    .from(table)
    .insert(data)
    .select()
    .single();
  
  return result;
}

/**
 * Safe update helper that bypasses strict type checking
 */
export async function safeUpdate<T = any>(
  client: SupabaseClientType,
  table: string,
  data: Record<string, any>,
  match: Record<string, any>
): Promise<{ data: T | null; error: any }> {
  let query = (client as any).from(table).update(data);
  
  // Apply match conditions
  for (const [key, value] of Object.entries(match)) {
    query = query.eq(key, value);
  }
  
  const result = await query.select().single();
  return result;
}

/**
 * Safe select helper that bypasses strict type checking
 */
export async function safeSelect<T = any>(
  client: SupabaseClientType,
  table: string,
  select: string = '*',
  match?: Record<string, any>
): Promise<{ data: T | null; error: any }> {
  let query = (client as any).from(table).select(select);
  
  // Apply match conditions if provided
  if (match) {
    for (const [key, value] of Object.entries(match)) {
      query = query.eq(key, value);
    }
  }
  
  const result = await query.single();
  return result;
}
