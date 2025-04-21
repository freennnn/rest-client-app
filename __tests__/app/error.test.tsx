import React from 'react';

import ErrorComponent from '@/app/[locale]/error';
import { useRouter } from '@/i18n/navigation';
import { homePath } from '@/paths';
import { fireEvent, render, screen } from '@testing-library/react';
import { useTranslations } from 'next-intl';

jest.mock('@/i18n/navigation', () => ({
  useRouter: jest.fn(),
}));

jest.mock('next-intl', () => ({
  useTranslations: jest.fn(),
}));

jest.mock('@/paths', () => ({
  homePath: jest.fn(() => '/mock-home'),
}));

describe('ErrorComponent', () => {
  const mockUseRouter = useRouter as jest.MockedFunction<typeof useRouter>;
  const mockUseTranslations = useTranslations as jest.MockedFunction<typeof useTranslations>;

  const mockT = jest.fn((key: string) => {
    const translations: Record<string, string> = {
      title: 'Error Title',
      description: 'Error Description',
      backToHome: 'Back to Home',
    };
    return translations[key] || key;
  });

  beforeEach(() => {
    jest.clearAllMocks();

    mockUseRouter.mockReturnValue({
      push: jest.fn(),
    } as Partial<ReturnType<typeof useRouter>> as ReturnType<typeof useRouter>);

    mockUseTranslations.mockReturnValue(mockT);
  });

  test('renders the error title and description', () => {
    render(<ErrorComponent error={new Error()} />);

    expect(screen.getByRole('heading', { name: 'Error Title' })).toBeInTheDocument();
    expect(screen.getByText('Error Description')).toBeInTheDocument();
  });

  test('displays the error message when provided', () => {
    const errorMessage = 'Test error message';
    render(<ErrorComponent error={new Error(errorMessage)} />);

    expect(screen.getByText(`Error Description (${errorMessage})`)).toBeInTheDocument();
  });

  test('does not display error message parentheses when error has no message', () => {
    const error = new Error();
    error.message = '';

    render(<ErrorComponent error={error} />);

    expect(screen.getByText('Error Description')).toBeInTheDocument();
    expect(screen.queryByText(/\(\)/)).not.toBeInTheDocument();
  });

  test('navigates to home path when button is clicked', () => {
    const mockPush = jest.fn();
    mockUseRouter.mockReturnValue({
      push: mockPush,
    } as Partial<ReturnType<typeof useRouter>> as ReturnType<typeof useRouter>);

    render(<ErrorComponent error={new Error()} />);

    const backButton = screen.getByRole('button', { name: 'Back to Home' });
    fireEvent.click(backButton);

    expect(mockPush).toHaveBeenCalledWith('/mock-home');
    expect(homePath).toHaveBeenCalled();
  });

  test('includes error digest if provided', () => {
    const errorWithDigest = new Error('Digest test error') as Error & { digest: string };
    errorWithDigest.digest = '123abc';

    render(<ErrorComponent error={errorWithDigest} />);

    expect(screen.getByText(/Digest test error/)).toBeInTheDocument();
  });
});
