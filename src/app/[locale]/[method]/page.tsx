'use client';

import { useEffect, useState } from 'react';

import RequestForm from '@/components/RequestForm';
import ResponseDisplay from '@/components/ResponseDisplay';
import { useCodeGenerator } from '@/hooks/useCodeGenerator';
import { nonFoundPath } from '@/paths';
import { Header, ResponseData } from '@/types/types';
import { sendRequest } from '@/utils/rest-client/httpClient';
import {
  decodeHeaderKeyValue,
  decodeRequestBody,
  decodeRequestUrl,
  encodeHeaderKeyValue,
  encodeRequestBody,
  encodeRequestUrl,
} from '@/utils/rest-client/urlEncoder';
import { hasVariables } from '@/utils/variables/variableSubstitution';
import { redirect } from 'next/navigation';
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

  const searchParams = useSearchParams();

  const isValidMethod = checkMethodValidity(method);

  if (!isValidMethod) {
    redirect(nonFoundPath());
  }

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
    body: method === 'POST' || method === 'PUT' ? requestBody : undefined,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const response = await sendRequest(url, method, headers, contentType, requestBody);

      setResponseData(response);

      let urlPath = `/${method}`;

      if (url) {
        urlPath += `/${encodeRequestUrl(url)}`;

        if ((method === 'POST' || method === 'PUT') && requestBody) {
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

function checkMethodValidity(method: string): boolean {
  return ['GET', 'POST', 'PUT', 'DELETE'].includes(method.toUpperCase());
}
