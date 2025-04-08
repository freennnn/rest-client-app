'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { useCodeGenerator } from './hooks/useCodeGenerator';
import { sendRequest } from './utils/httpClient';
import RequestForm from './components/RequestForm';
import ResponseDisplay from './components/ResponseDisplay';
import { Header, ResponseData } from './types/types';
import { encodeRequestUrl, decodeRequestUrl, encodeRequestBody, decodeRequestBody } from './utils/urlEncoder';

export default function Home() {
  const [url, setUrl] = useState('');
  const [method, setMethod] = useState('GET');
  const [requestBody, setRequestBody] = useState('');
  const [responseData, setResponseData] = useState<ResponseData | null>(null);
  const [contentType, setContentType] = useState('application/json');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [headers, setHeaders] = useState<Header[]>([]);

  const searchParams = useSearchParams();

  useEffect(() => {
    const path = window.location.pathname;
    const pathParts = path.split('/').filter(Boolean);
    
    if (pathParts.length >= 1) {
      const urlMethod = pathParts[0];
      if (['GET', 'POST', 'PUT', 'DELETE'].includes(urlMethod)) {
        setMethod(urlMethod);
      }
      
      if (pathParts.length >= 2) {
        try {
          const decodedUrl = decodeRequestUrl(pathParts[1]);
          setUrl(decodedUrl);
        } catch (err) {
          console.error('Failed to decode URL', err);
        }
        
        if (pathParts.length >= 3 && (urlMethod === 'POST' || urlMethod === 'PUT')) {
          try {
            const decodedBody = decodeRequestBody(pathParts[2]);
            setRequestBody(decodedBody);
          } catch (err) {
            console.error('Failed to decode request body', err);
          }
        }
      }
    }
    
    const headerEntries: Header[] = [];
    searchParams.forEach((value, key) => {
      headerEntries.push({
        id: `header-${Date.now()}-${key}`,
        key,
        value: decodeURIComponent(value)
      });
    });
    
    if (headerEntries.length > 0) {
      setHeaders(headerEntries);
    }
  }, [searchParams]);

  const { 
    selectedLanguage: selectedCodeLanguage, 
    setSelectedLanguage: setSelectedCodeLanguage, 
    generatedCode, 
    isLoading: codeLoading 
  } = useCodeGenerator({
    url,
    method,
    headers,
    contentType,
    body: (method === 'POST' || method === 'PUT') ? requestBody : undefined
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
      headers.forEach(header => {
        if (header.key.trim() && header.value.trim()) {
          queryParams.append(header.key, encodeURIComponent(header.value));
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
    <div className="min-h-screen p-4 max-w-5xl mx-auto">
      <header className="mb-6">
        <h1 className="text-2xl font-bold mb-2">RESTful Client</h1>
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

      <ResponseDisplay 
        responseData={responseData}
        error={error}
      />
    </div>
  );
}
