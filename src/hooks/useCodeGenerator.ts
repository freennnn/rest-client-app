import { useEffect, useState } from 'react';

import { CodeGenOptions } from '../types/types';

const DEBOUNCE_DELAY = 500; // Debounce delay in milliseconds

export function useCodeGenerator({ url, method, headers, contentType, body }: CodeGenOptions) {
  const [selectedLanguage, setSelectedLanguage] = useState('curl');
  const [generatedCode, setGeneratedCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const generateCode = async () => {
      if (!url) {
        setGeneratedCode('Please enter a URL to generate code');
        setIsLoading(false); // Ensure loading is false if no URL
        return;
      }

      setIsLoading(true); // Set loading true when the actual fetch starts

      try {
        const headersList = headers
          .filter((h) => h.key.trim() !== '')
          .map((h) => ({ key: h.key, value: h.value }));

        if ((method === 'POST' || method === 'PUT' || method === 'PATCH') && contentType) {
          const contentTypeExists = headersList.some((h) => h.key.toLowerCase() === 'content-type');
          if (!contentTypeExists) {
            headersList.push({ key: 'Content-Type', value: contentType });
          }
        }

        const response = await fetch('/api/generate-code', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            language: selectedLanguage,
            request: {
              url,
              method,
              header: headersList,
              body:
                (method === 'POST' || method === 'PUT' || method === 'PATCH') && body
                  ? {
                      mode: contentType?.includes('json') ? 'raw' : 'text',
                      raw: body,
                    }
                  : undefined,
            },
          }),
        });

        if (!response.ok) {
          const errorText = await response.text(); // Try to get more error info
          throw new Error(`Failed to generate code: ${response.status} ${errorText}`);
        }

        const data = await response.json();
        setGeneratedCode(data.code);
      } catch (error) {
        console.error('Error generating code:', error);
        setGeneratedCode('Error generating code. Please try again.');
      } finally {
        setIsLoading(false); // Set loading false when fetch completes or fails
      }
    };

    // --- Debounce Logic ---
    // Set a timeout to call generateCode after the delay
    const timeoutId = setTimeout(() => {
      generateCode();
    }, DEBOUNCE_DELAY);

    // Cleanup function: clear the timeout if dependencies change before delay is over
    return () => {
      clearTimeout(timeoutId);
    };
    // ---------------------
  }, [url, method, headers, body, contentType, selectedLanguage]); // Dependencies remain the same

  return {
    selectedLanguage,
    setSelectedLanguage,
    generatedCode,
    isLoading,
  };
}
