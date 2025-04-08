'use client';

import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import React from 'react';
import Home from '../../../page';

type Params = {
  method: string;
  encodedUrl: string;
  encodedBody: string;
};

export default function MethodWithUrlAndBodyPage({ 
  params 
}: { 
  params: Params | Promise<Params> 
}) {
  const router = useRouter();
  const unwrappedParams = React.use(params as Promise<Params>);
  const method = unwrappedParams.method;
  
  useEffect(() => {
    if (!['POST', 'PUT'].includes(method.toUpperCase())) {
      router.push('/');
    }
  }, [method, router]);

  return <Home />;
}