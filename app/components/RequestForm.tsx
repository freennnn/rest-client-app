import React from 'react';
import { Header } from '../types/types';

interface RequestFormProps {
  url: string;
  setUrl: (url: string) => void;
  method: string;
  setMethod: (method: string) => void;
  headers: Header[];
  setHeaders: (headers: Header[]) => void;
  requestBody: string;
  setRequestBody: (body: string) => void;
  contentType: string;
  setContentType: (contentType: string) => void;
  loading: boolean;
  onSubmit: (e: React.FormEvent) => Promise<void>;
  generatedCode: string;
  codeLoading: boolean;
  selectedCodeLanguage: string;
  setSelectedCodeLanguage: (language: string) => void;
  error: string | null;
}

export default function RequestForm({
  url, setUrl,
  method, setMethod,
  headers, setHeaders,
  requestBody, setRequestBody,
  contentType, setContentType,
  loading, onSubmit,
  generatedCode, codeLoading,
  selectedCodeLanguage, setSelectedCodeLanguage,
  error
}: RequestFormProps) {
  
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

  const formatRequestBody = () => {
    if (contentType.includes('json') && requestBody) {
      try {
        const parsed = JSON.parse(requestBody);
        setRequestBody(JSON.stringify(parsed, null, 2));
      } catch (e) {
        console.error('Invalid JSON format', e);
      }
    }
  };

  return (
    <form onSubmit={onSubmit} className="mb-6 border rounded-md p-4">
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
        {headers.length > 0 ? (
          headers.map(header => (
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
          ))
        ) : (
          <div className="text-gray-500 text-sm mb-2">No headers added</div>
        )}
      </div>

      <div className="mb-4">
        <div className="flex justify-between items-center mb-2">
          <label className="font-medium">Code</label>
          <select
            className="border p-1 rounded text-sm bg-black text-white"
            value={selectedCodeLanguage}
            onChange={(e) => setSelectedCodeLanguage(e.target.value)}
          >
            <option value="curl">cURL</option>
            <option value="fetch">JavaScript (Fetch)</option>
            <option value="xhr">JavaScript (XHR)</option>
            <option value="nodejs">Node.js</option>
            <option value="python">Python</option>
            <option value="java">Java</option>
            <option value="csharp">C#</option>
            <option value="go">Go</option>
          </select>
        </div>
        <pre className="border p-3 rounded bg-gray-100 dark:bg-gray-800 text-sm overflow-auto max-h-40 font-mono">
          {codeLoading ? 'Generating code...' : generatedCode}
        </pre>
      </div>

      {(method === 'POST' || method === 'PUT') && (
        <div className="mb-4">
          <div className="flex justify-between items-center mb-2">
            <div className="flex gap-2 items-center">
              <label className="font-medium">Body</label>
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

      {error && (
        <div className="bg-red-100 border-red-400 border p-3 rounded mb-4 text-red-700">
          {error}
        </div>
      )}
    </form>
  );
}