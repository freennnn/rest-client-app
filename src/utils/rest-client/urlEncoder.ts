export function encodeRequestUrl(url: string): string {
  try {
    return btoa(encodeURIComponent(url));
  } catch (error) {
    console.error('Error encoding URL:', error);
    throw new Error('Failed to encode URL');
  }
}

export function decodeRequestUrl(encodedUrl: string): string {
  try {
    return decodeURIComponent(atob(encodedUrl));
  } catch (error) {
    console.error('Error decoding URL:', error);
    throw new Error('Failed to decode URL');
  }
}

export function encodeRequestBody(body: string): string {
  try {
    return btoa(encodeURIComponent(body));
  } catch (error) {
    console.error('Error encoding request body:', error);
    throw new Error('Failed to encode request body');
  }
}

export function decodeRequestBody(encodedBody: string): string {
  try {
    return decodeURIComponent(atob(encodedBody));
  } catch (error) {
    console.error('Error decoding request body:', error);
    throw new Error('Failed to decode request body');
  }
}

export function encodeHeaderKeyValue(value: string): string {
  try {
    return btoa(encodeURIComponent(value));
  } catch (error) {
    console.error('Error encoding header value:', error);
    throw new Error('Failed to encode header value');
  }
}

export function decodeHeaderKeyValue(encodedValue: string): string {
  try {
    return decodeURIComponent(atob(encodedValue));
  } catch (error) {
    console.error('Error decoding header value:', error);
    throw new Error('Failed to decode header value');
  }
}

export function parseHeadersFromSearchParams(
  searchParams: URLSearchParams
): Record<string, string> {
  const headers: Record<string, string> = {};

  searchParams.forEach((value, key) => {
    try {
      const decodedKey = decodeHeaderKeyValue(key);
      const decodedValue = decodeHeaderKeyValue(value);
      headers[decodedKey] = decodedValue;
    } catch (error) {
      console.error('Error decoding header:', error);
    }
  });

  return headers;
}
