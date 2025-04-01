export function encodeBase64(str: string): string {
  if (typeof window !== 'undefined') {
    const encoded = encodeURIComponent(str);
    const base64 = window.btoa(encoded);
    return base64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
  }
  return Buffer.from(str).toString('base64url');
}

export function decodeBase64(str: string): string {
  try {
    if (typeof window !== 'undefined') {
      const base64 = str.replace(/-/g, '+').replace(/_/g, '/');
      
      const pad = base64.length % 4;
      const paddedBase64 = pad ? base64 + '='.repeat(4 - pad) : base64;
      
      try {
        const decoded = window.atob(paddedBase64);
        return decodeURIComponent(decoded);
      } catch {
        console.warn("Standard base64 decoding failed, trying alternative approach");
        return decodeURIComponent(escape(window.atob(paddedBase64)));
      }
    }
    
    return Buffer.from(str, 'base64url').toString();
  } catch (error) {
    console.error('Error decoding base64 string:', error);
    return '';
  }
}
