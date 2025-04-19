import { routing } from '@/i18n/routing';
import type { MiddlewareFactory } from '@/utils/middleware/types';
import createMiddleware from 'next-intl/middleware';
import { type NextFetchEvent, type NextRequest, NextResponse } from 'next/server';

// Additional paths to ignore besides the ones handled by general
// middleware matching ( which were needed for Supabase)
const INTL_IGNORE_PATHS = ['/api/'];

const intlMiddleware = createMiddleware(routing);

// Intl Middleware Factory (Acts BEFORE next, merges AFTER)

export const withIntl: MiddlewareFactory = (next) => {
  return async (request: NextRequest, event: NextFetchEvent) => {
    const pathname = request.nextUrl.pathname;

    // If the pathname starts with /api, skip the middleware
    if (INTL_IGNORE_PATHS.some((path) => pathname.startsWith(path))) {
      return next(request, event);
    }

    // Log request details BEFORE calling intlMiddleware
    // console.log(`[withIntl] Pathname: ${pathname}`);
    // console.log(`[withIntl] Accept-Language header: ${request.headers.get('accept-language')}`);
    // console.log(`[withIntl] NEXT_LOCALE cookie: ${request.cookies.get('NEXT_LOCALE')?.value}`);

    // 1. Run standard next-intl middleware logic
    const intlResponse = intlMiddleware(request);

    // Log the locale detected by intlMiddleware (if available in headers/response)
    // Note: The actual negotiated locale used internally might not be directly exposed here easily.
    // We rely on the getRequestConfig logs for that.
    // console.log(`[withIntl] intlResponse status: ${intlResponse.status}`);
    // console.log(
    //   `[withIntl] intlResponse rewrite header: ${intlResponse.headers.get('x-middleware-rewrite')}`
    // );
    // console.log(`[withIntl] intlResponse location header: ${intlResponse.headers.get('location')}`);

    // 2. Check for next-intl redirect (then return immediately, no need
    //   to run the rest of the middleware stack and proceed with the request,
    //   a new one will be scheduled)
    const isIntlRedirect = intlResponse.status === 307 || intlResponse.status === 308;
    if (isIntlRedirect) {
      return intlResponse;
    }
    // 3. Call next() (this will be supabaseMiddleware in our final chain)
    const responseFromNext = await next(request, event);
    if (!(responseFromNext instanceof NextResponse)) {
      // In our case, we're using stackMiddlewares which has a base case that
      // returns () => NextResponse.next(), so we should always get a NextResponse
      console.log(
        'No response from next middleware, fallback to default NextResponse.next() or next-intl response in our case'
      );
      return intlResponse;
    }
    // console.log('[Intl Factory] Received response from next (Supabase)');
    // 4. Merge necessary headers from intlResponse onto response from next()
    // Most importantly, the rewrite header if intl decided to rewrite
    // (NextResponse.rewrite instead of NextResponse.redirect)
    const rewriteHeader = intlResponse.headers.get('x-middleware-rewrite');
    if (rewriteHeader) {
      //   console.log(`[Intl Factory] Merging rewrite header: ${rewriteHeader}`);
      responseFromNext.headers.set('x-middleware-rewrite', rewriteHeader);
    }
    // Optionally merge locale cookie from intlResponse to Supabase response
    const localeCookie = intlResponse.cookies.get('NEXT_LOCALE');
    if (localeCookie && !responseFromNext.cookies.has(localeCookie.name)) {
      // console.log(`[Intl Factory] Merging locale cookie: ${localeCookie.name}`);
      responseFromNext.cookies.set(localeCookie);
    }
    // 5. Return the final response received from Supabase, now potentially merged with Intl headers
    return responseFromNext;
  };
};
