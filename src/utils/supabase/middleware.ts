import { isAuthenticatedPath, signInPath } from '@/paths';
import type { MiddlewareFactory } from '@/utils/middleware/types';
import { type CookieOptions, createServerClient } from '@supabase/ssr';
import { type NextFetchEvent, type NextRequest, NextResponse } from 'next/server';

export const withSupabase: MiddlewareFactory = (next) => {
  return async (request: NextRequest, event: NextFetchEvent) => {
    const pathname = request.nextUrl.pathname;

    const responseFromNext = await next(request, event);
    if (!(responseFromNext instanceof NextResponse)) {
      console.error(
        '[Supabase Middleware] Base handler failed: Response is not an instance of NextResponse'
      );
      return new NextResponse('Internal Server Error', { status: 500 });
    }
    const supabaseResponse = responseFromNext;

    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return request.cookies.getAll();
          },

          setAll(cookiesToSet: { name: string; value: string; options: CookieOptions }[]) {
            try {
              cookiesToSet.forEach(({ name, value, options }) => {
                supabaseResponse.cookies.set(name, value, options);
              });
            } catch (error) {
              console.error('[Supabase setAll] Error setting cookies:', error);
            }
          },
        },
      }
    );

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user && isAuthenticatedPath(pathname)) {
      const url = request.nextUrl.clone();
      url.pathname = signInPath();
      return NextResponse.redirect(url);
    }

    return supabaseResponse;
  };
};
