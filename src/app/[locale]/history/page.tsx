import { Suspense, lazy } from 'react';

import { getTranslations, setRequestLocale } from 'next-intl/server';

const HistoryViewer = lazy(() => import('@/components/HistoryViewer'));

// Define resolved params structure
type ResolvedParams = {
  locale: string;
};

// Make the component async and accept params as Promise
export default async function HistoryPage({
  params: paramsPromise,
}: {
  params: Promise<ResolvedParams>;
}) {
  // Await the promise
  const params = await paramsPromise;
  const locale = params.locale; // Get locale from resolved params

  // Set locale context
  setRequestLocale(locale);

  // Get translations for server-rendered text
  const t = await getTranslations('HistoryPage');

  return (
    <div className='min-h-screen p-4 max-w-5xl mx-auto'>
      <header className='mb-6'>
        <h1 className='text-2xl font-bold mb-2'>{t('title')}</h1>
        <p className='text-gray-600 dark:text-gray-400'>{t('description')}</p>
      </header>

      <Suspense fallback={<div>{t('loadingFallback')}</div>}>
        <HistoryViewer />
      </Suspense>
    </div>
  );
}
