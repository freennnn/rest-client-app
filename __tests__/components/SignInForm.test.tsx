import React from 'react';

import { SignInForm } from '@/components/SignInForm';
import { useAuthActions } from '@/hooks/useAuthActions';
import { signUpPath } from '@/paths';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';

jest.mock('@/i18n/navigation', () => ({
  Link: ({ href, children, ...props }: { href: string; children: React.ReactNode }) => (
    <a href={href} {...props}>
      {children}
    </a>
  ),
}));

jest.mock('@/hooks/useAuthActions', () => ({
  useAuthActions: jest.fn(),
}));

jest.mock('next-intl', () => ({
  useTranslations: () => (key: string) => {
    const translations: Record<string, string> = {
      loginTitle: 'Sign In',
      loginDescription: 'Welcome back! Please enter your details to sign in.',
      email: 'Email',
      password: 'Password',
      loggingIn: 'Signing in...',
      signIn: 'Sign In',
      noAccount: "Don't have an account?",
      signUp: 'Sign Up',
    };
    return translations[key] || key;
  },
}));

jest.mock('@/paths', () => ({
  signUpPath: jest.fn().mockReturnValue('/sign-up'),
}));

jest.mock('@/components/ui/TranslateFormMessage', () => ({
  TranslatedFormMessage: ({ children }: { children: React.ReactNode }) => (
    <div data-testid='form-error'>{children}</div>
  ),
}));

jest.mock('@hookform/resolvers/zod', () => ({
  zodResolver: () => (data: { email?: string; password?: string }) => {
    const errors: Record<string, { message: string }> = {};

    if (!data.email) {
      errors.email = { message: 'auth.emailRequired' };
    } else if (!data.email.includes('@')) {
      errors.email = { message: 'auth.emailInvalid' };
    }

    if (!data.password) {
      errors.password = { message: 'auth.passwordRequired' };
    } else if (data.password.length < 8) {
      errors.password = { message: 'auth.passwordTooShort' };
    }

    return {
      values: data,
      errors: Object.keys(errors).length ? { ...errors } : {},
    };
  },
}));

describe('SignInForm Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();

    (useAuthActions as jest.Mock).mockReturnValue({
      signIn: jest.fn().mockResolvedValue(undefined),
      isPending: false,
    });
  });

  test('renders the signin form correctly', () => {
    render(<SignInForm />);

    expect(screen.getByRole('button', { name: 'Sign In' })).toBeInTheDocument();
    expect(
      screen.getByText('Welcome back! Please enter your details to sign in.')
    ).toBeInTheDocument();
    expect(screen.getByLabelText('Email')).toBeInTheDocument();
    expect(screen.getByLabelText('Password')).toBeInTheDocument();
    expect(screen.getByText("Don't have an account?")).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Sign Up' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Sign Up' })).toHaveAttribute('href', '/sign-up');
  });

  test('initializes with provided email', () => {
    render(<SignInForm email='test@example.com' />);

    expect(screen.getByLabelText('Email')).toHaveValue('test@example.com');
    expect(screen.getByLabelText('Password')).toHaveValue('');
  });

  test('shows loading state during form submission', async () => {
    (useAuthActions as jest.Mock).mockReturnValue({
      signIn: jest
        .fn()
        .mockImplementation(() => new Promise((resolve) => setTimeout(resolve, 500))),
      isPending: true,
    });

    render(<SignInForm />);

    expect(screen.getByRole('button', { name: 'Signing in...' })).toBeDisabled();
    expect(screen.getByLabelText('Email')).toBeDisabled();
    expect(screen.getByLabelText('Password')).toBeDisabled();
  });

  test('validates empty form fields on submission', async () => {
    render(<SignInForm />);

    fireEvent.click(screen.getByRole('button', { name: 'Sign In' }));

    await waitFor(() => {
      expect(screen.getAllByTestId('form-error')).toHaveLength(2);
    });
  });

  test('validates email format', async () => {
    render(<SignInForm />);

    fireEvent.change(screen.getByLabelText('Email'), { target: { value: 'invalid-email' } });

    fireEvent.click(screen.getByRole('button', { name: 'Sign In' }));

    await waitFor(() => {
      const errors = screen.getAllByTestId('form-error');
      expect(errors[0]).toHaveTextContent('auth.emailInvalid');
    });
  });

  test('validates password length', async () => {
    render(<SignInForm />);

    fireEvent.change(screen.getByLabelText('Email'), { target: { value: 'valid@example.com' } });
    fireEvent.change(screen.getByLabelText('Password'), { target: { value: 'short' } });

    fireEvent.click(screen.getByRole('button', { name: 'Sign In' }));

    await waitFor(() => {
      const errors = screen.getAllByTestId('form-error');
      expect(errors[0]).toHaveTextContent('auth.passwordTooShort');
    });
  });

  test('submits form with valid data', async () => {
    const mockSignIn = jest.fn().mockResolvedValue(undefined);

    (useAuthActions as jest.Mock).mockReturnValue({
      signIn: mockSignIn,
      isPending: false,
    });

    render(<SignInForm />);

    fireEvent.change(screen.getByLabelText('Email'), { target: { value: 'valid@example.com' } });
    fireEvent.change(screen.getByLabelText('Password'), { target: { value: 'password123' } });

    fireEvent.click(screen.getByRole('button', { name: 'Sign In' }));

    await waitFor(() => {
      expect(mockSignIn).toHaveBeenCalledWith('valid@example.com', 'password123');
    });
  });

  test('shows link to sign up page', () => {
    render(<SignInForm />);

    const signUpLink = screen.getByRole('link', { name: 'Sign Up' });
    expect(signUpLink).toHaveAttribute('href', '/sign-up');
    expect(signUpPath).toHaveBeenCalled();
  });
});
