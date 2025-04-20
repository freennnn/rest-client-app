import React from 'react';
import { act } from 'react';

import { SignInForm } from '@/components/SignInForm';
import { useAuthActions } from '@/hooks/useAuthActions';
// import messages from '@/messages/en.json'; // Removed: No longer needed with mock
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

// Mock the useAuthActions hook
jest.mock('@/hooks/useAuthActions');
const mockUseAuthActions = useAuthActions as jest.Mock;

// Mock @/i18n/navigation completely
jest.mock('@/i18n/navigation', () => ({
  // Remove: ...jest.requireActual('@/i18n/navigation'),
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
  // Add other exports from @/i18n/navigation if needed
}));

// Mock next-intl completely, without requireActual
jest.mock('next-intl', () => ({
  // Provide mocks for everything potentially imported from 'next-intl'
  useTranslations: () => (key: string) => {
    // Return only the final part of the key (after the last dot)
    const keyParts = key.split('.');
    return keyParts[keyParts.length - 1];
  },
  useLocale: () => 'en',
  // Provide a basic mock Provider if needed by the test setup
  NextIntlClientProvider: ({ children }: { children: React.ReactNode }) => <>{children}</>,
  // Add other exports if they are ever imported from 'next-intl' directly
  // e.g., Link, useRouter, usePathname (though often imported from @/i18n/navigation)
}));

// Mock sonner toast
jest.mock('sonner', () => ({
  toast: {
    success: jest.fn(),
    error: jest.fn(),
    info: jest.fn(),
    warning: jest.fn(),
  },
}));

// Helper function to render with providers
const renderSignInForm = (email?: string) => {
  // No longer need NextIntlClientProvider wrapper due to the mock implementation
  return render(<SignInForm email={email} />);
};

