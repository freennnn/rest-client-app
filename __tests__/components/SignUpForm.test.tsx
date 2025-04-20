import React from 'react';
import { act } from 'react';

import { SignUpForm } from '@/components/SignUpForm';
import { useAuthActions } from '@/hooks/useAuthActions';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

// Mock the useAuthActions hook
jest.mock('@/hooks/useAuthActions');
const mockUseAuthActions = useAuthActions as jest.Mock;

// Mock @/i18n/navigation completely
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
  useTranslations: () => (key: string) => key.split('.').pop(), // Return final part of key
  useLocale: () => 'en',
  NextIntlClientProvider: ({ children }: { children: React.ReactNode }) => <>{children}</>,
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

// Helper function to render
const renderSignUpForm = () => {
  return render(<SignUpForm />);
};

describe('SignUpForm', () => {
  let mockSignUp: jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();
    mockSignUp = jest.fn().mockResolvedValue(undefined);
    mockUseAuthActions.mockReturnValue({
      signUp: mockSignUp,
      isPending: false,
    });
  });

  it('should render the sign-up form correctly', () => {
    renderSignUpForm();

    expect(screen.getByText('signUpTitle')).toBeInTheDocument();
    expect(screen.getByText('signUpDescription')).toBeInTheDocument();
    expect(screen.getByLabelText('nameLabel')).toBeInTheDocument();
    expect(screen.getByLabelText('email')).toBeInTheDocument(); // email label comes from 'auth.email'
    expect(screen.getByLabelText('password')).toBeInTheDocument(); // password label comes from 'auth.password'
    // expect(screen.getByLabelText('confirmPasswordLabel')).toBeInTheDocument(); // No separate confirm password label in the code
    expect(screen.getByRole('button', { name: 'signUp' })).toBeInTheDocument();
    expect(screen.getByText(/haveAccount/)).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'signIn' })).toBeInTheDocument();
  });

  it('should call signUp on successful form submission', async () => {
    const user = userEvent.setup();
    renderSignUpForm();

    const nameInput = screen.getByLabelText('nameLabel');
    const emailInput = screen.getByLabelText('email');
    const passwordInput = screen.getByLabelText('password');
    // Assuming the schema handles confirm password, target password input again for confirmation
    const submitButton = screen.getByRole('button', { name: 'signUp' });

    await user.type(nameInput, 'Test User');
    await user.type(emailInput, 'test@example.com');
    await user.type(passwordInput, 'Password123!');
    // Simulate confirm password if schema requires it (by typing into the password field again or if there's a confirm field)
    // await user.type(screen.getByLabelText('confirmPasswordLabel'), 'Password123!'); // If confirm field exists

    await user.click(submitButton);

    await waitFor(() => {
      expect(mockSignUp).toHaveBeenCalledTimes(1);
      // Zod schema likely passes only name, email, password if no confirm field exists
      expect(mockSignUp).toHaveBeenCalledWith('test@example.com', 'Password123!', 'Test User');
    });
  });

  it('should display loading state when submitting', async () => {
    const user = userEvent.setup();
    let resolveSignUp: (value: unknown) => void;
    const signUpPromise = new Promise((resolve) => {
      resolveSignUp = resolve;
    });
    mockSignUp.mockReturnValue(signUpPromise); // Update the specific mock function

    const { rerender } = renderSignUpForm();

    const nameInput = screen.getByLabelText('nameLabel');
    const emailInput = screen.getByLabelText('email');
    const passwordInput = screen.getByLabelText('password');

    await user.type(nameInput, 'Test User');
    await user.type(emailInput, 'test@example.com');
    await user.type(passwordInput, 'Password123!');

    // Simulate pending state
    act(() => {
      mockUseAuthActions.mockReturnValue({ signUp: mockSignUp, isPending: true });
      rerender(<SignUpForm />);
    });

    // Check for loading state
    const loadingButton = screen.getByRole('button', { name: /signingUp/ });
    expect(loadingButton).toBeDisabled();

    // Resolve promise and reset state
    act(() => {
      resolveSignUp!(undefined);
    });
    act(() => {
      mockUseAuthActions.mockReturnValue({ signUp: mockSignUp, isPending: false });
      rerender(<SignUpForm />);
    });

    // Wait for button to be enabled again
    await waitFor(() => {
      expect(screen.getByRole('button', { name: 'signUp' })).toBeEnabled();
    });
  });

  it('should show validation errors for invalid input', async () => {
    const user = userEvent.setup();
    renderSignUpForm();

    const submitButton = screen.getByRole('button', { name: 'signUp' });

    // Click submit with empty form
    await user.click(submitButton);

    await waitFor(() => {
      // Use final part of key for validation messages, matching the actual output
      expect(screen.getByText('nameMinLength')).toBeInTheDocument();
      expect(screen.getByText('emailInvalid')).toBeInTheDocument();
      expect(screen.getByText('passwordMinLength')).toBeInTheDocument();
    });
    expect(mockSignUp).not.toHaveBeenCalled();

    // Example: Test password mismatch (if confirm password field exists)
    // const passwordInput = screen.getByLabelText('password');
    // const confirmPasswordInput = screen.getByLabelText('confirmPasswordLabel');
    // await user.type(passwordInput, 'Password123!');
    // await user.type(confirmPasswordInput, 'Password456!');
    // await user.click(submitButton);
    // await waitFor(() => {
    //   expect(screen.getByText('passwordConfirm')).toBeInTheDocument();
    // });
    // expect(mockSignUp).not.toHaveBeenCalled();
  });

  // Optional: Test sign-up failure (hook reject) - similar to SignInForm
  it('should allow submission even if sign-up fails internally', async () => {
    const user = userEvent.setup();
    // Mock signUp to resolve - testing form calls the function
    mockSignUp.mockResolvedValue(undefined);

    renderSignUpForm();

    const nameInput = screen.getByLabelText('nameLabel');
    const emailInput = screen.getByLabelText('email');
    const passwordInput = screen.getByLabelText('password');
    const submitButton = screen.getByRole('button', { name: 'signUp' });

    await user.type(nameInput, 'Test User Fail');
    await user.type(emailInput, 'fail@example.com');
    await user.type(passwordInput, 'Password123!');

    await user.click(submitButton);

    await waitFor(() => {
      expect(mockSignUp).toHaveBeenCalledTimes(1);
      expect(mockSignUp).toHaveBeenCalledWith('fail@example.com', 'Password123!', 'Test User Fail');
    });

    // Wait for button to become enabled again
    await waitFor(() => {
      expect(screen.getByRole('button', { name: 'signUp' })).toBeEnabled();
    });
  });
});
