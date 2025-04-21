import { decodeSegment, encodeSegment } from '@/utils/rest-client/urlEncoder';

describe('URL Encoder Utilities', () => {
  describe('encodeSegment function', () => {
    test('should encode regular text', () => {
      const result = encodeSegment('test string');
      expect(typeof result).toBe('string');
      expect(result).not.toContain('+');
      expect(result).not.toContain('/');
      expect(result).not.toMatch(/=+$/);
    });

    test('should encode special characters', () => {
      const result = encodeSegment('test/with/slashes?and=query');
      expect(typeof result).toBe('string');
      const decoded = decodeSegment(result);
      expect(decoded).toBe('test/with/slashes?and=query');
    });

    test('should handle JSON objects', () => {
      const jsonObject = { name: 'test', value: 123 };
      const result = encodeSegment(JSON.stringify(jsonObject));

      expect(typeof result).toBe('string');
      expect(result).not.toContain('+');
      expect(result).not.toContain('/');

      const decoded = decodeSegment(result);
      const parsedBack = JSON.parse(decoded);
      expect(parsedBack).toEqual(jsonObject);
    });

    test('should handle empty strings', () => {
      const result = encodeSegment('');
      expect(result).toBe('');
    });

    test('should handle null and undefined', () => {
      const resultNull = encodeSegment(null as string | null);
      expect(typeof resultNull).toBe('string');

      const resultUndefined = encodeSegment(undefined as string | undefined);
      expect(typeof resultUndefined).toBe('string');
    });
  });

  describe('decodeSegment function', () => {
    test('should decode URL-safe Base64 encoded text', () => {
      const encoded = encodeSegment('test string');
      const result = decodeSegment(encoded);
      expect(result).toBe('test string');
    });

    test('should decode special characters', () => {
      const encoded = encodeSegment('test/with/slashes?and=query');
      const result = decodeSegment(encoded);
      expect(result).toBe('test/with/slashes?and=query');
    });

    test('should handle JSON strings', () => {
      const jsonObject = { name: 'test', value: 123 };
      const encoded = encodeSegment(JSON.stringify(jsonObject));
      const result = decodeSegment(encoded);
      const parsedResult = JSON.parse(result);

      expect(parsedResult).toEqual(jsonObject);
    });

    test('should handle empty strings', () => {
      const result = decodeSegment('');
      expect(result).toBe('');
    });

    test('should handle null and undefined', () => {
      const resultNull = decodeSegment(null as string | null);
      expect(resultNull === null || typeof resultNull === 'string').toBeTruthy();

      const resultUndefined = decodeSegment(undefined as string | undefined);
      expect(resultUndefined === undefined || typeof resultUndefined === 'string').toBeTruthy();
    });
  });
});
