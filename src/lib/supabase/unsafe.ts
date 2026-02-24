/**
 * UNSAFE SUPABASE QUERY HELPERS
 * 
 * ⚠️  WARNING: These helpers bypass TypeScript type checking ⚠️
 * 
 * These functions are TEMPORARY workarounds for using placeholder Supabase types.
 * They should be removed once real types are generated.
 * 
 * WHY THIS EXISTS:
 * - Placeholder Database types don't match actual query return types
 * - TypeScript infers `never` for complex queries with joins
 * - Scattered `as any` casts are hard to track and remove
 * 
 * USAGE:
 * Instead of:
 *   const { data } = await (supabase.from('table') as any).select('*');
 * 
 * Use:
 *   const { data } = await unsafeQuery(supabase.from('table').select('*'));
 * 
 * TODO: Remove this file after generating real Supabase types
 * Run: npm run gen:types
 */

/**
 * Bypass type checking for a Supabase query promise
 * 
 * @param promise - The Supabase query promise
 * @returns The same promise with type checking bypassed
 * 
 * @example
 * const { data, error } = await unsafeQuery(
 *   supabase.from('users').select('*').eq('id', userId)
 * );
 */
export async function unsafeQuery<T = any>(
  promise: Promise<{ data: any; error: any }>
): Promise<{ data: T | null; error: any | null }> {
  return promise as any;
}

/**
 * Bypass type checking for a Supabase query builder
 * 
 * @param builder - The Supabase query builder
 * @returns The same builder with type checking bypassed
 * 
 * @example
 * const { data, error } = await unsafeBuilder(supabase.from('users'))
 *   .insert({ name: 'John' })
 *   .select()
 *   .single();
 */
export function unsafeBuilder<T = any>(builder: any): any {
  return builder as any;
}

/**
 * Bypass type checking for RPC function calls
 * 
 * @param client - The Supabase client
 * @param functionName - The name of the RPC function
 * @param params - The parameters to pass to the function
 * @returns The RPC call result with type checking bypassed
 * 
 * @example
 * const { data, error } = await unsafeRpc(
 *   supabase,
 *   'get_user_stats',
 *   { user_id: '123' }
 * );
 */
export async function unsafeRpc<T = any>(
  client: any,
  functionName: string,
  params?: Record<string, any>
): Promise<{ data: T | null; error: any | null }> {
  return (client as any).rpc(functionName, params);
}

/**
 * Cast data to a specific type (use sparingly)
 * 
 * @param data - The data to cast
 * @returns The data cast to the specified type
 * 
 * @example
 * const user = unsafeCast<User>(data);
 */
export function unsafeCast<T>(data: any): T {
  return data as T;
}