describe('SignInForm', () => {
  // Reset mocks before each test
  beforeEach(() => {
    jest.clearAllMocks();
    // Default mock implementation (can be overridden in specific tests)
    mockUseAuthActions.mockReturnValue({
      signIn: jest.fn().mockResolvedValue(undefined), // Default to successful sign-in
      isPending: false,
    });
  });

  it('should render the sign-in form correctly', () => {
    renderSignInForm();

    // Check for title and description using final key part
    expect(screen.getByText('loginTitle')).toBeInTheDocument();
    expect(screen.getByText('loginDescription')).toBeInTheDocument();

    // Check for form fields using final key part
    expect(screen.getByLabelText('email')).toBeInTheDocument();
    expect(screen.getByLabelText('password')).toBeInTheDocument();

    // Check for submit button using final key part
    expect(screen.getByRole('button', { name: 'signIn' })).toBeInTheDocument();

    // Check for sign-up link using final key part
    expect(screen.getByText(/noAccount/)).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'signUp' })).toBeInTheDocument();
  });

  it('should call signIn on successful form submission', async () => {
    const user = userEvent.setup();
    const mockSignIn = jest.fn().mockResolvedValue(undefined);
    mockUseAuthActions.mockReturnValue({
      signIn: mockSignIn,
      isPending: false,
    });

    renderSignInForm();

    const emailInput = screen.getByLabelText('email');
    const passwordInput = screen.getByLabelText('password');
    const submitButton = screen.getByRole('button', { name: 'signIn' });

    await user.type(emailInput, 'test@example.com');
    await user.type(passwordInput, 'Password123!');
    await user.click(submitButton);

    await waitFor(() => {
      expect(mockSignIn).toHaveBeenCalledTimes(1);
      expect(mockSignIn).toHaveBeenCalledWith('test@example.com', 'Password123!');
    });
  });

  it('should display loading state when submitting', async () => {
    const user = userEvent.setup();
    let resolveSignIn: (value: unknown) => void;
    const signInPromise = new Promise((resolve) => {
      resolveSignIn = resolve;
    });
    const mockSignIn = jest.fn().mockReturnValue(signInPromise);

    // Initial state of the mock
    mockUseAuthActions.mockReturnValue({ signIn: mockSignIn, isPending: false });

    // Render the component
    const { rerender } = render(<SignInForm />); // Use rerender

    const emailInput = screen.getByLabelText('email');
    const passwordInput = screen.getByLabelText('password');

    await user.type(emailInput, 'test@example.com');
    await user.type(passwordInput, 'Password123!');

    // --- Simulate state change BEFORE checking loading state ---
    // Wrap state update and rerender in act
    act(() => {
      mockUseAuthActions.mockReturnValue({ signIn: mockSignIn, isPending: true });
      rerender(<SignInForm />);
    });

    // Check the state immediately after acting
    const loadingButton = screen.getByRole('button', { name: /loggingIn/ });
    expect(loadingButton).toBeInTheDocument();
    expect(loadingButton).toBeDisabled();

    // --- Simulate state change AFTER promise resolves ---
    // Wrap state update and rerender in act
    act(() => {
      resolveSignIn!(undefined); // Resolve promise first
    });
    act(() => {
      mockUseAuthActions.mockReturnValue({ signIn: mockSignIn, isPending: false });
      rerender(<SignInForm />);
    });

    // Wait for button to become enabled again
    await waitFor(() => {
      expect(screen.getByRole('button', { name: 'signIn' })).toBeEnabled();
    });
  });

  it('should show validation errors for invalid input', async () => {
    const user = userEvent.setup();
    const mockSignIn = jest.fn();
    mockUseAuthActions.mockReturnValue({ signIn: mockSignIn, isPending: false });

    renderSignInForm();

    // Ensure component is in initial state before interacting
    await waitFor(() => {
      expect(screen.getByRole('button', { name: 'signIn' })).toBeEnabled();
    });

    const emailInput = screen.getByLabelText('email');
    const submitButton = screen.getByRole('button', { name: 'signIn' });

    // Test invalid email
    await user.type(emailInput, 'invalid-email');
    await user.click(submitButton);

    await waitFor(() => {
      // Check validation message using final key part
      expect(screen.getByText('emailInvalid')).toBeInTheDocument();
    });
    expect(mockSignIn).not.toHaveBeenCalled();

    // Clear email and test empty password
    await user.clear(emailInput);
    await user.type(emailInput, 'test@example.com'); // Valid email now
    // Leave password empty
    await user.click(submitButton);

    await waitFor(() => {
      // Check validation message using final key part
      expect(screen.getByText('passwordMinLength')).toBeInTheDocument();
    });
    expect(mockSignIn).not.toHaveBeenCalled();
  });

  // Test for sign-in failure (e.g., wrong password)
  it('should allow submission even if credentials might be wrong (hook handles logic)', async () => {
    const user = userEvent.setup();
    // Mock signIn to resolve successfully - we are testing the form submission itself,
    // not the hook's internal error handling here.
    const mockSignIn = jest.fn().mockResolvedValue(undefined);

    // Initial state: isPending is false via beforeEach
    mockUseAuthActions.mockReturnValue({ signIn: mockSignIn, isPending: false });

    render(<SignInForm />);

    const emailInput = screen.getByLabelText('email');
    const passwordInput = screen.getByLabelText('password');
    const submitButton = screen.getByRole('button', { name: 'signIn' });

    const wrongEmail = 'wrong@example.com';
    const wrongPassword = 'WrongPassword123!';

    await user.type(emailInput, wrongEmail);
    await user.type(passwordInput, wrongPassword);

    // Click the ENABLED button
    await user.click(submitButton);

    // Wait for the mock function call
    await waitFor(() => {
      expect(mockSignIn).toHaveBeenCalledTimes(1);
      expect(mockSignIn).toHaveBeenCalledWith(wrongEmail, wrongPassword);
    });

    // Wait for the button to become enabled again (signifying the async operation finished)
    await waitFor(() => {
      expect(screen.getByRole('button', { name: 'signIn' })).toBeEnabled();
    });
    // Assume component/hook handles the actual success/failure side effects (like toast)
  });
});
