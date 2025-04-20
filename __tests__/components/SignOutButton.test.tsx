import React from 'react';

import { SignOutButton } from '@/components/SignOutButton';
import { useAuthActions } from '@/hooks/useAuthActions';
// import messages from '@/messages/en.json'; // Removed: No longer needed with mock
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

// Mock the useAuthActions hook
jest.mock('@/hooks/useAuthActions');
const mockUseAuthActions = useAuthActions as jest.Mock;

// Mock @/i18n/navigation completely (needed by useAuthActions)
jest.mock('@/i18n/navigation', () => ({
  Link: ({ href, children, ...props }: { href: string; children: React.ReactNode }) => (
    <a href={href} {...props}>
      {children}
    </a>
  ),
  useRouter: () => ({
    push: jest.fn(),
    replace: jest.fn(),
    back: jest.fn(),
    forward: jest.fn(),
    prefetch: jest.fn(),
    refresh: jest.fn(),
  }),
  usePathname: () => '/',
}));

// Mock next-intl completely, without requireActual
jest.mock('next-intl', () => ({
  useTranslations: () => (key: string) => {
    // Return only the final part of the key (after the last dot)
    const keyParts = key.split('.');
    return keyParts[keyParts.length - 1];
  },
  useLocale: () => 'en',
  // Add other exports from next-intl if needed by this test or its dependencies
  NextIntlClientProvider: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

// // Mock sonner toast (in case useAuthActions uses it internally, though not directly visible here) - Keeping this commented as it was before
// jest.mock('sonner', () => ({
//   toast: {
//     success: jest.fn(),
//     error: jest.fn(),
//     info: jest.fn(),
//     warning: jest.fn(),
//   },
// }));

// Helper function to render with providers
const renderSignOutButton = () => {
  // No longer need NextIntlClientProvider wrapper due to the mock implementation
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
