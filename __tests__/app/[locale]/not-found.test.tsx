import React from 'react';

import NotFoundPage, { generateMetadata } from '@/app/[locale]/not-found';
import { render, screen } from '@testing-library/react';

// --- Mocks ---

// Mock next-intl/server
jest.mock('next-intl/server', () => ({
  getTranslations: jest.fn().mockImplementation(async (options) => {
    const { namespace } = options;
    // Simplified mock 't' function
    const t = (key: string) => {
      const translations: Record<string, Record<string, string>> = {
        NotFoundPage: {
          title: 'Test Page Not Found',
          description: 'Test description for not found.',
          backToHome: 'Test Go Home',
          metadataTitle: 'Test 404',
        },
      };
      return translations[namespace]?.[key] || `${namespace}.${key}`;
    };
    return Promise.resolve(t);
  }),
  getLocale: jest.fn().mockResolvedValue('en'), // Mock locale
  setRequestLocale: jest.fn(), // Mock this as it's called but we don't need its effect
}));

// Mock i18n navigation Link
jest.mock('@/i18n/navigation', () => ({
  Link: jest.fn(({ href, children, ...props }) => (
    <a href={href} {...props}>
      {children}
    </a>
  )),
}));

// Mock paths
jest.mock('@/paths', () => ({
  homePath: jest.fn(() => '/test-home'),
}));

// Mock Button to render its child directly for simplicity
jest.mock('@/components/ui/button', () => ({
  Button: jest.fn(({ asChild, children, ...props }) => {
    if (asChild) {
      return React.cloneElement(children as React.ReactElement, props);
    }
    return <button {...props}>{children}</button>;
  }),
}));

// --- Tests ---

describe('NotFoundPage', () => {
  const mockParams = { locale: 'en' };

  it('should generate correct metadata', async () => {
    const metadata = await generateMetadata({ params: Promise.resolve(mockParams) });
    expect(metadata.title).toBe('Test 404');
  });

  it('should render the title, description, and link', async () => {
    // Render the async component with mock params
    render(await NotFoundPage({ params: Promise.resolve(mockParams) }));

    // Check for translated texts
    expect(screen.getByRole('heading', { name: /Test Page Not Found/i })).toBeInTheDocument();
    expect(screen.getByText('Test description for not found.')).toBeInTheDocument();

    // Check for the link rendered by the mocked Button and Link
    const link = screen.getByRole('link', { name: /Test Go Home/i });
    expect(link).toBeInTheDocument();
    expect(link).toHaveAttribute('href', '/test-home');
  });
});
