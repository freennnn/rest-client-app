'use client';

import { Suspense, lazy, useEffect, useState } from 'react';

import { createClient } from '@/utils/supabase/client';
import { useTranslations } from 'next-intl';
import { toast } from 'sonner';

const VariablesEditor = lazy(() => import('@/components/VariablesEditor'));

export default function VariablesPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const t = useTranslations('VariablesPage');
  const tNotify = useTranslations('Notifications');

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
            }
          } catch {
            toast.error(tNotify('loadVariablesError'));
          }
        }

        setIsLoading(false);
      } catch {
        toast.error(tNotify('authCheckError'));
        setIsLoading(false);
      }
    };

    checkAuthAndLoadVariables();
  }, [tNotify]);

  if (!isLoading && !isAuthenticated) {
    return (
      <div className='min-h-screen p-4 flex justify-center items-center'>
        <p>{t('unauthenticatedMessage')}</p>
      </div>
    );
  }

  return (
    <div className='min-h-screen p-4 max-w-5xl mx-auto'>
      <header className='mb-6'>
        <h1 className='text-2xl font-bold mb-2'>{t('title')}</h1>
        <p className='text-gray-600 dark:text-gray-400'>{t('description')}</p>
      </header>

      {isLoading ? (
        <div className='flex justify-center items-center h-64'>
          <div className='animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-gray-900 dark:border-white'></div>
        </div>
      ) : (
        <Suspense fallback={<div>{t('loadingFallback')}</div>}>
          <VariablesEditor />
        </Suspense>
      )}
    </div>
  );
}
