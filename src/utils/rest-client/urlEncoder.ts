// Generic function for encoding URL or Body path segments
export function encodeSegment(segment: string): string {
  try {
    // Standard URI encoding first
    const uriSafe = encodeURIComponent(segment);
    // Base64 encode, choosing implementation based on environment
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

// Generic function for decoding URL or Body path segments
export function decodeSegment(encodedSegment: string): string {
  try {
    // Restore standard Base64 characters: replace - with +, _ with /
    const base64 = encodedSegment.replace(/-/g, '+').replace(/_/g, '/');
    // Add padding if necessary (though Buffer/atob might not strictly need it)
    // while (base64.length % 4) {
    //   base64 += '=';
    // }

    // Decode Base64 based on environment
    const decodedUriSafe =
      typeof globalThis.atob === 'function'
        ? globalThis.atob(base64) // Browser
        : Buffer.from(base64, 'base64').toString('utf8'); // Node/Edge

    // Decode URI components
    return decodeURIComponent(decodedUriSafe);
  } catch (error) {
    // Handle potential errors during Base64 or URI decoding
    console.error('Error decoding segment:', encodedSegment, error);
    // Return the original encoded string in case of error as a fallback
    return encodedSegment;
  }
}

export function parseHeadersFromSearchParams(
  searchParams: URLSearchParams
): Record<string, string> {
  const headers: Record<string, string> = {};

  searchParams.forEach((value, key) => {
    // Directly use key and value since they are already decoded by Next.js
    // and decodeHeaderKeyValue is now an identity function.
    headers[key] = value;
    // Removed the try-catch as direct assignment is unlikely to throw here.
  });

  return headers;
}
