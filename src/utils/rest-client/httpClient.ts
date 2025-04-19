import { Header, ResponseData } from '@/types/types';

import { processBody, processHeaders, processUrl } from '../variables/variableSubstitution';

export async function sendRequest(
  url: string,
  method: string,
  headers: Header[],
  contentType: string,
  body?: string
): Promise<ResponseData> {
  const processedUrl = processUrl(url);
  const processedHeaders = processHeaders(headers);
  const processedBody = body ? processBody(body) : undefined;

  const startTime = Date.now();

  try {
    const requestOptions: RequestInit = {
      method,
      headers: {
        ...(contentType && { 'Content-Type': contentType }),
        ...processedHeaders.reduce(
          (acc, header) => {
            if (header.key && header.value) {
              acc[header.key] = header.value;
            }
            return acc;
          },
          {} as Record<string, string>
        ),
      },
      ...(['POST', 'PUT', 'PATCH'].includes(method) && processedBody
        ? { body: processedBody }
        : {}),
    };

    const response = await fetch(processedUrl, requestOptions);
    const endTime = Date.now();
    const duration = endTime - startTime;

    const contentTypeHeader = response.headers.get('Content-Type') || '';
    let responseBody: string;
    let parsedBody: unknown;

    if (contentTypeHeader.includes('application/json')) {
      responseBody = await response.text();
      try {
        parsedBody = JSON.parse(responseBody);
      } catch {
        parsedBody = null;
      }
    } else if (contentTypeHeader.includes('text/')) {
      responseBody = await response.text();
      parsedBody = null;
    } else {
      responseBody = '[Binary data not displayed]';
      parsedBody = null;
    }

    const responseHeaders: Record<string, string> = {};
    response.headers.forEach((value, key) => {
      responseHeaders[key] = value;
    });

    return {
      status: response.status,
      statusText: response.statusText,
      headers: responseHeaders,
      body: responseBody,
      parsedBody,
      duration,
      size: new TextEncoder().encode(responseBody).length,
    };
  } catch (error) {
    const endTime = Date.now();
    const duration = endTime - startTime;
    throw new Error(
      `Request failed: ${error instanceof Error ? error.message : String(error)} (after ${duration}ms)`
    );
  }
}
