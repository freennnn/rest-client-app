'use client';

import { useEffect, useState } from 'react';

import RequestForm from '@/app/components/RequestForm';
import ResponseDisplay from '@/app/components/ResponseDisplay';
import { useCodeGenerator } from '@/app/hooks/useCodeGenerator';
import { Header, ResponseData } from '@/app/types/types';
import { sendRequest } from '@/app/utils/httpClient';
import {
  decodeRequestBody,
  decodeRequestUrl,
  encodeRequestBody,
  encodeRequestUrl,
} from '@/app/utils/urlEncoder';
import { useSearchParams } from 'next/navigation';

export default function HomeContent() {
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
  }, [searchParams]);

  // ... rest of your home page component code ...
}
