import { isAuthenticatedPath, signInPath } from '@/paths';
import type { MiddlewareFactory } from '@/utils/middleware/types';
import { type CookieOptions, createServerClient } from '@supabase/ssr';
import { type NextFetchEvent, type NextRequest, NextResponse } from 'next/server';

export const withSupabase: MiddlewareFactory = (next) => {
  return async (request: NextRequest, event: NextFetchEvent) => {
    const pathname = request.nextUrl.pathname;

    // 1. Call next() first (this will be the base handler from stackMiddlewares)
    // We get the base response object to potentially modify
    const responseFromNext = await next(request, event);
    if (!(responseFromNext instanceof NextResponse)) {
      // If the base handler fails, we probably can't do much, return a basic response.
      console.error('[Supabase Middleware] Base handler failed: Response is not an instance of NextResponse');
      return new NextResponse('Internal Server Error', { status: 500 });
    }
    const supabaseResponse = responseFromNext; // Start with the response from `next()`

    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return request.cookies.getAll();
          },
          // CHANGED from documentaion Supabase example: Modify the
          // 'supabaseResponse' object directly, instead of creating a new one
          setAll(cookiesToSet: { name: string; value: string; options: CookieOptions }[]) {
            try {
              // console.log('[Supabase setAll] Refresh detected. Setting cookies on response.');
              // Add the 'Set-Cookie' headers to the *existing* response object.
              cookiesToSet.forEach(({ name, value, options }) => {
                supabaseResponse.cookies.set(name, value, options);
              });
              // DO NOT recreate the response here.
            } catch (error) {
              console.error('[Supabase setAll] Error setting cookies:', error);
            }
          },
        },
      }
    );

    // Attempt to get user and refresh session if needed.
    // If refresh happens, the `setAll` above modifies `supabaseResponse`.
    const {
      data: { user },
    } = await supabase.auth.getUser();
    // console.log(`[Supabase Factory] User check complete. User ${user ? 'found' : 'not found'}.`);

    // Auth redirect logic (using original path from request)
    if (!user && isAuthenticatedPath(pathname)) {
      //   console.log('[Supabase Factory] Auth failed for protected path. Redirecting...');
      const url = request.nextUrl.clone();
      url.pathname = signInPath();
      return NextResponse.redirect(url); // Return NEW redirect response
    }
    // If refresh happened, it has Set-Cookie headers; otherwise, it's the base response from next()
    return supabaseResponse;
  };
};
