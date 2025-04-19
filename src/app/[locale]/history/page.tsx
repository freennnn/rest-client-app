'use client';

import { Suspense, lazy, useEffect, useState } from 'react';

import { createClient } from '@/utils/supabase/client';

const HistoryViewer = lazy(() => import('@/components/HistoryViewer'));

export default function HistoryPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const checkAuthStatus = async () => {
      try {
        const supabase = createClient();
        const { data } = await supabase.auth.getSession();
        const isSignedIn = !!data.session;
        setIsAuthenticated(isSignedIn);
        setIsLoading(false);
      } catch (error) {
        console.error('Error checking authentication:', error);
        setIsLoading(false);
      }
    };

    checkAuthStatus();
  }, []);

  if (!isLoading && !isAuthenticated) {
    return (
      <div className='min-h-screen p-4 flex justify-center items-center'>
        <p>Please sign in to access history.</p>
      </div>
    );
  }

  return (
    <div className='min-h-screen p-4 max-w-5xl mx-auto'>
      <header className='mb-6'>
        <h1 className='text-2xl font-bold mb-2'>Request History</h1>
        <p className='text-gray-600 dark:text-gray-400'>
          View your previous API requests and easily restore them
        </p>
      </header>

      {isLoading ? (
        <div className='flex justify-center items-center h-64'>
          <div className='animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-gray-900 dark:border-white'></div>
        </div>
      ) : (
        <Suspense fallback={<div>Loading request history...</div>}>
          <HistoryViewer />
        </Suspense>
      )}
    </div>
  );
}
