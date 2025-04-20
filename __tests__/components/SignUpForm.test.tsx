import React from 'react';

import { SignUpForm } from '@/components/SignUpForm';
import { useAuthActions } from '@/hooks/useAuthActions';
import { signInPath } from '@/paths';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';

jest.mock('@/hooks/useAuthActions', () => ({
  useAuthActions: jest.fn(),
}));

jest.mock('@/i18n/navigation', () => ({
  Link: ({ href, children, ...props }: { href: string; children: React.ReactNode }) => (
    <a href={href} {...props}>
      {children}
    </a>
  ),
}));

// Mock the next-intl translations
jest.mock('next-intl', () => ({
  useTranslations: () => (key: string) => {
    const translations: Record<string, string> = {
      signUpTitle: 'Create an account',
      signUpDescription: 'Enter your information to create an account',
      nameLabel: 'Name',
      email: 'Email',
      password: 'Password',
      signingUp: 'Signing up...',
      signUp: 'Sign Up',
      haveAccount: 'Already have an account?',
      signIn: 'Sign In',
    };
    return translations[key] || key;
  },
}));

jest.mock('@/paths', () => ({
  signInPath: jest.fn().mockReturnValue('/sign-in'),
}));

jest.mock('@/components/ui/TranslateFormMessage', () => ({
  TranslatedFormMessage: ({ children }: { children: React.ReactNode }) => (
    <div data-testid='form-error'>{children}</div>
  ),
}));

jest.mock('@hookform/resolvers/zod', () => ({
  zodResolver: () => (data: Record<string, unknown>) => {
    const errors: Record<string, { message: string }> = {};

    if (!data.name) {
      errors.name = { message: 'auth.nameRequired' };
    }

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

describe('SignUpForm Component', () => {
  let mockSignUp: jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();

    mockSignUp = jest.fn().mockResolvedValue(undefined);

    (useAuthActions as jest.Mock).mockReturnValue({
      signUp: mockSignUp,
      isPending: false,
    });
  });

  test('renders the sign up form correctly', () => {
    render(<SignUpForm />);

    expect(screen.getByText('Create an account')).toBeInTheDocument();
    expect(screen.getByText('Enter your information to create an account')).toBeInTheDocument();
    expect(screen.getByLabelText('Name')).toBeInTheDocument();
    expect(screen.getByLabelText('Email')).toBeInTheDocument();
    expect(screen.getByLabelText('Password')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Sign Up' })).toBeInTheDocument();
    expect(screen.getByText('Already have an account?')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Sign In' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Sign In' })).toHaveAttribute('href', '/sign-in');
  });

  test('shows loading state during form submission', () => {
    (useAuthActions as jest.Mock).mockReturnValue({
      signUp: mockSignUp,
      isPending: true,
    });

    render(<SignUpForm />);

    expect(screen.getByRole('button', { name: 'Signing up...' })).toBeDisabled();
    expect(screen.getByLabelText('Name')).toBeDisabled();
    expect(screen.getByLabelText('Email')).toBeDisabled();
    expect(screen.getByLabelText('Password')).toBeDisabled();
  });

  test('validates empty form fields on submission', async () => {
    render(<SignUpForm />);

    fireEvent.click(screen.getByRole('button', { name: 'Sign Up' }));

    await waitFor(() => {
      expect(screen.getAllByTestId('form-error')).toHaveLength(3);
    });
  });

  test('validates email format', async () => {
    render(<SignUpForm />);

    fireEvent.change(screen.getByLabelText('Name'), { target: { value: 'John Doe' } });
    fireEvent.change(screen.getByLabelText('Email'), { target: { value: 'invalid-email' } });
    fireEvent.change(screen.getByLabelText('Password'), { target: { value: 'password123' } });

    fireEvent.click(screen.getByRole('button', { name: 'Sign Up' }));

    await waitFor(() => {
      const errors = screen.getAllByTestId('form-error');
      expect(errors).toHaveLength(1);
      expect(errors[0]).toHaveTextContent('auth.emailInvalid');
    });
  });

  test('validates password length', async () => {
    render(<SignUpForm />);

    fireEvent.change(screen.getByLabelText('Name'), { target: { value: 'John Doe' } });
    fireEvent.change(screen.getByLabelText('Email'), { target: { value: 'john@example.com' } });
    fireEvent.change(screen.getByLabelText('Password'), { target: { value: 'short' } });

    fireEvent.click(screen.getByRole('button', { name: 'Sign Up' }));

    await waitFor(() => {
      const errors = screen.getAllByTestId('form-error');
      expect(errors).toHaveLength(1);
      expect(errors[0]).toHaveTextContent('auth.passwordTooShort');
    });
  });

  test('submits form with valid data', async () => {
    render(<SignUpForm />);

    fireEvent.change(screen.getByLabelText('Name'), { target: { value: 'John Doe' } });
    fireEvent.change(screen.getByLabelText('Email'), { target: { value: 'john@example.com' } });
    fireEvent.change(screen.getByLabelText('Password'), { target: { value: 'password123' } });

    fireEvent.click(screen.getByRole('button', { name: 'Sign Up' }));

    await waitFor(() => {
      expect(mockSignUp).toHaveBeenCalledWith('john@example.com', 'password123', 'John Doe');
    });
  });

  test('shows link to sign in page', () => {
    render(<SignUpForm />);

    const signInLink = screen.getByRole('link', { name: 'Sign In' });
    expect(signInLink).toHaveAttribute('href', '/sign-in');
    expect(signInPath).toHaveBeenCalled();
  });
});
