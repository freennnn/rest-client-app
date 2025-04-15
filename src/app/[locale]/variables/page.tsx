'use client';

import { Suspense, lazy, useEffect, useState } from 'react';

import { createClient } from '@/utils/supabase/client';

const VariablesEditor = lazy(() => import('@/components/VariablesEditor'));

export default function VariablesPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const checkAuthAndLoadVariables = async () => {
      try {
        const supabase = createClient();
        const { data } = await supabase.auth.getSession();
        const isSignedIn = !!data.session;
        setIsAuthenticated(isSignedIn);

        if (isSignedIn) {
          try {
            const savedVariables = localStorage.getItem('restClientVariables');
            if (savedVariables) {
              console.log('Loaded variables from local storage after authentication');
            }
          } catch (error) {
            console.error('Failed to load variables from localStorage:', error);
          }
        }

        setIsLoading(false);
      } catch (error) {
        console.error('Error checking authentication:', error);
        setIsLoading(false);
      }
    };

    checkAuthAndLoadVariables();
  }, []);

  if (!isLoading && !isAuthenticated) {
    return (
      <div className='min-h-screen p-4 flex justify-center items-center'>
        <p>Please sign in to access variables.</p>
      </div>
    );
  }

  return (
    <div className='min-h-screen p-4 max-w-5xl mx-auto'>
      <header className='mb-6'>
        <h1 className='text-2xl font-bold mb-2'>REST Client Variables</h1>
        <p className='text-gray-600 dark:text-gray-400'>
          Create variables to use in your requests with the syntax {'{{'}
          <span>variableName</span>
          {'}}'}
        </p>
      </header>

      {isLoading ? (
        <div className='flex justify-center items-center h-64'>
          <div className='animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-gray-900 dark:border-white'></div>
        </div>
      ) : (
        <Suspense fallback={<div>Loading variables editor...</div>}>
          <VariablesEditor />
        </Suspense>
      )}
    </div>
  );
}
