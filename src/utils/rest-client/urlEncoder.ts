export function encodeSegment(segment: string): string {
  try {
    // Directly return the URL-encoded string
    return encodeURIComponent(segment);
  } catch {
    // It's very unlikely encodeURIComponent will throw for a string,
    // but keep error handling just in case.
    // Consider returning the original segment or an empty string if encoding fails?
    throw new Error('Failed to encode segment');
  }
}

export function decodeSegment(encodedSegment: string): string {
  try {
    // Simply decode the URL-encoded string
    return decodeURIComponent(encodedSegment);
  } catch {
    // If decoding fails, it might not be a valid encoded string
    return encodedSegment; // Return original as fallback
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
