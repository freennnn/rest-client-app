'use client';

import { Suspense, lazy } from 'react';

const HistoryViewer = lazy(() => import('@/components/HistoryViewer'));

export default function HistoryPage() {
  return (
    <div className='min-h-screen p-4 max-w-5xl mx-auto'>
      <header className='mb-6'>
        <h1 className='text-2xl font-bold mb-2'>Request History</h1>
        <p className='text-gray-600 dark:text-gray-400'>
          View your previous API requests and easily restore them
        </p>
      </header>

      <Suspense fallback={<div>Loading request history...</div>}>
        <HistoryViewer />
      </Suspense>
    </div>
  );
}
