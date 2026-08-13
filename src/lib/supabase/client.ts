import { createBrowserClient } from '@supabase/ssr';

/**
 * Browser Supabase client (anon key only).
 * Used for client-side auth state and future public data reads.
 * Never pass SUPABASE_SERVICE_ROLE_KEY here.
 */
export function createSupabaseBrowserClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !key) {
    throw new Error(
      'Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY environment variables.'
    );
  }

  return createBrowserClient(url, key);
}
