'use client';

import { useEffect, useState } from 'react';

import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Link, useRouter } from '@/i18n/navigation';
import { restClientPath } from '@/paths';
import { Header, Method } from '@/types/types';
import { encodeSegment } from '@/utils/rest-client/urlEncoder';
import { useTranslations } from 'next-intl';

export interface HistoryRecord {
  id: string;
  url: string;
  method: Method;
  headers: Header[];
  body?: string;
  contentType?: string;
  timestamp: number;
  resolvedUrl?: string;
}

export default function HistoryViewer() {
  const [history, setHistory] = useState<HistoryRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const router = useRouter();
  const t = useTranslations('HistoryViewer');

  useEffect(() => {
    try {
      const savedHistory = localStorage.getItem('restClientHistory');
      if (savedHistory) {
        const parsedHistory = JSON.parse(savedHistory) as HistoryRecord[];
        setHistory(parsedHistory.sort((a, b) => b.timestamp - a.timestamp));
      }
    } catch (error) {
      console.error('Failed to parse history from localStorage:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const openRequest = (request: HistoryRecord) => {
    try {
      let targetPath = `/${request.method}`;
      const needsBodyInPath = ['POST', 'PUT', 'PATCH'].includes(request.method) && request.body;

      if (request.url) {
        targetPath += `/${encodeSegment(request.url)}`;
        if (needsBodyInPath && request.body) {
          targetPath += `/${encodeSegment(request.body)}`;
        }
      }

      const queryParams = new URLSearchParams();
      if (request.headers) {
        request.headers.forEach((header) => {
          const key = header.key.trim();
          const value = header.value.trim();
          if (key && value) {
            queryParams.append(key, value);
          }
        });
      }

      const queryString = queryParams.toString();
      if (queryString) {
        targetPath += `?${queryString}`;
      }

      router.push(targetPath);
    } catch (error) {
      console.error('Failed to construct or navigate to history item path:', error);
    }
  };

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleString();
  };

  const clearHistory = () => {
    localStorage.removeItem('restClientHistory');
    setHistory([]);
    setShowConfirmation(false);
  };

  if (!isLoading && history.length === 0) {
    return (
      <div className='flex flex-col items-center justify-center h-64 text-center'>
        <h2 className='text-xl font-semibold mb-2'>{t('emptyTitle')}</h2>
        <p className='text-gray-500 dark:text-gray-400 mb-6'>{t('emptyDescription')}</p>
        <Button asChild>
          <Link href={restClientPath()}>{t('restClientButton')}</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className='space-y-6'>
      <div className='flex justify-end mb-4'>
        {showConfirmation ? (
          <div className='flex items-center gap-2'>
            <span className='text-sm text-red-600 dark:text-red-400'>
              {t('clearConfirmationPrompt')}
            </span>
            <Button
              variant='destructive'
              size='sm'
              onClick={clearHistory}
              className='bg-red-600 hover:bg-red-700 text-white'
            >
              {t('clearConfirmationYes')}
            </Button>
            <Button variant='outline' size='sm' onClick={() => setShowConfirmation(false)}>
              {t('clearConfirmationCancel')}
            </Button>
          </div>
        ) : (
          <Button
            variant='outline'
            size='sm'
            onClick={() => setShowConfirmation(true)}
            className='text-red-500 border-red-300 hover:bg-red-50 hover:text-red-700 dark:hover:bg-red-950'
          >
            {t('clearButton')}
          </Button>
        )}
      </div>

      <div className='grid grid-cols-1 gap-4'>
        {history.map((request) => (
          <Card
            key={request.id}
            className='cursor-pointer hover:shadow-md transition-shadow'
            onClick={() => openRequest(request)}
          >
            <CardContent className='p-4'>
              <div className='flex items-center justify-between mb-2'>
                <div className='flex items-center'>
                  <span
                    className={`inline-block px-2 py-1 text-xs font-semibold rounded mr-3 ${
                      request.method === 'GET'
                        ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300'
                        : request.method === 'POST'
                          ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300'
                          : request.method === 'PUT'
                            ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300'
                            : request.method === 'DELETE'
                              ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300'
                              : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
                    }`}
                  >
                    {request.method}
                  </span>
                  <h3 className='font-mono text-sm truncate max-w-[300px] sm:max-w-md lg:max-w-xl'>
                    {request.resolvedUrl || request.url}
                  </h3>
                </div>
                <span className='text-xs text-gray-500'>{formatDate(request.timestamp)}</span>
              </div>

              {request.headers && request.headers.length > 0 && (
                <p className='text-xs text-gray-500 mt-1'>
                  {t('headersLabel')} {request.headers.length}
                </p>
              )}

              {request.body && (
                <div className='mt-2'>
                  <p className='text-xs text-gray-500 mb-1'>Body:</p>
                  <pre className='text-xs bg-gray-50 dark:bg-gray-800 p-2 rounded overflow-hidden max-h-20 overflow-y-auto'>
                    {request.body.length > 100
                      ? `${request.body.substring(0, 100)}...`
                      : request.body}
                  </pre>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
