/**
 * STRICT SECURITY WARNING:
 * -------------------------------------------------------------
 * This file uses the SUPABASE_SERVICE_ROLE_KEY and has super-admin privileges.
 * It MUST NEVER be imported or used in React Client Components ('use client'),
 * client-side bundles, or exposed through any public API responses.
 *
 * It is solely for trusted Next.js server route handlers.
 * -------------------------------------------------------------
 */

import { createClient as createSupabaseClient } from '@supabase/supabase-js';

export function createAdminClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

  if (!supabaseUrl || !serviceRoleKey) {
    return null;
  }

  return createSupabaseClient(supabaseUrl, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}
