'use client';

import { useEffect, useState } from 'react';

import { HistoryRecord } from '@/components/HistoryViewer';
import RequestForm from '@/components/RequestForm';
import ResponseDisplay from '@/components/ResponseDisplay';
import { useCodeGenerator } from '@/hooks/useCodeGenerator';
import { Header, Method, ResponseData } from '@/types/types';
import { sendRequest } from '@/utils/rest-client/httpClient';
import {
  decodeHeaderKeyValue,
  decodeRequestBody,
  decodeRequestUrl,
  encodeHeaderKeyValue,
  encodeRequestBody,
  encodeRequestUrl,
} from '@/utils/rest-client/urlEncoder';
import {
  hasVariables,
  processBody,
  processHeaders,
  processUrl,
} from '@/utils/variables/variableSubstitution';
import { useSearchParams } from 'next/navigation';

type RestClientPageProps = {
  method?: string;
  encodedUrl?: string;
  encodedBody?: string;
};

export default function RestClientPage({
  method: initialMethod,
  encodedUrl,
  encodedBody,
}: RestClientPageProps = {}) {
  const [url, setUrl] = useState('');
  const [method, setMethod] = useState(initialMethod || 'GET');
  const [requestBody, setRequestBody] = useState('');
  const [responseData, setResponseData] = useState<ResponseData | null>(null);
  const [contentType, setContentType] = useState('application/json');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [headers, setHeaders] = useState<Header[]>([]);
  const [usingVariables, setUsingVariables] = useState(false);
  const [restoredFromHistory, setRestoredFromHistory] = useState(false);

  const searchParams = useSearchParams();

  useEffect(() => {
    const checkForVariables = () => {
      const urlHasVars = hasVariables(url);
      const bodyHasVars = hasVariables(requestBody);
      const headersHaveVars = headers.some(
        (header) => hasVariables(header.key) || hasVariables(header.value)
      );

      setUsingVariables(urlHasVars || bodyHasVars || headersHaveVars);
    };

    checkForVariables();
  }, [url, requestBody, headers]);

  useEffect(() => {
    try {
      const restoredRequest = sessionStorage.getItem('restoreRequest');
      if (restoredRequest) {
        const parsedRequest = JSON.parse(restoredRequest) as HistoryRecord;

        setMethod(parsedRequest.method as string);
        setUrl(parsedRequest.url);
        setHeaders(parsedRequest.headers || []);
        if (parsedRequest.body) setRequestBody(parsedRequest.body);
        if (parsedRequest.contentType) setContentType(parsedRequest.contentType);

        sessionStorage.removeItem('restoreRequest');
        setRestoredFromHistory(true);
        return;
      }
    } catch (err) {
      console.error('Failed to restore request from history:', err);
    }

    if (encodedUrl) {
      try {
        const decodedUrl = decodeRequestUrl(encodedUrl);
        setUrl(decodedUrl);
      } catch (err) {
        console.error('Failed to decode URL', err);
        setUrl(encodedUrl);
      }
    }

    if (encodedBody && (method === 'POST' || method === 'PUT' || method === 'PATCH')) {
      try {
        const decodedBody = decodeRequestBody(encodedBody);
        setRequestBody(decodedBody);
      } catch (err) {
        console.error('Failed to decode request body', err);
        setRequestBody('');
      }
    }

    const headerEntries: Header[] = [];
    searchParams.forEach((encodedValue, encodedKey) => {
      try {
        const key = decodeHeaderKeyValue(encodedKey);
        const value = decodeHeaderKeyValue(encodedValue);

        headerEntries.push({
          id: `header-${Date.now()}-${key}`,
          key,
          value,
        });
      } catch (err) {
        console.error('Failed to decode header', err);
      }
    });

    if (headerEntries.length > 0) {
      setHeaders(headerEntries);
    }
  }, [encodedUrl, encodedBody, method, searchParams]);

  const saveToHistory = (resolvedUrl?: string) => {
    try {
      const historyRecord: HistoryRecord = {
        id: `req-${Date.now()}`,
        url,
        method: method as Method,
        headers,
        body: requestBody,
        contentType,
        timestamp: Date.now(),
        resolvedUrl,
      };

      let history: HistoryRecord[] = [];
      const savedHistory = localStorage.getItem('restClientHistory');
      if (savedHistory) {
        try {
          history = JSON.parse(savedHistory);
        } catch (e) {
          console.error('Failed to parse history, resetting:', e);
        }
      }

      history.unshift(historyRecord);
      if (history.length > 50) history = history.slice(0, 50);

      localStorage.setItem('restClientHistory', JSON.stringify(history));
      console.log('Request saved to history');
    } catch (err) {
      console.error('Failed to save request to history:', err);
    }
  };

  const {
    selectedLanguage: selectedCodeLanguage,
    setSelectedLanguage: setSelectedCodeLanguage,
    generatedCode,
    isLoading: codeLoading,
  } = useCodeGenerator({
    url,
    method,
    headers,
    contentType,
    body: method === 'POST' || method === 'PUT' || method === 'PATCH' ? requestBody : undefined,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      let processedUrl = url;
      let processedHeaders = [...headers];
      let processedBody = requestBody;

      if (usingVariables) {
        processedUrl = processUrl(url);
        processedHeaders = processHeaders(headers);
        processedBody = processBody(requestBody);
      }

      const response = await sendRequest(
        processedUrl,
        method,
        processedHeaders,
        contentType,
        processedBody
      );

      setResponseData(response);

      saveToHistory(usingVariables ? processedUrl : undefined);

      let urlPath = `/${method}`;

      if (url) {
        urlPath += `/${encodeRequestUrl(url)}`;

        if ((method === 'POST' || method === 'PUT' || method === 'PATCH') && requestBody) {
          urlPath += `/${encodeRequestBody(requestBody)}`;
        }
      }

      const queryParams = new URLSearchParams();
      headers.forEach((header) => {
        if (header.key.trim() && header.value.trim()) {
          const encodedKey = encodeHeaderKeyValue(header.key);
          const encodedValue = encodeHeaderKeyValue(header.value);
          queryParams.append(encodedKey, encodedValue);
        }
      });

      const queryString = queryParams.toString();
      if (queryString) {
        urlPath += `?${queryString}`;
      }

      window.history.replaceState({}, '', urlPath);
    } catch (err) {
      setError(`Request failed: ${err instanceof Error ? err.message : String(err)}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className='min-h-screen p-4 max-w-5xl mx-auto'>
      <header className='mb-6'>
        <h1 className='text-2xl font-bold mb-2'>RESTful Client</h1>

        {restoredFromHistory && (
          <div className='bg-green-100 border-l-4 border-green-500 text-green-700 p-2 mb-4 rounded'>
            <p className='flex items-center'>
              <svg
                className='w-4 h-4 mr-2'
                fill='none'
                stroke='currentColor'
                viewBox='0 0 24 24'
                xmlns='http://www.w3.org/2000/svg'
              >
                <path
                  strokeLinecap='round'
                  strokeLinejoin='round'
                  strokeWidth='2'
                  d='M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z'
                ></path>
              </svg>
              Request restored from history
            </p>
          </div>
        )}

        {usingVariables && (
          <div className='bg-blue-100 border-l-4 border-blue-500 text-blue-700 p-2 mb-4 rounded'>
            <p className='flex items-center'>
              <svg
                className='w-4 h-4 mr-2'
                fill='none'
                stroke='currentColor'
                viewBox='0 0 24 24'
                xmlns='http://www.w3.org/2000/svg'
              >
                <path
                  strokeLinecap='round'
                  strokeLinejoin='round'
                  strokeWidth='2'
                  d='M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z'
                ></path>
              </svg>
              This request uses variables that will be substituted when sent.
            </p>
          </div>
        )}
      </header>

      <RequestForm
        url={url}
        setUrl={setUrl}
        method={method}
        setMethod={setMethod}
        headers={headers}
        setHeaders={setHeaders}
        requestBody={requestBody}
        setRequestBody={setRequestBody}
        contentType={contentType}
        setContentType={setContentType}
        loading={loading}
        onSubmit={handleSubmit}
        generatedCode={generatedCode}
        codeLoading={codeLoading}
        selectedCodeLanguage={selectedCodeLanguage}
        setSelectedCodeLanguage={setSelectedCodeLanguage}
        error={error}
      />

      <ResponseDisplay responseData={responseData} error={error} />
    </div>
  );
}
