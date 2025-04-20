import { type NextMiddleware } from 'next/server';

// A factory function that takes the next middleware in the chain
// and returns a new middleware function.

export type MiddlewareFactory = (next: NextMiddleware) => NextMiddleware;
