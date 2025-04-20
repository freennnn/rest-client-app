import React from 'react';

import IndexPage from '@/app/[locale]/page';
import { User } from '@supabase/supabase-js';
import { render, screen } from '@testing-library/react';
import { Locale } from 'next-intl';

type GetUserResponseMock = { data: { user: Partial<User> | null } } | { data: null; error: Error };

jest.mock('@/utils/supabase/server', () => ({
  createClient: jest.fn().mockResolvedValue({
    auth: {
      getUser: jest.fn().mockResolvedValue({ data: { user: null } } as GetUserResponseMock),
    },
  }),
}));

jest.mock('next-intl/server', () => ({
  getTranslations: jest.fn().mockResolvedValue((key: string, values?: object) => {
    if (key === 'welcomeBack' && values && 'name' in values) {
      const name = typeof values.name === 'string' ? values.name : 'user';
      return `Mock Welcome Back, ${name}!`;
    }
    return `Mock ${key}`;
  }),
  setRequestLocale: jest.fn(),
}));

jest.mock('@/i18n/navigation', () => ({
  Link: ({ href, children, ...props }: { href: string; children: React.ReactNode }) => (
    <a href={href} {...props}>
      {children}
    </a>
  ),
}));

jest.mock('@/paths', () => ({
  signInPath: jest.fn(() => '/mock/signin'),
  signUpPath: jest.fn(() => '/mock/signup'),
}));

const mockParams = { locale: 'en' as Locale };

describe('IndexPage', () => {
  const mockSupabaseAuthState = async (user: Partial<User> | null) => {
    const { createClient } = await import('@/utils/supabase/server');
    (createClient as jest.Mock).mockResolvedValue({
      auth: {
        getUser: jest.fn().mockResolvedValue({ data: { user } } as GetUserResponseMock),
      },
    });
  };

  beforeEach(async () => {
    jest.clearAllMocks();
    await mockSupabaseAuthState(null);
    const { setRequestLocale, getTranslations } = await import('next-intl/server');
    (setRequestLocale as jest.Mock).mockClear();
    (getTranslations as jest.Mock).mockClear();
    (getTranslations as jest.Mock).mockResolvedValue((key: string, values?: object) => {
      if (key === 'welcomeBack' && values && 'name' in values) {
        const name = typeof values.name === 'string' ? values.name : 'user';
        return `Mock Welcome Back, ${name}!`;
      }
      return `Mock ${key}`;
    });
  });

  it('renders correctly for unauthenticated users', async () => {
    await mockSupabaseAuthState(null);
    const PageComponent = await IndexPage({ params: Promise.resolve(mockParams) });
    render(PageComponent);

    expect(screen.getByRole('heading', { name: /Mock title/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /Mock signIn/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /Mock signUp/i })).toBeInTheDocument();
    expect(screen.queryByRole('heading', { name: /Mock Welcome Back/i })).not.toBeInTheDocument();
    const { setRequestLocale } = await import('next-intl/server');
    expect(setRequestLocale).toHaveBeenCalledWith('en');
  });

  it('renders correctly for authenticated users', async () => {
    const mockUser: Partial<User> = { id: '123', user_metadata: { name: 'Test User' } };
    await mockSupabaseAuthState(mockUser);
    const PageComponent = await IndexPage({ params: Promise.resolve(mockParams) });
    render(PageComponent);

    expect(
      screen.getByRole('heading', { name: /Mock Welcome Back, Test User!/i })
    ).toBeInTheDocument();
    expect(screen.queryByRole('link', { name: /Mock signIn/i })).not.toBeInTheDocument();
    expect(screen.queryByRole('link', { name: /Mock signUp/i })).not.toBeInTheDocument();
    const { setRequestLocale } = await import('next-intl/server');
    expect(setRequestLocale).toHaveBeenCalledWith('en');
  });

  it('renders correctly for authenticated users without a name in metadata', async () => {
    const mockUserWithoutName: Partial<User> = { id: '456', user_metadata: {} };
    await mockSupabaseAuthState(mockUserWithoutName);

    const PageComponent = await IndexPage({ params: Promise.resolve(mockParams) });
    render(PageComponent);

    expect(
      screen.getByRole('heading', { name: /Mock Welcome Back, Mock userName!/i })
    ).toBeInTheDocument();
    expect(screen.queryByRole('link', { name: /Mock signIn/i })).not.toBeInTheDocument();
    expect(screen.queryByRole('link', { name: /Mock signUp/i })).not.toBeInTheDocument();

    const { setRequestLocale } = await import('next-intl/server');
    expect(setRequestLocale).toHaveBeenCalledWith('en');
  });

  it('renders project overview and key features sections', async () => {
    const PageComponent = await IndexPage({ params: Promise.resolve(mockParams) });
    render(PageComponent);

    expect(screen.getByRole('heading', { name: /Mock projectOverviewTitle/i })).toBeInTheDocument();
    expect(screen.getByText(/Mock projectOverviewDesc/i)).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /Mock keyFeaturesTitle/i })).toBeInTheDocument();
    expect(screen.getByText(/Mock keyFeaturesApiSupportDesc/i)).toBeInTheDocument();
  });
});
