import React from 'react';

import NotFound from '@/app/[locale]/not-found';
import { render, screen } from '@testing-library/react';

jest.mock('next-intl', () => ({
  useTranslations: () => (key: string) => {
    const translations: Record<string, string> = {
      'NotFound.title': '404 - Page Not Found',
      'NotFound.description': 'The page you are looking for does not exist.',
      'NotFound.button': 'Go Home',
    };
    return translations[key] || key;
  },
}));

jest.mock('@/i18n/navigation', () => ({
  Link: ({ href, children }: { href: string; children: React.ReactNode }) => (
    <a href={href}>{children}</a>
  ),
}));

describe('Not Found Component', () => {
  test('renders not found page correctly', () => {
    render(<NotFound />);

    expect(screen.getByText('404 - Page Not Found')).toBeInTheDocument();
    expect(screen.getByText('The page you are looking for does not exist.')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Go Home' })).toBeInTheDocument();
  });
});
