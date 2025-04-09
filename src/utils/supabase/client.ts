import { createBrowserClient } from '@supabase/ssr';

// createBrowserClient uses singleton pattern, so createClient() doesn't create a new instance
export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}
