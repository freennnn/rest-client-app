import React from 'react';

// Import from the 404 page itself
import NotFoundPage, { generateMetadata } from '@/app/[locale]/404/page';
import { render, screen } from '@testing-library/react';

// --- Mocks (Copied from not-found.test.tsx as dependencies are the same via re-export) ---

// Mock next-intl/server
jest.mock('next-intl/server', () => ({
  getTranslations: jest.fn().mockImplementation(async (options) => {
    const { namespace } = options;
    const t = (key: string) => {
      const translations: Record<string, Record<string, string>> = {
        NotFoundPage: {
          // Still uses NotFoundPage namespace internally
          title: 'Test 404 Page Not Found',
          description: 'Test 404 description.',
          backToHome: 'Test 404 Go Home',
          metadataTitle: 'Test Metadata 404',
        },
      };
      return translations[namespace]?.[key] || `${namespace}.${key}`;
    };
    return Promise.resolve(t);
  }),
  getLocale: jest.fn().mockResolvedValue('en'),
  setRequestLocale: jest.fn(),
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
  homePath: jest.fn(() => '/test-404-home'),
}));

// Mock Button
jest.mock('@/components/ui/button', () => ({
  Button: jest.fn(({ asChild, children, ...props }) => {
    if (asChild) {
      // Attempt to render the child, assuming it's a single element
      try {
        return React.cloneElement(children as React.ReactElement, props);
      } catch {
        // Fallback if cloning fails (e.g., children is not a valid element)
        return <div {...props}>{children}</div>;
      }
    }
    return <button {...props}>{children}</button>;
  }),
}));

// --- Tests ---

describe('404 Page (via re-export)', () => {
  const mockParams = { locale: 'en' };

  it('should generate correct metadata', async () => {
    // Test the re-exported generateMetadata
    const metadata = await generateMetadata({ params: Promise.resolve(mockParams) });
    expect(metadata.title).toBe('Test Metadata 404');
  });

  it('should render the title, description, and link', async () => {
    // Test the re-exported default component
    render(await NotFoundPage({ params: Promise.resolve(mockParams) }));

    // Check for translated texts
    expect(screen.getByRole('heading', { name: /Test 404 Page Not Found/i })).toBeInTheDocument();
    expect(screen.getByText('Test 404 description.')).toBeInTheDocument();

    // Check for the link
    const link = screen.getByRole('link', { name: /Test 404 Go Home/i });
    expect(link).toBeInTheDocument();
    expect(link).toHaveAttribute('href', '/test-404-home');
  });
});
