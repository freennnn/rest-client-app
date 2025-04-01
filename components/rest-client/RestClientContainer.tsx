'use client';

import { useState } from 'react';
import MethodSelector from './MethodSelector';
import EndpointInput from './EndpointInput';
import HeadersEditor from './HeadersEditor';
import RequestBodyEditor from './RequestBodyEditor';
import CodeGenerator from './CodeGenerator';
import LoadingSpinner from '../ui/LoadingSpinner';
import { encodeBase64 } from '@/utils/base64';
import { replaceVariables } from '@/utils/variableUtils';
import { Button } from "@/components/ui/button";
import { Send } from "lucide-react";

type HttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH' | 'HEAD' | 'OPTIONS';

interface Header {
  id: string;
  key: string;
  value: string;
}

interface RestClientContainerProps {
  method: HttpMethod;
  endpoint?: string;
  bodyContent?: string;
  initialHeaders?: Record<string, string>;
}

export default function RestClientContainer({
  method,
  endpoint = '',
  bodyContent = '',
  initialHeaders = {}
}: RestClientContainerProps) {
  
  const [url, setUrl] = useState(endpoint);
  const [requestBody, setRequestBody] = useState(bodyContent);
  const [headers, setHeaders] = useState<Header[]>(() => {
    return Object.entries(initialHeaders).map(([key, value]) => ({
      id: crypto.randomUUID(),
      key,
      value
    }));
  });
  
  const [responseStatus, setResponseStatus] = useState<number | null>(null);
  const [responseBody, setResponseBody] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const headersRecord = headers.reduce((acc, header) => {
    if (header.key.trim() && header.value.trim()) {
      acc[header.key] = header.value;
    }
    return acc;
  }, {} as Record<string, string>);

  const handleSendRequest = async () => {
    if (!url.trim()) {
      setError('Please enter a URL');
      return;
    }
    
    setIsLoading(true);
    setError(null);
    
    try {
      const processedUrl = replaceVariables(url);
      const processedHeaders = headers.reduce((acc, header) => {
        if (header.key.trim()) {
          acc[header.key] = replaceVariables(header.value);
        }
        return acc;
      }, {} as Record<string, string>);

      let processedBody = requestBody;
      if (requestBody && ['POST', 'PUT', 'PATCH'].includes(method)) {
        processedBody = replaceVariables(requestBody);
      }
      
      const urlParams = new URLSearchParams();
      Object.entries(processedHeaders).forEach(([key, value]) => {
        urlParams.append(key, value);
      });
      
      let newUrl = `/client/${method}/${encodeBase64(url)}`;
      if (processedBody && ['POST', 'PUT', 'PATCH'].includes(method)) {
        newUrl += `/${encodeBase64(processedBody)}`;
      }
      
      if (Object.keys(processedHeaders).length > 0) {
        newUrl += `?${urlParams.toString()}`;
      }
      
      window.history.replaceState(null, '', newUrl);
      
      const response = await fetch(processedUrl, {
        method,
        headers: processedHeaders,
        body: ['POST', 'PUT', 'PATCH'].includes(method) ? processedBody : undefined,
      });
      
      setResponseStatus(response.status);
      
      if (method === 'HEAD' || method === 'OPTIONS') {
        const headersObj = Object.fromEntries(response.headers.entries());
        const responseData = {
          status: response.status,
          statusText: response.statusText,
          headers: headersObj
        };
        setResponseBody(JSON.stringify(responseData, null, 2));
      } else {
        try {
          const clonedResponse = response.clone();
          try {
            const data = await response.json();
            setResponseBody(JSON.stringify(data, null, 2));
          } catch {
            try {
              const text = await clonedResponse.text();
              setResponseBody(text || '(Empty response body)');
            } catch (textError) {
              setError(`Failed to read response body: ${textError}`);
              setResponseBody('(Unable to read response body)');
            }
          }
        } catch (err) {
          setError(`Error processing response: ${err instanceof Error ? err.message : String(err)}`);
          setResponseBody('');
        }
      }
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('An error occurred while sending the request');
      }
      setResponseStatus(null);
      setResponseBody('');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full px-4 md:px-6 my-6">
      <div className="space-y-6">
        <div className="bg-white dark:bg-gray-800 p-4 md:p-6 rounded-lg shadow-md">
          <div className="flex flex-col gap-4">
            <div className="flex gap-4 flex-col md:flex-row">
              <MethodSelector 
                method={method} 
                endpoint={url} 
                body={requestBody} 
                headers={headersRecord} 
              />
              
              <EndpointInput
                value={url}
                onChange={setUrl}
                onSubmit={handleSendRequest}
              />
            </div>
            
            <HeadersEditor 
              headers={headers} 
              onChange={setHeaders} 
            />
            
            {['POST', 'PUT', 'PATCH'].includes(method) && (
              <RequestBodyEditor
                value={requestBody}
                onChange={setRequestBody}
                contentType={headersRecord['Content-Type'] || 'application/json'}
              />
            )}
            
            <CodeGenerator
              method={method}
              url={url}
              headers={headersRecord}
              body={['POST', 'PUT', 'PATCH'].includes(method) ? requestBody : undefined}
            />
            
            <div className="mt-4">
              <Button
                onClick={handleSendRequest}
                disabled={isLoading}
                variant="outline"
                className="bg-black text-white hover:bg-gray-800 border-gray-700 flex gap-2 items-center"
              >
                {isLoading ? <LoadingSpinner size="sm" /> : (
                  <>
                    <Send className="h-4 w-4" />
                    Send Request
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
        
        <div className="bg-white dark:bg-gray-800 p-4 md:p-6 rounded-lg shadow-md">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-xl font-semibold">Response</h2>
            {responseStatus !== null && (
              <div className={`px-3 py-1 rounded-md text-sm font-medium ${
                responseStatus >= 200 && responseStatus < 300
                  ? 'bg-green-600 text-white'
                  : responseStatus >= 400
                  ? 'bg-red-600 text-white'
                  : 'bg-yellow-600 text-white'
              }`}>
                Status: {responseStatus}
              </div>
            )}
          </div>
          
          {error && (
            <div className="mb-4 p-3 bg-red-100 dark:bg-red-100/10 text-red-700 dark:text-red-500 rounded-md">
              {error}
            </div>
          )}
          
          <RequestBodyEditor
            value={responseBody}
            onChange={() => {}}
            readOnly={true}
            contentType={responseBody.startsWith('{') || responseBody.startsWith('[') ? 'application/json' : 'text/plain'}
          />
        </div>
      </div>
    </div>
  );
}
