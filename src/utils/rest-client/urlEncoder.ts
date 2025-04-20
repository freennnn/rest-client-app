export function encodeSegment(segment: string): string {
  try {
    const uriSafe = encodeURIComponent(segment);

    const base64 =
      typeof globalThis.btoa === 'function'
        ? globalThis.btoa(uriSafe) // Browser
        : Buffer.from(uriSafe, 'utf8').toString('base64'); // Node/Edge
    // Convert to URL-safe Base64: replace + with -, / with _, remove padding =
    return base64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
  } catch (error) {
    console.error('Error encoding segment:', error);
    throw new Error('Failed to encode segment');
  }
}

export function decodeSegment(encodedSegment: string): string {
  try {
    // Restore standard Base64 characters: replace - with +, _ with /
    const base64 = encodedSegment.replace(/-/g, '+').replace(/_/g, '/');

    const decodedUriSafe =
      typeof globalThis.atob === 'function'
        ? globalThis.atob(base64) // Browser
        : Buffer.from(base64, 'base64').toString('utf8'); // Node/Edge

    return decodeURIComponent(decodedUriSafe);
  } catch (error) {
    console.error('Error decoding segment:', encodedSegment, error);

    return encodedSegment;
  }
}

export function parseHeadersFromSearchParams(
  searchParams: URLSearchParams
): Record<string, string> {
  const headers: Record<string, string> = {};

  searchParams.forEach((value, key) => {
    headers[key] = value;
  });

  return headers;
}
