import { withIntl } from '@/i18n/middleware';
import { stackMiddlewares } from '@/utils/middleware/stack';
import { withSupabase } from '@/utils/supabase/middleware';

const middlewares = [
  withIntl, // Intl runs first (checks redirects, calls next->Supabase, merges headers after)
  withSupabase, // Supabase runs second (calls next->Base, checks auth, modifies response)
];

export const middleware = stackMiddlewares(middlewares);

// This should be the UNION of paths needed by ANY middleware,excluding only
// things NO middleware should touch. Includes pathes like /api cause Supabase
// needs to run there, even if Intl doesn't (and ignores it manually in its middleware)
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * // All page routes (/, /about, etc.)
     * // API routes (/api/*)
     * // Dynamic routes (/posts/[id])
     * // But NOT on: Static assets, Image files, Next.js internal files
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
