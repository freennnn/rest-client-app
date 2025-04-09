import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

// createServerClient recreates for every route, because for every request to our server
// we need cookies from the request to be checked(fetch()) against the supabese
export async function createClient() {
  const cookieStore = await cookies();
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      // supabase needs cookies methods as arguments cause @supabase/ssr client
      // is platfrom (in our case Next.js) agnostic
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) => {
              cookieStore.set(name, value, options);
            });
          } catch (error) {
            // 'setAll' was called from a Server Component instead of Server Action
            // hence no cookies access.
            // according to supabase docs we refresh user session in middleware (on a server), we do it on a client too
          }
        },
      },
    }
  );
}
