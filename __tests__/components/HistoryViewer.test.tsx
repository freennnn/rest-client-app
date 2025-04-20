import React from 'react';

import HistoryViewer, { HistoryRecord } from '@/components/HistoryViewer';
// Import mocked functions/components AFTER mocks
import { encodeSegment } from '@/utils/rest-client/urlEncoder';
// import { Header, Method } from '@/types/types'; // Remove unused types
import { render, screen } from '@testing-library/react';
// Remove unused waitFor
import userEvent from '@testing-library/user-event';
import { toast } from 'sonner';

// Import toast for mock control

// Import types if needed
// Import toast for mock control

// --- Mocks ---

// Mock UI components with explicit factories defining jest.fn() inside
jest.mock('@/components/ui/button', () => ({
  __esModule: true,
  Button: jest.fn(({ children, asChild, onClick, ...props }) => {
    if (asChild) return <>{children}</>;
    return (
      <button onClick={onClick} {...props}>
        {children}
      </button>
    );
  }),
}));

jest.mock('@/components/ui/card', () => ({
  __esModule: true,
  Card: jest.fn(({ children, onClick, ...props }) => (
    <div onClick={onClick} {...props} data-testid='mock-card'>
      {children}
    </div>
  )),
  CardContent: jest.fn(({ children, ...props }) => <div {...props}>{children}</div>),
}));

// Mock navigation explicitly inside factory
const mockRouterPush = jest.fn(); // Keep reference for assertions
jest.mock('@/i18n/navigation', () => ({
  __esModule: true,
  Link: jest.fn(({ href, children, ...props }) => (
    <a href={href} {...props}>
      {children}
    </a>
  )),
  useRouter: () => ({ push: mockRouterPush }), // Use reference here
}));

// Mock paths
jest.mock('@/paths', () => ({
  restClientPath: jest.fn(() => '/mock-rest-client'),
}));

// Mock utils explicitly inside factory
jest.mock('@/utils/rest-client/urlEncoder', () => ({
  encodeSegment: jest.fn((segment) => `encoded(${segment})`), // Define jest.fn() here
}));

// Mock next-intl (explicit factory)
const mockT = jest.fn((key) => key.split('.').pop() || key);
jest.mock('next-intl', () => ({
  __esModule: true,
  useTranslations: () => mockT,
}));

// Mock sonner
jest.mock('sonner');

// We don't need Button/Card/Link imports if only used internally by HistoryViewer
// import { Button } from '@/components/ui/button';
// import { Card, CardContent } from '@/components/ui/card';
// import { Link } from '@/i18n/navigation';

// Typecast mocks needed for control/assertions
const mockEncodeSegment = encodeSegment as jest.Mock;
const mockToast = toast as jest.Mocked<typeof toast>;
// const MockButton = Button as jest.Mock // No longer needed

// Mock Browser APIs
const mockLocalStorage = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: jest.fn((key) => store[key] || null),
    setItem: jest.fn((key, value) => {
      store[key] = value.toString();
    }), // Not used by component, but good practice
    removeItem: jest.fn((key) => {
      delete store[key];
    }),
    clear: jest.fn(() => {
      store = {};
    }),
  };
})();
Object.defineProperty(window, 'localStorage', {
  value: mockLocalStorage,
  writable: true,
  configurable: true, // Allow redefining for tests
});

// --- Test Data ---
const sampleHistory: HistoryRecord[] = [
  {
    id: 'req-1',
    url: 'http://test.com/users',
    method: 'GET',
    headers: [],
    timestamp: Date.now() - 10000,
  },
  {
    id: 'req-2',
    url: 'http://test.com/posts',
    method: 'POST',
    headers: [{ id: 'h1', key: 'Content-Type', value: 'application/json' }],
    body: '{\"title\":\"test\"}',
    contentType: 'application/json',
    timestamp: Date.now() - 5000,
  },
];

// --- Test Helper ---
const renderHistoryViewer = () => {
  return render(<HistoryViewer />);
};

