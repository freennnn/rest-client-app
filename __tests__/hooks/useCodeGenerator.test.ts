import { useCodeGenerator } from '@/hooks/useCodeGenerator';
import { act, renderHook } from '@testing-library/react';

global.fetch = jest.fn();

describe('useCodeGenerator Hook', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (fetch as jest.Mock).mockImplementation(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ code: 'const code = "test";' }),
      })
    );
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  test('should initialize with default values', () => {
    const { result } = renderHook(() =>
      useCodeGenerator({
        url: '',
        method: 'GET',
        headers: [],
        contentType: '',
        body: '',
      })
    );

    expect(result.current.generatedCode).toBe('CodeGenerator.enterUrl');
    expect(result.current.isLoading).toBe(false);
  });

  test('should generate code when props change and timer completes', async () => {
    const { result } = renderHook((props) => useCodeGenerator(props), {
      initialProps: {
        url: 'https://example.com',
        method: 'GET',
        headers: [],
        contentType: '',
        body: '',
      },
    });

    await act(async () => {
      jest.advanceTimersByTime(500);
    });

    expect(fetch).toHaveBeenCalledWith(
      '/api/generate-code',
      expect.objectContaining({
        method: 'POST',
        body: expect.stringContaining('https://example.com'),
      })
    );

    await act(async () => {
      await Promise.resolve();
    });

    expect(result.current.generatedCode).toBe('const code = "test";');
    expect(result.current.isLoading).toBe(false);
  });

  test('should handle API errors', async () => {
    (fetch as jest.Mock).mockImplementationOnce(() =>
      Promise.resolve({
        ok: false,
        status: 500,
        text: () => Promise.resolve('Internal Server Error'),
      })
    );

    const { result } = renderHook(() =>
      useCodeGenerator({
        url: 'https://example.com',
        method: 'GET',
        headers: [],
        contentType: '',
        body: '',
      })
    );

    await act(async () => {
      jest.advanceTimersByTime(500);
    });

    await act(async () => {
      await Promise.resolve();
    });

    expect(result.current.generatedCode).toBe('CodeGenerator.error');
    expect(result.current.isLoading).toBe(false);
  });

  test('should allow changing the selected language', async () => {
    const { result } = renderHook(() =>
      useCodeGenerator({
        url: 'https://example.com',
        method: 'GET',
        headers: [],
        contentType: '',
        body: '',
      })
    );

    expect(result.current.selectedLanguage).toBe('curl');

    await act(async () => {
      result.current.setSelectedLanguage('javascript');
    });

    expect(result.current.selectedLanguage).toBe('javascript');

    await act(async () => {
      jest.advanceTimersByTime(500);
    });

    expect(fetch).toHaveBeenCalledWith(
      '/api/generate-code',
      expect.objectContaining({
        method: 'POST',
        body: expect.stringContaining('"language":"javascript"'),
      })
    );
  });
});
