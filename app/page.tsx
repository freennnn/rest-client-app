'use client';

import { useState } from 'react';

interface Header {
  id: string;
  key: string;
  value: string;
}

export default function Home() {
  const [url, setUrl] = useState('');
  const [method, setMethod] = useState('GET');
  const [requestBody, setRequestBody] = useState('');
  const [responseData, setResponseData] = useState<{
    status: number;
    statusText: string;
    body: string;
    time?: number;
  } | null>(null);
  const [contentType, setContentType] = useState('application/json');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [headers, setHeaders] = useState<Header[]>([]);

  const addHeader = () => {
    const newId = `header-${Date.now()}`;
    setHeaders([...headers, { id: newId, key: '', value: '' }]);
  };

  const updateHeader = (id: string, field: 'key' | 'value', value: string) => {
    setHeaders(headers.map(header => 
      header.id === id ? { ...header, [field]: value } : header
    ));
  };

  const removeHeader = (id: string) => {
    setHeaders(headers.filter(header => header.id !== id));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setResponseData(null);

    try {
      const startTime = performance.now();
      
      const headersObj: Record<string, string> = {};
      if (method === 'POST' || method === 'PUT') {
        headersObj['Content-Type'] = contentType;
      }
      headers.forEach(header => {
        headersObj[header.key] = header.value;
      });

      const options: RequestInit = {
        method,
        headers: headersObj,
        body: (method === 'POST' || method === 'PUT') ? requestBody : undefined,
      };

      const response = await fetch(url, options);
      const endTime = performance.now();
      
      let responseBody;
      const contentTypeHeader = response.headers.get('content-type');
      
      try {
        if (contentTypeHeader && contentTypeHeader.includes('application/json')) {
          responseBody = JSON.stringify(await response.json(), null, 2);
        } else {
          responseBody = await response.text();
        }
      } catch (e) {
        responseBody = await response.text();
      }
      
      setResponseData({
        status: response.status,
        statusText: response.statusText,
        body: responseBody,
        time: Math.round(endTime - startTime)
      });
    } catch (err) {
      setError(`Request failed: ${err instanceof Error ? err.message : String(err)}`);
    } finally {
      setLoading(false);
    }
  };

  const formatRequestBody = () => {
    if (contentType.includes('json') && requestBody) {
      try {
        const parsed = JSON.parse(requestBody);
        setRequestBody(JSON.stringify(parsed, null, 2));
      } catch (e) {
        setError('Invalid JSON format');
      }
    }
  };

  return (
    <div className="min-h-screen p-4 max-w-5xl mx-auto">
      <header className="mb-6">
        <h1 className="text-2xl font-bold mb-2">RESTful Client</h1>
      </header>

      <form onSubmit={handleSubmit} className="mb-6">
        <div className="flex flex-col md:flex-row mb-4 gap-2">
          <select
            className="border p-2 rounded bg-black text-white"
            value={method}
            onChange={(e) => setMethod(e.target.value)}
          >
            <option value="GET">GET</option>
            <option value="POST">POST</option>
            <option value="PUT">PUT</option>
            <option value="DELETE">DELETE</option>
          </select>
          
          <input
            type="url"
            placeholder="Enter endpoint URL"
            className="flex-1 border p-2 rounded"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            required
          />
          
          <button 
            type="submit" 
            className="bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700"
            disabled={loading}
          >
            {loading ? 'Sending...' : 'Send'}
          </button>
        </div>
        
        <div className="mb-4">
          <div className="flex justify-between items-center mb-2">
            <label className="font-medium">Headers</label>
            <button 
              type="button" 
              onClick={addHeader}
              className="text-sm bg-gray-200 dark:bg-gray-700 p-1 rounded"
            >
              Add Header
            </button>
          </div>
          {headers.map(header => (
            <div key={header.id} className="flex gap-2 mb-2">
              <input
                type="text"
                placeholder="Key"
                className="flex-1 border p-2 rounded"
                value={header.key}
                onChange={(e) => updateHeader(header.id, 'key', e.target.value)}
              />
              <input
                type="text"
                placeholder="Value"
                className="flex-1 border p-2 rounded"
                value={header.value}
                onChange={(e) => updateHeader(header.id, 'value', e.target.value)}
              />
              <button 
                type="button" 
                onClick={() => removeHeader(header.id)}
                className="text-sm bg-red-200 dark:bg-red-700 p-1 rounded"
              >
                Remove
              </button>
            </div>
          ))}
        </div>

        {(method === 'POST' || method === 'PUT') && (
          <div className="mb-4">
            <div className="flex justify-between items-center mb-2">
              <div className="flex gap-2 items-center">
                <label className="font-medium">Request Body</label>
                <select
                  className="border p-1 rounded text-sm bg-black text-white"
                  value={contentType}
                  onChange={(e) => setContentType(e.target.value)}
                >
                  <option value="application/json">JSON</option>
                  <option value="text/plain">Plain Text</option>
                </select>
              </div>
              
              {contentType.includes('json') && (
                <button 
                  type="button" 
                  onClick={formatRequestBody}
                  className="text-sm bg-gray-200 dark:bg-gray-700 p-1 rounded"
                >
                  Prettify
                </button>
              )}
            </div>
            
            <textarea
              className="w-full h-40 border p-2 rounded font-mono text-sm"
              value={requestBody}
              onChange={(e) => setRequestBody(e.target.value)}
              placeholder={contentType.includes('json') ? '{\n  "key": "value"\n}' : 'Enter request body...'}
            />
          </div>
        )}
      </form>

      <div className="mb-6">
        <h2 className="text-xl font-bold mb-2">Response</h2>
        
        {error && (
          <div className="bg-red-100 border-red-400 border p-3 rounded mb-4 text-red-700">
            {error}
          </div>
        )}
        
        {responseData ? (
          <div className="border rounded overflow-hidden">
            <div className="bg-gray-100 dark:bg-gray-800 p-3 flex justify-between items-center">
              <div className="flex items-center gap-2">
                <span 
                  className={`inline-block w-3 h-3 rounded-full ${
                    responseData.status < 300 
                      ? 'bg-green-500' 
                      : responseData.status < 400 
                        ? 'bg-blue-500' 
                        : responseData.status < 500 
                          ? 'bg-yellow-500' 
                          : 'bg-red-500'
                  }`}
                ></span>
                <span className="font-medium">
                  Status: {responseData.status} {responseData.statusText}
                </span>
              </div>
              {responseData.time && (
                <span className="text-sm text-gray-600 dark:text-gray-300">
                  Time: {responseData.time}ms
                </span>
              )}
            </div>
            
            <div className="p-0">
              <pre className="font-mono text-sm overflow-auto p-4 max-h-96">
                {responseData.body}
              </pre>
            </div>
          </div>
        ) : (
          <div className="border border-gray-200 dark:border-gray-700 rounded p-4 text-center text-gray-500">
            Response will appear here after sending a request
          </div>
        )}
      </div>
    </div>
  );
}
