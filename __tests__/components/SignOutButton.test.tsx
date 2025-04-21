import React from 'react';

import { SignOutButton } from '@/components/SignOutButton';
import { useAuthActions } from '@/hooks/useAuthActions';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';

jest.mock('@/hooks/useAuthActions', () => ({
  useAuthActions: jest.fn(),
}));

jest.mock('next-intl', () => ({
  useTranslations: () => (key: string) => {
    const translations: Record<string, string> = {
      signOut: 'Sign Out',
      signingOut: 'Signing Out...',
    };
    return translations[key] || key;
  },
}));

describe('SignOutButton Component', () => {
  let mockSignOut: jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();

    mockSignOut = jest.fn().mockResolvedValue(undefined);

    (useAuthActions as jest.Mock).mockReturnValue({
      signOut: mockSignOut,
    });
  });

  test('renders the sign out button correctly', () => {
    render(<SignOutButton />);

    const button = screen.getByRole('button', { name: 'Sign Out' });
    expect(button).toBeInTheDocument();
    expect(button).not.toBeDisabled();
  });

  test('disables button and shows loading state during sign out', async () => {
    mockSignOut.mockImplementation(() => new Promise((resolve) => setTimeout(resolve, 10)));

    render(<SignOutButton />);

    const button = screen.getByRole('button', { name: 'Sign Out' });
    fireEvent.click(button);

    expect(screen.getByRole('button', { name: 'Signing Out...' })).toBeDisabled();

    await waitFor(() => {
      expect(screen.getByRole('button', { name: 'Sign Out' })).not.toBeDisabled();
    });

    expect(mockSignOut).toHaveBeenCalledTimes(1);
  });

  test('returns to normal state after sign out completes', async () => {
    render(<SignOutButton />);

    const button = screen.getByRole('button', { name: 'Sign Out' });
    fireEvent.click(button);

    await waitFor(() => {
      expect(screen.getByRole('button', { name: 'Sign Out' })).not.toBeDisabled();
    });

    expect(mockSignOut).toHaveBeenCalledTimes(1);
  });
});
