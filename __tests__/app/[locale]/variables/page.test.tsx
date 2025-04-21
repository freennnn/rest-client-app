import React from 'react';

import VariablesPage from '@/app/[locale]/variables/page';
import { render, screen, waitFor } from '@testing-library/react';
import * as sonner from 'sonner';

// --- Mocks ---

// Mock next-intl
jest.mock('next-intl', () => ({
  useTranslations: jest.fn((namespace: string) => {
    // Return a NEW function for each namespace that closes over the namespace
    return jest.fn((key: string) => `${namespace}.${key}`);
  }),
}));

// Mock supabase client
const mockGetSession = jest.fn();
jest.mock('@/utils/supabase/client', () => ({
  createClient: () => ({
    auth: {
      getSession: mockGetSession,
    },
  }),
}));

// Mock sonner toast
jest.mock('sonner', () => ({
  toast: {
    error: jest.fn(),
  },
}));

// Mock VariablesEditor (lazy loaded component)
const MockVariablesEditor = jest.fn(() => (
  <div data-testid='mock-variables-editor'>Variables Editor</div>
));
jest.mock('@/components/VariablesEditor', () => ({
  __esModule: true,
  default: MockVariablesEditor,
}));

// --- Tests ---

describe('VariablesPage Component', () => {
  beforeEach(() => {
    // Reset mocks before each test
    jest.clearAllMocks();
    mockGetSession.mockResolvedValue({ data: { session: null } }); // Default to not authenticated
  });

  it('should show loading state initially', () => {
    render(<VariablesPage />);
    // Check for the loading container div instead of role='status'
    // Find the outer div containing the spinner
    expect(
      screen.getByText(
        (content, element) =>
          element?.tagName.toLowerCase() === 'div' && element.classList.contains('animate-spin')
      ).parentElement
    ).toBeInTheDocument();
    expect(screen.queryByTestId('mock-variables-editor')).not.toBeInTheDocument();
    expect(screen.queryByText('VariablesPage.unauthenticatedMessage')).not.toBeInTheDocument();
  });

  it('should show unauthenticated message if not logged in', async () => {
    // mockGetSession already defaults to null session
    render(<VariablesPage />);

    // Wait for the loading container to disappear
    await waitFor(() => {
      expect(
        screen.queryByText(
          (content, element) =>
            element?.tagName.toLowerCase() === 'div' && element.classList.contains('animate-spin')
        )
      ).not.toBeInTheDocument();
    });

    // Check for the CORRECT namespaced key
    expect(screen.getByText('VariablesPage.unauthenticatedMessage')).toBeInTheDocument();
    expect(screen.queryByTestId('mock-variables-editor')).not.toBeInTheDocument();
  });

  it('should show VariablesEditor if logged in', async () => {
    // Override mock to simulate logged-in state
    mockGetSession.mockResolvedValue({ data: { session: { user: { id: '123' } } } });
    render(<VariablesPage />);

    // Wait specifically for the mock editor to appear after suspense resolves
    await waitFor(() => {
      expect(screen.getByTestId('mock-variables-editor')).toBeInTheDocument();
    });

    // Check for VariablesEditor and page title/description (editor already checked in waitFor)
    expect(screen.getByTestId('mock-variables-editor')).toBeInTheDocument();
    expect(screen.getByText('VariablesPage.title')).toBeInTheDocument();
    expect(screen.getByText('VariablesPage.description')).toBeInTheDocument();
    expect(screen.queryByText('VariablesPage.unauthenticatedMessage')).not.toBeInTheDocument();
  });

  it('should show toast error if auth check fails', async () => {
    const authError = new Error('Auth check failed');
    mockGetSession.mockRejectedValue(authError); // Simulate error
    render(<VariablesPage />);

    // Wait for the loading container to disappear
    await waitFor(() => {
      expect(
        screen.queryByText(
          (content, element) =>
            element?.tagName.toLowerCase() === 'div' && element.classList.contains('animate-spin')
        )
      ).not.toBeInTheDocument();
    });

    // Check for the CORRECT namespaced key
    expect(sonner.toast.error).toHaveBeenCalledWith('Notifications.authCheckError');
    expect(screen.getByText('VariablesPage.unauthenticatedMessage')).toBeInTheDocument();
  });

  // Optional: Test localStorage error (though current implementation doesn't do much with it)
  it('should show toast error if loading variables from localStorage fails', async () => {
    // Simulate logged-in state
    mockGetSession.mockResolvedValue({ data: { session: { user: { id: '123' } } } });
    // Mock localStorage.getItem to throw an error
    const originalLocalStorage = window.localStorage;
    Object.defineProperty(window, 'localStorage', {
      value: {
        getItem: jest.fn(() => {
          throw new Error('LocalStorage Failed');
        }),
        setItem: jest.fn(),
        removeItem: jest.fn(),
        clear: jest.fn(),
        length: 0,
        key: jest.fn(),
      },
      writable: true,
    });

    render(<VariablesPage />);

    // Wait specifically for the mock editor to appear (auth succeeded)
    await waitFor(() => {
      expect(screen.getByTestId('mock-variables-editor')).toBeInTheDocument();
    });

    // Check if toast.error was called for localStorage issue
    expect(sonner.toast.error).toHaveBeenCalledWith('Notifications.loadVariablesError');
    // Editor should still render as auth succeeded (already checked in waitFor)
    expect(screen.getByTestId('mock-variables-editor')).toBeInTheDocument();

    // Restore original localStorage
    Object.defineProperty(window, 'localStorage', { value: originalLocalStorage });
  });
});
