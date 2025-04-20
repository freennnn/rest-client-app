import { sendRequest } from '@/utils/rest-client/httpClient';
// Polyfill TextEncoder for Jest/JSDOM environment
import { TextEncoder } from 'util';

global.TextEncoder = TextEncoder;

// Mock global fetch
global.fetch = jest.fn();

const mockFetch = fetch as jest.Mock;

describe('sendRequest', () => {
  beforeEach(() => {
    mockFetch.mockClear();
  });

  it('should make a GET request and return parsed JSON response', async () => {
    const mockResponseBody = { data: 'success' };
    const mockResponse = {
      ok: true,
      status: 200,
      statusText: 'OK',
      headers: new Headers({ 'Content-Type': 'application/json' }),
      text: jest.fn().mockResolvedValue(JSON.stringify(mockResponseBody)),
      clone: function () {
        return this;
      }, // Simple clone for size calculation
    };
    mockFetch.mockResolvedValue(mockResponse);

    const url = 'https://api.example.com/data';
    const result = await sendRequest(url, 'GET', [], '', '');

    expect(mockFetch).toHaveBeenCalledTimes(1);
    expect(mockFetch).toHaveBeenCalledWith(url, {
      method: 'GET',
      headers: {},
    });
    expect(result.status).toBe(200);
    expect(result.statusText).toBe('OK');
    expect(result.parsedBody).toEqual(mockResponseBody);
    expect(result.body).toBe(JSON.stringify(mockResponseBody));
    expect(result.headers).toEqual({ 'content-type': 'application/json' });
    expect(result.duration).toBeGreaterThanOrEqual(0);
    expect(result.size).toBe(JSON.stringify(mockResponseBody).length);
  });

  it('should make a POST request with body and headers', async () => {
    const requestBody = { key: 'value' };
    const requestHeaders = [{ id: 'h1', key: 'X-Custom', value: 'Test' }];
    const contentType = 'application/json';

    mockFetch.mockResolvedValue({
      ok: true,
      status: 201,
      statusText: 'Created',
      headers: new Headers(),
      text: jest.fn().mockResolvedValue(''),
      clone: function () {
        return this;
      },
    });

    const url = 'https://api.example.com/create';
    await sendRequest(url, 'POST', requestHeaders, contentType, JSON.stringify(requestBody));

    expect(mockFetch).toHaveBeenCalledTimes(1);
    expect(mockFetch).toHaveBeenCalledWith(url, {
      method: 'POST',
      headers: { 'X-Custom': 'Test', 'Content-Type': contentType },
      body: JSON.stringify(requestBody),
    });
  });

  it('should handle non-JSON response', async () => {
    const mockResponseBody = 'Plain text response';
    mockFetch.mockResolvedValue({
      ok: true,
      status: 200,
      statusText: 'OK',
      headers: new Headers({ 'Content-Type': 'text/plain' }),
      text: jest.fn().mockResolvedValue(mockResponseBody),
      clone: function () {
        return this;
      },
    });

    const result = await sendRequest('https://api.example.com/text', 'GET', [], '', '');

    expect(result.parsedBody).toBeNull();
    expect(result.body).toBe(mockResponseBody);
    expect(result.headers).toEqual({ 'content-type': 'text/plain' });
    expect(result.size).toBe(mockResponseBody.length);
  });

  it('should handle empty response body (e.g., 204 No Content)', async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      status: 204,
      statusText: 'No Content',
      headers: new Headers(),
      text: jest.fn().mockResolvedValue(''), // Empty text
      clone: function () {
        return this;
      },
    });

    const result = await sendRequest('https://api.example.com/delete', 'DELETE', [], '', '');

    expect(result.status).toBe(204);
    expect(result.parsedBody).toBeNull();
    expect(result.body).toBe('');
    expect(result.size).toBe(0);
  });

  it('should throw an error for network failures', async () => {
    const networkError = new Error('Network request failed');
    mockFetch.mockRejectedValue(networkError);

    // Check if the thrown error message contains the original message
    await expect(sendRequest('https://api.example.com/error', 'GET', [], '', '')).rejects.toThrow(
      networkError.message
    );
  });

  it('should handle non-ok responses (e.g., 404 Not Found)', async () => {
    const errorBody = { message: 'Resource not found' };
    mockFetch.mockResolvedValue({
      ok: false, // Important!
      status: 404,
      statusText: 'Not Found',
      headers: new Headers({ 'Content-Type': 'application/json' }),
      text: jest.fn().mockResolvedValue(JSON.stringify(errorBody)),
      clone: function () {
        return this;
      },
    });

    const result = await sendRequest('https://api.example.com/missing', 'GET', [], '', '');

    expect(result.status).toBe(404);
    expect(result.statusText).toBe('Not Found');
    expect(result.parsedBody).toEqual(errorBody);
    expect(result.body).toBe(JSON.stringify(errorBody));
    expect(result.size).toBe(JSON.stringify(errorBody).length);
  });

  // Add more tests for edge cases: different methods, header merging, timeout/abort logic if implemented
});
