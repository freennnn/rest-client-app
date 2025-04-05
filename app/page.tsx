'use client';

import { useState } from 'react';
import { useCodeGenerator } from './hooks/useCodeGenerator';
import { sendRequest } from './utils/httpClient';
import RequestForm from './components/RequestForm';
import ResponseDisplay from './components/ResponseDisplay';
import { Header, ResponseData } from './types/types';

export default function Home() {
  const [url, setUrl] = useState('');
  const [method, setMethod] = useState('GET');
  const [requestBody, setRequestBody] = useState('');
  const [responseData, setResponseData] = useState<ResponseData | null>(null);
  const [contentType, setContentType] = useState('application/json');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [headers, setHeaders] = useState<Header[]>([]);

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
    setResponseData(null);

    try {
      const response = await sendRequest(url, method, headers, contentType, requestBody);
      setResponseData(response);
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
        error={null} 
      />
    </div>
  );
}
