import '@testing-library/jest-dom';

// Augment the global type for the act environment flag
declare global {
  // eslint-disable-next-line no-var
  var IS_REACT_ACT_ENVIRONMENT: boolean;
}

// Explicitly set the React 18+ act environment flag
global.IS_REACT_ACT_ENVIRONMENT = true;

jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
    replace: jest.fn(),
    prefetch: jest.fn(),
  }),
  usePathname: () => '/',
  useSearchParams: () => new URLSearchParams(),
}));

jest.mock('next-intl', () => ({
  useTranslations: (namespace?: string) => (key: string) =>
    namespace ? `${namespace}.${key}` : key,
}));

// Remove the global mock for next-intl
// jest.mock('next-intl', () => ({
//   useTranslations: jest.fn(() => (key: string) => key.split('.').pop() || key),
//   useLocale: jest.fn(() => 'en'),
//   // Add other exports if needed by any component, e.g.:
//   // NextIntlClientProvider: ({ children }: { children: React.ReactNode }) => <>{children}</>,
// }));

// Add other global mocks or setup here if needed
