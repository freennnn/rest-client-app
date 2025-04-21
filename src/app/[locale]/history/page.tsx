import { Suspense, lazy } from 'react';

import { getTranslations, setRequestLocale } from 'next-intl/server';

const HistoryViewer = lazy(() => import('@/components/HistoryViewer'));

type ResolvedParams = {
  locale: string;
};

export default async function HistoryPage({
  params: paramsPromise,
}: {
  params: Promise<ResolvedParams>;
}) {
  const params = await paramsPromise;
  const locale = params.locale;

  setRequestLocale(locale);

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
