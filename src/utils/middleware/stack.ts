import { type NextMiddleware, NextResponse } from 'next/server';

import { MiddlewareFactory } from './types';

// auth(intl(() => NextResponse.next()))(request)
// returns final composed NextMiddleware function
export function stackMiddlewares(factories: MiddlewareFactory[], index = 0): NextMiddleware {
  const current = factories[index];
  if (current) {
    const next = stackMiddlewares(factories, index + 1);
    return current(next);
  }
  // base case: no more middlewares to run
  return () => NextResponse.next();
}
