import React from 'react';

import HistoryViewer, { HistoryRecord } from '@/components/HistoryViewer';
import { useRouter } from '@/i18n/navigation';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';

jest.mock('@/i18n/navigation', () => ({
  Link: ({ href, children, ...props }: { href: string; children: React.ReactNode }) => (
    <a href={href} {...props}>
      {children}
    </a>
  ),
  useRouter: jest.fn(),
}));

jest.mock('@/paths', () => ({
  restClientPath: jest.fn(() => '/GET'),
}));

const mockHistoryData: HistoryRecord[] = [
  {
    id: '1',
    url: 'https://api.example.com/users',
    method: 'GET',
    headers: [{ key: 'Content-Type', value: 'application/json' }],
    timestamp: Date.now() - 100000,
  },
  {
    id: '2',
    url: 'https://api.example.com/posts',
    method: 'POST',
    headers: [
      { key: 'Content-Type', value: 'application/json' },
      { key: 'Authorization', value: 'Bearer token123' },
    ],
    body: JSON.stringify({ title: 'Test Post', content: 'Content' }),
    timestamp: Date.now(),
  },
];

jest.mock('@/utils/rest-client/urlEncoder', () => ({
  encodeSegment: jest.fn((text) => encodeURIComponent(text)),
}));

describe('HistoryViewer Component', () => {
  const mockRouter = {
    push: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();

    Object.defineProperty(window, 'localStorage', {
      value: {
        getItem: jest.fn(),
        setItem: jest.fn(),
        removeItem: jest.fn(),
      },
      writable: true,
    });

    jest.spyOn(console, 'error').mockImplementation(() => {});

    (useRouter as jest.Mock).mockReturnValue(mockRouter);
  });

  test('renders empty state when no history is available', async () => {
    (localStorage.getItem as jest.Mock).mockReturnValue(null);

    render(<HistoryViewer />);

    await waitFor(() => {
      expect(screen.getByText(/You haven't executed any requests yet/i)).toBeInTheDocument();
      expect(screen.getByText(/It's empty here. Try:/i)).toBeInTheDocument();
      expect(screen.getByRole('link', { name: /REST Client/i })).toBeInTheDocument();
    });
  }, 10000);

  test('renders history items when history is available', async () => {
    (localStorage.getItem as jest.Mock).mockReturnValue(JSON.stringify(mockHistoryData));

    render(<HistoryViewer />);

    await waitFor(
      () => {
        const getMethod = screen.queryByText('GET');
        const postMethod = screen.queryByText('POST');

        if (!getMethod || !postMethod) {
          throw new Error('History items not rendered yet');
        }
      },
      { timeout: 10000 }
    );

    expect(screen.getByText('https://api.example.com/users')).toBeInTheDocument();
    expect(screen.getByText('https://api.example.com/posts')).toBeInTheDocument();
    expect(screen.getByText(/Headers: 1/i)).toBeInTheDocument();
    expect(screen.getByText(/Headers: 2/i)).toBeInTheDocument();
    expect(screen.getByText(/Body:/i)).toBeInTheDocument();
  }, 15000);

  test('navigates to request URL when a history item is clicked', async () => {
    (localStorage.getItem as jest.Mock).mockReturnValue(JSON.stringify(mockHistoryData));

    render(<HistoryViewer />);

    await waitFor(
      () => {
        const userUrl = screen.queryByText('https://api.example.com/users');
        if (!userUrl) {
          throw new Error('History items not rendered yet');
        }
      },
      { timeout: 10000 }
    );

    const getCard = screen.getByText('https://api.example.com/users').closest('.cursor-pointer');
    fireEvent.click(getCard!);

    expect(mockRouter.push).toHaveBeenCalledWith(
      '/GET/https%3A%2F%2Fapi.example.com%2Fusers?Content-Type=application%2Fjson'
    );
  }, 10000);

  test('shows clear confirmation dialog when clear button is clicked', async () => {
    (localStorage.getItem as jest.Mock).mockReturnValue(JSON.stringify(mockHistoryData));

    render(<HistoryViewer />);

    await waitFor(
      () => {
        const clearButton = screen.queryByText('Clear History');
        if (!clearButton) {
          throw new Error('Clear History button not rendered yet');
        }
      },
      { timeout: 10000 }
    );

    const clearButton = screen.getByText('Clear History');
    fireEvent.click(clearButton);

    expect(screen.getByText(/Are you sure\? This cannot be undone./i)).toBeInTheDocument();
    expect(screen.getByText('Yes, clear all')).toBeInTheDocument();
    expect(screen.getByText('Cancel')).toBeInTheDocument();
  }, 10000);

  test('cancels clear confirmation when Cancel is clicked', async () => {
    (localStorage.getItem as jest.Mock).mockReturnValue(JSON.stringify(mockHistoryData));

    render(<HistoryViewer />);

    await waitFor(
      () => {
        const clearButton = screen.queryByText('Clear History');
        if (!clearButton) {
          throw new Error('Clear History button not rendered yet');
        }
      },
      { timeout: 10000 }
    );

    const clearButton = screen.getByText('Clear History');
    fireEvent.click(clearButton);

    const cancelButton = screen.getByText('Cancel');
    fireEvent.click(cancelButton);

    expect(screen.queryByText(/Are you sure\? This cannot be undone./i)).not.toBeInTheDocument();
    expect(localStorage.removeItem).not.toHaveBeenCalled();
  }, 10000);

  test('clears history when confirmation is confirmed', async () => {
    (localStorage.getItem as jest.Mock).mockReturnValue(JSON.stringify(mockHistoryData));

    render(<HistoryViewer />);

    await waitFor(
      () => {
        const clearButton = screen.queryByText('Clear History');
        if (!clearButton) {
          throw new Error('Clear History button not rendered yet');
        }
      },
      { timeout: 10000 }
    );

    const clearButton = screen.getByText('Clear History');
    fireEvent.click(clearButton);

    const confirmButton = screen.getByText('Yes, clear all');
    fireEvent.click(confirmButton);

    expect(localStorage.removeItem).toHaveBeenCalledWith('restClientHistory');
    expect(screen.getByText(/You haven't executed any requests yet/i)).toBeInTheDocument();
  }, 10000);

  test('handles localStorage errors gracefully', async () => {
    (localStorage.getItem as jest.Mock).mockImplementation(() => {
      throw new Error('localStorage error');
    });

    render(<HistoryViewer />);

    await waitFor(
      () => {
        expect(console.error).toHaveBeenCalledWith(
          'Failed to parse history from localStorage:',
          expect.any(Error)
        );
      },
      { timeout: 10000 }
    );

    expect(screen.getByText(/You haven't executed any requests yet/i)).toBeInTheDocument();
  }, 10000);

  test('navigates with body for POST requests', async () => {
    (localStorage.getItem as jest.Mock).mockReturnValue(JSON.stringify(mockHistoryData));

    render(<HistoryViewer />);

    await waitFor(
      () => {
        const postUrl = screen.queryByText('https://api.example.com/posts');
        if (!postUrl) {
          throw new Error('History items not rendered yet');
        }
      },
      { timeout: 10000 }
    );

    const postCard = screen.getByText('https://api.example.com/posts').closest('.cursor-pointer');
    fireEvent.click(postCard!);

    expect(mockRouter.push).toHaveBeenCalledWith(
      expect.stringContaining('/POST/https%3A%2F%2Fapi.example.com%2Fposts/')
    );
  }, 10000);

  test('truncates long body content in the UI', async () => {
    const longBodyHistory = [
      {
        id: '3',
        url: 'https://api.example.com/data',
        method: 'PUT',
        headers: [],
        body: 'a'.repeat(200),
        timestamp: Date.now(),
      },
    ];

    (localStorage.getItem as jest.Mock).mockReturnValue(JSON.stringify(longBodyHistory));

    render(<HistoryViewer />);

    await waitFor(
      () => {
        const bodyContent = screen.queryByText(/aaa/);
        if (!bodyContent) {
          throw new Error('Body content not rendered yet');
        }
      },
      { timeout: 10000 }
    );

    const bodyContent = screen.getByText(/aaa/);
    expect(bodyContent.textContent).toContain('...');
    expect(bodyContent.textContent).toHaveLength(103);
  }, 10000);
});
