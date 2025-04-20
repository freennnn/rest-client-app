import { encodeSegment } from '@/utils/rest-client/urlEncoder';

describe('encodeSegment', () => {
  it('should encode unsafe characters (space, percent)', () => {
    expect(encodeSegment('hello world %')).toBe('hello%20world%20%25');
  });

  it('should not encode unreserved characters (alphanumeric, hyphen, underscore, period, tilde)', () => {
    const unreserved = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_.~';
    expect(encodeSegment(unreserved)).toBe(unreserved);
  });

  it('should encode mixed strings correctly', () => {
    expect(encodeSegment('path/to/resource?q=hello world#frag')).toBe(
      'path%2Fto%2Fresource%3Fq%3Dhello%20world%23frag'
    );
  });

  it('should handle empty string', () => {
    expect(encodeSegment('')).toBe('');
  });

  it('should encode non-ASCII characters', () => {
    expect(encodeSegment('你好')).toBe('%E4%BD%A0%E5%A5%BD'); // Example: Chinese "hello"
    expect(encodeSegment('😊')).toBe('%F0%9F%98%8A'); // Example: Emoji
  });

  // Optional: Test if it handles already encoded segments (depends on desired behavior)
  // it('should not double-encode already encoded segments', () => {
  //   expect(encodeSegment('hello%20world')).toBe('hello%20world');
  // });
});
