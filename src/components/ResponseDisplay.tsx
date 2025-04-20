'use client';

// Ensure client component
import React from 'react';

// Import useTranslations
import { useTranslations } from 'next-intl';

interface ResponseDisplayProps {
  responseData: {
    status: number;
    statusText: string;
    body: string;
    duration?: number; // Changed time to duration to match sendRequest return
    size?: number; // Added size
  } | null;
  error: string | null; // Although we pass null now, keep prop for flexibility
}

export default function ResponseDisplay({ responseData, error }: ResponseDisplayProps) {
  // Initialize translation function
  const t = useTranslations('ResponseDisplay');

  return (
    <div className='border rounded-md p-4 mt-6'>
      {/* Use translation key */}
      <h2 className='text-xl font-bold mb-3'>{t('title')}</h2>

      {/* Keep error display logic, even if currently unused for network errors */}
      {error && (
        <div className='bg-red-100 border-red-400 border p-3 rounded mb-4 text-red-700 text-sm'>
          {error}
        </div>
      )}

      {responseData ? (
        <div className='border rounded overflow-hidden'>
          <div className='bg-gray-100 dark:bg-gray-800 p-3 flex flex-wrap justify-between items-center gap-x-4 gap-y-1 text-sm'>
            <div className='flex items-center gap-2'>
              <span
                className={`inline-block w-3 h-3 rounded-full flex-shrink-0 ${
                  responseData.status < 300
                    ? 'bg-green-500'
                    : responseData.status < 400
                      ? 'bg-blue-500'
                      : responseData.status < 500
                        ? 'bg-yellow-500'
                        : 'bg-red-500'
                }`}
              ></span>
              <span className='font-medium'>
                {/* Use translation key */}
                {t('statusLabel')} {responseData.status} {responseData.statusText}
              </span>
            </div>
            <div className='flex items-center gap-4'>
              {responseData.duration !== undefined && (
                <span className='text-gray-600 dark:text-gray-300'>
                  {/* Use translation key */}
                  {t('timeLabel')} {responseData.duration}ms
                </span>
              )}
              {responseData.size !== undefined && (
                <span className='text-gray-600 dark:text-gray-300'>
                  {/* Add translation key for Size */}
                  {t('sizeLabel')} {responseData.size} B
                </span>
              )}
            </div>
          </div>

          <div className='p-0'>
            <pre className='font-mono text-sm overflow-auto p-4 max-h-96 bg-white dark:bg-black'>
              {(() => {
                try {
                  const json = JSON.parse(responseData.body);
                  return JSON.stringify(json, null, 2);
                } catch {
                  return responseData.body;
                }
              })()}
            </pre>
          </div>
        </div>
      ) : (
        !error && (
          <div className='text-center text-gray-500 dark:text-gray-400 p-4'>
            {/* Use translation key */}
            {t('noResponsePlaceholder')}
          </div>
        )
      )}
    </div>
  );
}
