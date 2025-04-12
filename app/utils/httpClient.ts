import { Header, ResponseData } from '../types/types';

export async function sendRequest(
  url: string,
  method: string,
  headers: Header[],
  contentType: string,
  requestBody: string
): Promise<ResponseData> {
  if (!url || url.trim() === '') {
    throw new Error('URL cannot be empty');
  }

  let requestUrl = url.trim();
  if (!/^https?:\/\//i.test(requestUrl)) {
    requestUrl = `https://${requestUrl}`;
  }

  try {
    new URL(requestUrl);
  } catch {
    throw new Error('Invalid URL format');
  }

  const startTime = performance.now();

  const headersObj: Record<string, string> = {};
  if (method === 'POST' || method === 'PUT') {
    headersObj['Content-Type'] = contentType;
  }

  headers.forEach((header) => {
    if (header.key.trim()) {
      headersObj[header.key] = header.value;
    }
  });

  const options: RequestInit = {
    method,
    headers: headersObj,
    body: method === 'POST' || method === 'PUT' ? requestBody : undefined,
  };

  const response = await fetch(requestUrl, options);
  const endTime = performance.now();

  let responseBody;
  const contentTypeHeader = response.headers.get('content-type');

  try {
    if (contentTypeHeader && contentTypeHeader.includes('application/json')) {
      responseBody = JSON.stringify(await response.json(), null, 2);
    } else {
      responseBody = await response.text();
    }
  } catch {
    responseBody = await response.text();
  }

  return {
    status: response.status,
    statusText: response.statusText,
    body: responseBody,
    time: Math.round(endTime - startTime),
  };
}
