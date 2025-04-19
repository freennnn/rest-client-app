// Generic function for encoding URL or Body path segments
export function encodeSegment(segment: string): string {
  try {
    return btoa(encodeURIComponent(segment));
  } catch (error) {
    console.error('Error encoding segment:', error);
    throw new Error('Failed to encode segment');
  }
}

// Generic function for decoding URL or Body path segments
export function decodeSegment(encodedSegment: string): string {
  try {
    // Basic check for Base64 format
    const isValidBase64 = /^[A-Za-z0-9+/]*={0,2}$/.test(encodedSegment);
    if (!isValidBase64) {
      console.warn('Invalid base64 string encountered in segment:', encodedSegment);
      // Return the original string if it doesn't look like Base64
      return encodedSegment;
    }

    return decodeURIComponent(atob(encodedSegment));
  } catch (error) {
    // Handle potential errors during atob or decodeURIComponent
    console.error('Error decoding segment:', error);
    // Return the original encoded string in case of error
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
