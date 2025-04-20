import { useEffect, useState } from 'react';

import { CodeGenOptions } from '../types/types';

const DEBOUNCE_DELAY = 500; // Debounce delay in milliseconds

export function useCodeGenerator({ url, method, headers, contentType, body }: CodeGenOptions) {
  const [selectedLanguage, setSelectedLanguage] = useState('curl');
  const [generatedCode, setGeneratedCode] = useState('CodeGenerator.enterUrl');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const generateCode = async () => {
      if (!url) {
        setGeneratedCode('CodeGenerator.enterUrl');
        setIsLoading(false);
        return;
      }

      setIsLoading(true);

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
          const errorText = await response.text();
          throw new Error(`Failed to generate code: ${response.status} ${errorText}`);
        }

        const data = await response.json();
        setGeneratedCode(data.code);
      } catch (error) {
        console.error('Error generating code:', error);
        setGeneratedCode('CodeGenerator.error');
      } finally {
        setIsLoading(false);
      }
    };

    const timeoutId = setTimeout(() => {
      generateCode();
    }, DEBOUNCE_DELAY);

    return () => {
      clearTimeout(timeoutId);
    };
  }, [url, method, headers, body, contentType, selectedLanguage]);

  return {
    selectedLanguage,
    setSelectedLanguage,
    generatedCode,
    isLoading,
  };
}
