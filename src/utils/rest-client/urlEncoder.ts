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
    const isValidBase64 = /^[A-Za-z0-9+/]*={0,2}$/.test(encodedUrl);
    if (!isValidBase64) {
      console.warn('Invalid base64 string encountered in URL:', encodedUrl);
      return encodedUrl;
    }

    return decodeURIComponent(atob(encodedUrl));
  } catch (error) {
    console.error('Error decoding URL:', error);
    return encodedUrl;
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
    const isValidBase64 = /^[A-Za-z0-9+/]*={0,2}$/.test(encodedBody);
    if (!isValidBase64) {
      console.warn('Invalid base64 string encountered in request body:', encodedBody);
      return encodedBody;
    }

    return decodeURIComponent(atob(encodedBody));
  } catch (error) {
    console.error('Error decoding request body:', error);
    return encodedBody;
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
    const isValidBase64 = /^[A-Za-z0-9+/]*={0,2}$/.test(encodedValue);
    if (!isValidBase64) {
      console.warn('Invalid base64 string encountered in header:', encodedValue);
      return encodedValue;
    }

    return decodeURIComponent(atob(encodedValue));
  } catch (error) {
    console.error('Error decoding header value:', error);
    return encodedValue;
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
