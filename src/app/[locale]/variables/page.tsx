'use client';

import { Suspense, lazy, useEffect, useState } from 'react';

const VariablesEditor = lazy(() => import('@/components/VariablesEditor'));

export default function VariablesPage() {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadVariables = () => {
      try {
        const savedVariables = localStorage.getItem('restClientVariables');
        if (savedVariables) {
          console.log('Loaded variables from local storage');
        }
      } catch (error) {
        console.error('Failed to load variables from localStorage:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadVariables();
  }, []);

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