// --- Tests ---
describe('HistoryViewer Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockLocalStorage.clear();
    mockT.mockImplementation((key) => key.split('.').pop() || key);
    // Reset implementations if needed (using imported+casted mocks)
    mockEncodeSegment.mockImplementation((segment) => `encoded(${segment})`);
  });

  it('should render empty state when no history exists', () => {
    renderHistoryViewer();
    expect(screen.getByText('emptyTitle')).toBeInTheDocument();
    expect(screen.getByText('emptyDescription')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'restClientButton' })).toBeInTheDocument();
  });

  it('should render history items from localStorage', () => {
    mockLocalStorage.getItem.mockReturnValue(JSON.stringify(sampleHistory));
    renderHistoryViewer();

    expect(mockLocalStorage.getItem).toHaveBeenCalledWith('restClientHistory');
    expect(screen.queryByText('emptyTitle')).not.toBeInTheDocument(); // Empty state should be gone

    // Check cards are rendered (using test id from mock)
    const cards = screen.getAllByTestId('mock-card');
    expect(cards).toHaveLength(sampleHistory.length);

    // Check some data from the history items
    expect(screen.getByText('GET')).toBeInTheDocument();
    expect(screen.getByText(sampleHistory[0].url)).toBeInTheDocument();
    expect(screen.getByText('POST')).toBeInTheDocument();
    expect(screen.getByText(sampleHistory[1].url)).toBeInTheDocument();
  });

  it('should call router.push with correct path when a history item is clicked', async () => {
    mockLocalStorage.getItem.mockReturnValue(JSON.stringify(sampleHistory));
    renderHistoryViewer();

    const cards = screen.getAllByTestId('mock-card');
    await userEvent.click(cards[0]);

    expect(mockEncodeSegment).toHaveBeenCalledWith(sampleHistory[1].url);
    expect(mockEncodeSegment).toHaveBeenCalledWith(sampleHistory[1].body);
    expect(mockRouterPush).toHaveBeenCalledTimes(1);
    expect(mockRouterPush).toHaveBeenCalledWith(
      expect.stringContaining(
        `/${sampleHistory[1].method}/encoded(${sampleHistory[1].url})/encoded(${sampleHistory[1].body})?Content-Type=application%2Fjson`
      )
    );
  });

  it('should show confirmation and clear history when clear buttons are clicked', async () => {
    mockLocalStorage.getItem.mockReturnValue(JSON.stringify(sampleHistory));
    renderHistoryViewer();

    // Initial state: clear button visible, cards present
    const clearButton = screen.getByRole('button', { name: 'clearButton' });
    expect(clearButton).toBeInTheDocument();
    expect(screen.getAllByTestId('mock-card')).toHaveLength(sampleHistory.length);

    // Click clear button to show confirmation
    await userEvent.click(clearButton);
    expect(screen.getByText('clearConfirmationPrompt')).toBeInTheDocument();
    const confirmYesButton = screen.getByRole('button', { name: 'clearConfirmationYes' });
    const confirmCancelButton = screen.getByRole('button', { name: 'clearConfirmationCancel' });
    expect(confirmYesButton).toBeInTheDocument();
    expect(confirmCancelButton).toBeInTheDocument();
    expect(clearButton).not.toBeInTheDocument(); // Original clear button hidden

    // Click Yes to confirm
    await userEvent.click(confirmYesButton);

    // Check localStorage.removeItem called
    expect(mockLocalStorage.removeItem).toHaveBeenCalledWith('restClientHistory');
    expect(mockLocalStorage.removeItem).toHaveBeenCalledTimes(1);

    // Check UI updates to empty state
    expect(screen.getByText('emptyTitle')).toBeInTheDocument();
    expect(screen.queryAllByTestId('mock-card')).toHaveLength(0); // Cards are gone
  });

  it('should handle localStorage read error and show toast', () => {
    mockLocalStorage.getItem.mockImplementation(() => {
      throw new Error('Storage Error');
    });
    renderHistoryViewer();

    expect(mockToast.error).toHaveBeenCalledTimes(1);
    expect(mockToast.error).toHaveBeenCalledWith('loadHistoryError');
    // Should still render empty state after error
    expect(screen.getByText('emptyTitle')).toBeInTheDocument();
  });
});
