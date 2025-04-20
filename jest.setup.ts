import '@testing-library/jest-dom';

declare global {
  const jest: (typeof import('@jest/globals'))['jest'];
}

jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
    replace: jest.fn(),
    prefetch: jest.fn(),
  }),
  usePathname: () => '/',
  useSearchParams: () => new URLSearchParams(),
}));
