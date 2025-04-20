import { routing } from '@/i18n/routing';
import type { MiddlewareFactory } from '@/utils/middleware/types';
import createMiddleware from 'next-intl/middleware';
import { type NextFetchEvent, type NextRequest, NextResponse } from 'next/server';

const INTL_IGNORE_PATHS = ['/api/'];

const intlMiddleware = createMiddleware(routing);

export const withIntl: MiddlewareFactory = (next) => {
  return async (request: NextRequest, event: NextFetchEvent) => {
    const pathname = request.nextUrl.pathname;

    if (INTL_IGNORE_PATHS.some((path) => pathname.startsWith(path))) {
      return next(request, event);
    }

    const intlResponse = intlMiddleware(request);

    const isIntlRedirect = intlResponse.status === 307 || intlResponse.status === 308;
    if (isIntlRedirect) {
      return intlResponse;
    }
    const responseFromNext = await next(request, event);
    if (!(responseFromNext instanceof NextResponse)) {
      console.log(
        'No response from next middleware, fallback to default NextResponse.next() or next-intl response in our case'
      );
      return intlResponse;
    }
    const rewriteHeader = intlResponse.headers.get('x-middleware-rewrite');
    if (rewriteHeader) {
      responseFromNext.headers.set('x-middleware-rewrite', rewriteHeader);
    }
    const localeCookie = intlResponse.cookies.get('NEXT_LOCALE');
    if (localeCookie && !responseFromNext.cookies.has(localeCookie.name)) {
      responseFromNext.cookies.set(localeCookie);
    }
    return responseFromNext;
  };
};
