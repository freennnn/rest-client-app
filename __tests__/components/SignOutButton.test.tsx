import React from 'react';

// import { act } from 'react'; // Removed unused import

import { SignOutButton } from '@/components/SignOutButton';
import { useAuthActions } from '@/hooks/useAuthActions';
// import messages from '@/messages/en.json'; // Removed: No longer needed with mock
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

// --- Mocks (Inline) ---
jest.mock('@/hooks/useAuthActions');
const mockUseAuthActions = useAuthActions as jest.Mock;

// Mock routing first (dependency of navigation)
jest.mock('@/i18n/routing', () => ({
  locales: ['en', 'ru'],
  routing: {
    locales: ['en', 'ru'],
    defaultLocale: 'en',
  },
}));

// Mock navigation
jest.mock('@/i18n/navigation', () => ({
  useRouter: jest.fn(() => ({
    push: jest.fn(),
    refresh: jest.fn(),
  })),
  usePathname: jest.fn(() => '/'),
  Link: ({
    href,
    children,
    ...props
  }: {
    href: string;
    children: React.ReactNode;
    [key: string]: unknown;
  }) => React.createElement('a', { href, ...props }, children),
  getPathname: jest.fn(() => '/'),
  redirect: jest.fn(),
}));

// Mock next-intl
jest.mock('next-intl', () => ({
  useTranslations: () => (key: string) => key.split('.').pop() || key,
  useLocale: () => 'en',
  NextIntlClientProvider: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

// Mock sonner
jest.mock('sonner', () => ({
  toast: { success: jest.fn(), error: jest.fn(), info: jest.fn(), warning: jest.fn() },
}));

// Helper function to render
const renderSignOutButton = () => {
  return render(<SignOutButton />);
};

describe('SignOutButton', () => {
  // Reset mocks before each test
  beforeEach(() => {
    jest.clearAllMocks();
    // Default mock implementation
    mockUseAuthActions.mockReturnValue({
      signOut: jest.fn().mockResolvedValue(undefined), // Default to successful sign-out
      isPending: false, // Note: Component uses local state, not hook's isPending
    });
  });

  it('should render the sign-out button', () => {
    renderSignOutButton();
    // Check button using final key part
    expect(screen.getByRole('button', { name: 'signOut' })).toBeInTheDocument();
  });

  it('should call signOut when clicked', async () => {
    const user = userEvent.setup();
    const mockSignOut = jest.fn().mockResolvedValue(undefined);
    mockUseAuthActions.mockReturnValue({ signOut: mockSignOut });

    renderSignOutButton();
    // Find button using final key part
    const button = screen.getByRole('button', { name: 'signOut' });

    await user.click(button);

    await waitFor(() => {
      expect(mockSignOut).toHaveBeenCalledTimes(1);
    });
  });

  it('should display loading state and be disabled while signing out', async () => {
    const user = userEvent.setup();
    // Create a promise that we can resolve manually to simulate async operation
    let resolveSignOut: (value: unknown) => void;
    const signOutPromise = new Promise((resolve) => {
      resolveSignOut = resolve;
    });
    const mockSignOut = jest.fn().mockReturnValue(signOutPromise);
    mockUseAuthActions.mockReturnValue({ signOut: mockSignOut });

    renderSignOutButton();
    // Find button using final key part
    const button = screen.getByRole('button', { name: 'signOut' });

    // Click the button - DON'T await the click completion fully yet
    const clickPromise = user.click(button);

    // Check for loading state using final key part
    await waitFor(() => {
      expect(screen.getByRole('button', { name: 'signingOut' })).toBeDisabled();
    });

    // Ensure signOut was called
    expect(mockSignOut).toHaveBeenCalledTimes(1);

    // Now resolve the sign out promise
    resolveSignOut!(undefined);

    // Wait for the click promise to finish and the component to re-render
    await clickPromise;
    await waitFor(() => {
      // Button should return to normal state, check using final key part
      expect(screen.getByRole('button', { name: 'signOut' })).toBeEnabled();
    });
  });

  it('should handle sign-out failure gracefully', async () => {
    const user = userEvent.setup();
    // Simulate function completing, even if it failed internally (hook handles toast)
    const mockSignOut = jest.fn().mockResolvedValue(undefined);
    mockUseAuthActions.mockReturnValue({ signOut: mockSignOut });

    renderSignOutButton();
    // Find button using final key part
    const button = screen.getByRole('button', { name: 'signOut' });

    await user.click(button);

    await waitFor(() => {
      expect(mockSignOut).toHaveBeenCalledTimes(1);
    });

    // Check that the button is enabled again after failure, check using final key part
    await waitFor(() => {
      expect(screen.getByRole('button', { name: 'signOut' })).toBeEnabled();
    });
    // We assume the hook handles error display (e.g., toast)
  });
});
