'use client';

import { useCallback, useEffect, useState } from 'react';

// Keep using this for client-side updates if needed

import RequestForm from '@/components/RequestForm';
import ResponseDisplay from '@/components/ResponseDisplay';
import { useCodeGenerator } from '@/hooks/useCodeGenerator';
import { Header, ResponseData } from '@/types/types';
import { sendRequest } from '@/utils/rest-client/httpClient';
import { encodeSegment } from '@/utils/rest-client/urlEncoder';
import { hasVariables } from '@/utils/variables/variableSubstitution';

//import { useSearchParams } from 'next/navigation';

// Props received from the Server Component parent
type RestClientFormClientProps = {
  locale: string;
  initialMethod: string;
  initialUrl: string;
  initialBody: string;
  initialHeaders: Header[];
  // Include encoded values if needed for history update
  // initialEncodedUrl?: string;
  // initialEncodedBody?: string;
};

export default function RestClientFormClient({
  locale,
  initialMethod,
  initialUrl,
  initialBody,
  initialHeaders,
}: RestClientFormClientProps) {
  const [url, setUrl] = useState(initialUrl);
  const [method, setMethod] = useState(initialMethod); // Initial method is validated by server
  const [requestBody, setRequestBody] = useState(initialBody);
  const [headers, setHeaders] = useState<Header[]>(initialHeaders);
  const [responseData, setResponseData] = useState<ResponseData | null>(null);
  const [contentType, setContentType] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [usingVariables, setUsingVariables] = useState(false);

  // We might still need searchParams if headers can be *updated* client-side via URL
  // const searchParams = useSearchParams();

  useEffect(() => {
    // Check for variables based on current state
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

  // Recalculate headers from searchParams only if necessary (e.g., if URL changes client-side)
  // This might be redundant now if headers are primarily managed via state/form.
  // Consider removing if searchParams are not expected to dynamically update headers client-side.
  // useEffect(() => {
  //   const headerEntries: Header[] = [];
  //    searchParams.forEach((value, key) => { ... });
  //    setHeaders(headerEntries); // Careful: This could overwrite headers set by initial props or user input
  // }, [searchParams]);

  // --- Code Generation Hook ---
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
    body: ['POST', 'PUT', 'PATCH'].includes(method) ? requestBody : undefined,
  });

  // --- Form Submission Handler ---
  const handleSubmit = useCallback(
    async (e?: React.FormEvent) => {
      if (e) e.preventDefault();
      setLoading(true);
      setError(null);
      setResponseData(null); // Clear previous response

      try {
        // Determine effective content type based on method
        const effectiveCt = ['POST', 'PUT', 'PATCH'].includes(method) ? contentType : ''; // Use empty string if no body expected

        // Pass effectiveCt to sendRequest
        const response = await sendRequest(url, method, headers, effectiveCt, requestBody);
        setResponseData(response);

        // Update URL in browser history using encodeSegment
        let urlPath = `/${locale}/${method}`;
        const needsBodyInPath = ['POST', 'PUT', 'PATCH'].includes(method) && requestBody;

        try {
          if (url) {
            // Use encodeSegment for URL
            urlPath += `/${encodeSegment(url)}`;
            if (needsBodyInPath) {
              // Use encodeSegment for Body
              urlPath += `/${encodeSegment(requestBody)}`;
            }
          }

          const queryParams = new URLSearchParams();
          headers.forEach((header) => {
            // Check for non-empty key and value before appending
            const key = header.key.trim();
            const value = header.value.trim();
            if (key && value) {
              // Pass raw key and value; URLSearchParams.append handles encoding
              queryParams.append(key, value);
            }
          });

          const queryString = queryParams.toString();
          if (queryString) {
            urlPath += `?${queryString}`;
          }

          window.history.replaceState({}, '', urlPath);
        } catch (encodingError) {
          console.error('Error encoding URL/Body/Headers for history update:', encodingError);
        }
      } catch (err) {
        setError(`Request failed: ${err instanceof Error ? err.message : String(err)}`);
        // setResponseData(null); // Already cleared at start
      } finally {
        setLoading(false);
      }
    },
    [url, method, headers, contentType, requestBody, locale]
  ); // Add locale to dependencies

  // --- Render UI ---
  return (
    <div className='min-h-screen p-4 max-w-5xl mx-auto'>
      <header className='mb-6'>
        {/* Display locale from props */}
        <h1 className='text-2xl font-bold mb-2'>RESTful Client ({locale})</h1>
        {usingVariables && (
          <div className='bg-blue-100 border-l-4 border-blue-500 text-blue-700 p-2 mb-4 rounded'>
            <p className='flex items-center'>
              {/* SVG icon */}
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
        setMethod={setMethod} // Allow changing method client-side
        headers={headers}
        setHeaders={setHeaders}
        requestBody={requestBody}
        setRequestBody={setRequestBody}
        contentType={contentType}
        setContentType={setContentType}
        loading={loading}
        onSubmit={handleSubmit} // Pass the handler
        generatedCode={generatedCode}
        codeLoading={codeLoading}
        selectedCodeLanguage={selectedCodeLanguage}
        setSelectedCodeLanguage={setSelectedCodeLanguage}
        error={error}
      />

      <ResponseDisplay responseData={responseData} error={error && !responseData ? error : null} />
    </div>
  );
}
