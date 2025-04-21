import React from 'react';

import LocaleLayout, { generateStaticParams } from '@/app/[locale]/layout';
import { Locale, hasLocale } from 'next-intl';
import { setRequestLocale } from 'next-intl/server';
import { notFound } from 'next/navigation';

jest.mock('next-intl', () => ({
  NextIntlClientProvider: ({ children }: { children: React.ReactNode }) => <>{children}</>,
  hasLocale: jest.fn(),
}));

jest.mock('next-intl/server', () => ({
  setRequestLocale: jest.fn(),
}));

jest.mock('next/navigation', () => ({
  notFound: jest.fn(),
}));

jest.mock('@/i18n/routing', () => ({
  routing: {
    locales: ['en', 'ru'],
  },
}));

jest.mock('@/components/Header', () => ({
  Header: () => <div data-testid='header'>Header Mock</div>,
}));

jest.mock('@/features/footer/footer', () => ({
  Footer: () => <div data-testid='footer'>Footer Mock</div>,
}));

jest.mock('@/components/HydrationErrorHandler', () => ({
  __esModule: true,
  default: () => <div data-testid='hydration-error-handler'>Hydration Error Handler Mock</div>,
}));

jest.mock('@/providers/AuthenticationProvider', () => ({
  AuthenticationProvider: ({ children }: { children: React.ReactNode }) => (
    <div data-testid='auth-provider'>{children}</div>
  ),
}));

jest.mock('sonner', () => ({
  Toaster: () => <div data-testid='toaster'>Toaster Mock</div>,
}));

jest.mock('next/font/google', () => ({
  Geist: jest.fn().mockReturnValue({
    variable: 'mock-geist-variable',
  }),
  Geist_Mono: jest.fn().mockReturnValue({
    variable: 'mock-geist-mono-variable',
  }),
}));

describe('LocaleLayout', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (hasLocale as jest.Mock).mockReturnValue(true);
  });

  it('renders the layout with correct HTML structure', async () => {
    const mockChildren = <div>Test Content</div>;
    const mockParams = Promise.resolve({ locale: 'en' as Locale });

    const result = await LocaleLayout({ children: mockChildren, params: mockParams });

    // Check html and body structure
    expect(result.type).toBe('html');
    expect(result.props.lang).toBe('en');
    expect(result.props.suppressHydrationWarning).toBe(true);

    const body = result.props.children;
    expect(body.type).toBe('body');
    expect(body.props.className).toContain('mock-geist-variable');
    expect(body.props.className).toContain('mock-geist-mono-variable');
    expect(body.props.suppressHydrationWarning).toBe(true);
  });

  it('calls setRequestLocale with the provided locale', async () => {
    const mockParams = Promise.resolve({ locale: 'ru' as Locale });
    await LocaleLayout({ children: <div>Test</div>, params: mockParams });

    expect(setRequestLocale).toHaveBeenCalledWith('ru');
  });

  it('calls notFound if locale is invalid', async () => {
    (hasLocale as jest.Mock).mockReturnValue(false);
    const mockParams = Promise.resolve({ locale: 'invalid-locale' as Locale });

    await LocaleLayout({ children: <div>Test</div>, params: mockParams });

    expect(notFound).toHaveBeenCalled();
  });

  it('generates static params for supported locales', () => {
    const params = generateStaticParams();
    expect(params).toEqual([{ locale: 'en' }, { locale: 'ru' }]);
  });
});
