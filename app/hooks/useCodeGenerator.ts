import { useEffect, useState } from 'react';
import { CodeGenOptions } from '../types/types';

export function useCodeGenerator({ url, method, headers, contentType, body }: CodeGenOptions) {
  const [selectedLanguage, setSelectedLanguage] = useState('curl');
  const [generatedCode, setGeneratedCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const generateCode = async () => {
      if (!url) {
        setGeneratedCode('Please enter a URL to generate code');
        return;
      }

      setIsLoading(true);

      try {
        const headersList = headers
          .filter(h => h.key.trim() !== '')
          .map(h => ({ key: h.key, value: h.value }));
          
        if ((method === 'POST' || method === 'PUT') && contentType) {
          const contentTypeExists = headers.some(h => h.key.toLowerCase() === 'content-type');
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
              body: (method === 'POST' || method === 'PUT') && body ? {
                mode: contentType?.includes('json') ? 'raw' : 'text',
                raw: body
              } : undefined
            }
          })
        });

        if (!response.ok) {
          throw new Error('Failed to generate code');
        }

        const data = await response.json();
        setGeneratedCode(data.code);
      } catch (error) {
        console.error('Error generating code:', error);
        setGeneratedCode('Error generating code. Please try again.');
      } finally {
        setIsLoading(false);
      }
    };

    generateCode();
  }, [url, method, headers, body, contentType, selectedLanguage]);

  return {
    selectedLanguage,
    setSelectedLanguage,
    generatedCode,
    isLoading
  };
}