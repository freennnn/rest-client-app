import React from 'react';

import { Footer } from '@/features/footer/footer';
import { render, screen } from '@testing-library/react';

// Mock next-intl/server directly within the factory function
jest.mock('next-intl/server', () => ({
  getTranslations: jest.fn().mockImplementation(async (namespace: string) => {
    // Define the 't' function logic here
    const t = (key: string, options?: { year: number }) => {
      const translations: Record<string, string> = {
        copyright: '© {year} Test Client',
        builtWith: 'Built with Test Tech',
        // Add other potential keys from the namespace if needed
      };
      let translation = translations[key] || `${namespace}.${key}`; // Return key with namespace if not found

      if (options && 'year' in options && typeof options.year === 'number') {
        translation = translation.replace('{year}', options.year.toString());
      }
      return translation;
    };
    // getTranslations returns a Promise resolving to the 't' function
    return Promise.resolve(t);
  }),
}));

// Mock next/image
jest.mock(
  'next/image',
  () =>
    function Image({ src, alt }: { src: string; alt: string }) {
      // eslint-disable-next-line @next/next/no-img-element
      return <img src={src} alt={alt} />;
    }
);

// Mock next/link
jest.mock(
  'next/link',
  () =>
    function Link({ href, children }: { href: string; children: React.ReactNode }) {
      return <a href={href}>{children}</a>;
    }
);

// Mock SVG import
jest.mock('@public/rs-logo.svg', () => 'rs-logo.svg');

describe('Footer Component', () => {
  it('should render copyright information with the current year', async () => {
    const currentYear = new Date().getFullYear();
    // Render the async component
    render(await Footer());

    // Check for the copyright text using the mocked translation
    expect(screen.getByText(`© ${currentYear} Test Client`)).toBeInTheDocument();
  });

  it("should render the 'built with' information", async () => {
    // Render the async component
    render(await Footer());

    // Check for the "built with" text using the mocked translation
    expect(screen.getByText('Built with Test Tech')).toBeInTheDocument();
  });

  it('should render links to RS School and developer GitHub profiles', async () => {
    render(await Footer());

    expect(screen.getByRole('link', { name: /RSschool/i })).toHaveAttribute(
      'href',
      'https://rs.school/courses/reactjs'
    );
    expect(screen.getByRole('link', { name: /@freennnn/i })).toHaveAttribute(
      'href',
      'https://github.com/freennnn'
    );
    expect(screen.getByRole('link', { name: /@RUBBOSS/i })).toHaveAttribute(
      'href',
      'https://github.com/RUBBOSS'
    );
    expect(screen.getByRole('link', { name: /@magadanov/i })).toHaveAttribute(
      'href',
      'https://github.com/magadanov'
    );
  });
});
