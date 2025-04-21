import React from 'react';

import ErrorPage from '@/app/[locale]/error/page';
import { render, screen } from '@testing-library/react';

// --- Mocks ---

// Mock next-intl/server
jest.mock('next-intl/server', () => ({
  getTranslations: jest.fn().mockImplementation(async (namespace) => {
    const t = (key: string, options?: { error?: string }) => {
      const translations: Record<string, Record<string, string>> = {
        error: {
          title: 'Test Auth Error',
          withError: 'Test Error Occurred: {error}',
          withoutError: 'Test Generic Auth Error.',
        },
      };
      let message = translations[namespace]?.[key] || `${namespace}.${key}`;
      if (options?.error) {
        message = message.replace('{error}', options.error);
      }
      return message;
    };
    return Promise.resolve(t);
  }),
}));

// Mock Shadcn UI Card components
jest.mock('@/components/ui/card', () => ({
  Card: ({ children, ...props }: { children: React.ReactNode }) => (
    <div {...props} data-testid='mock-card'>
      {children}
    </div>
  ),
  CardHeader: ({ children, ...props }: { children: React.ReactNode }) => (
    <div {...props} data-testid='mock-card-header'>
      {children}
    </div>
  ),
  CardTitle: ({ children, ...props }: { children: React.ReactNode }) => (
    <h2 {...props} data-testid='mock-card-title'>
      {children}
    </h2>
  ),
  CardContent: ({ children, ...props }: { children: React.ReactNode }) => (
    <div {...props} data-testid='mock-card-content'>
      {children}
    </div>
  ),
}));

// --- Tests ---

describe('Error Page Component', () => {
  it('should render the generic error message when no error param is present', async () => {
    // Pass undefined for error, cast props object to expected type via unknown
    const props = {
      searchParams: Promise.resolve({ error: undefined }),
    } as unknown as { searchParams: Promise<{ error: string }> };
    render(await ErrorPage(props));

    expect(screen.getByTestId('mock-card-title')).toHaveTextContent('Test Auth Error');
    expect(screen.getByTestId('mock-card-content')).toHaveTextContent('Test Generic Auth Error.');
    expect(screen.queryByText(/Test Error Occurred:/)).not.toBeInTheDocument();
  });

  it('should render the specific error message when an error param is present', async () => {
    const specificError = 'Something went wrong!';
    const props = { searchParams: Promise.resolve({ error: specificError }) }; // No casting needed here
    render(await ErrorPage(props));

    expect(screen.getByTestId('mock-card-title')).toHaveTextContent('Test Auth Error');
    expect(screen.getByTestId('mock-card-content')).toHaveTextContent(
      `Test Error Occurred: ${specificError}`
    );
    expect(screen.queryByText('Test Generic Auth Error.')).not.toBeInTheDocument();
  });

  it('should render the generic error message when error param is an empty string (falsy)', async () => {
    const props = { searchParams: Promise.resolve({ error: '' }) }; // No casting needed here
    render(await ErrorPage(props));

    expect(screen.getByTestId('mock-card-title')).toHaveTextContent('Test Auth Error');
    // Expect the generic message because empty string is falsy
    expect(screen.getByTestId('mock-card-content')).toHaveTextContent('Test Generic Auth Error.');
    expect(screen.queryByText(/Test Error Occurred:/)).not.toBeInTheDocument();
  });
});
