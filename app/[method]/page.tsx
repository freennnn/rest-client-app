'use client';

import { useEffect } from 'react';
import React from 'react';

import { useRouter } from 'next/navigation';

import Home from '../page';

type Params = {
  method: string;
};

export default function MethodPage({ params }: { params: Params | Promise<Params> }) {
  const router = useRouter();
  const unwrappedParams = React.use(params as Promise<Params>);
  const method = unwrappedParams.method;

  useEffect(() => {
    if (!['GET', 'POST', 'PUT', 'DELETE'].includes(method.toUpperCase())) {
      router.push('/');
    }
  }, [method, router]);

  return <Home />;
}
