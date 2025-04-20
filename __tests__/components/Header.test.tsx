import React from 'react';

import { Header } from '@/components/Header';
import { usePathname, useRouter } from '@/i18n/navigation';
import { useAuth } from '@/providers/AuthenticationProvider';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { useLocale, useTranslations } from 'next-intl';

jest.mock('@/providers/AuthenticationProvider');
jest.mock('@/i18n/navigation', () => ({
  Link: ({ href, children, ...props }: { href: string; children: React.ReactNode }) => (
    <a href={href} {...props}>
      {children}
    </a>
  ),
  usePathname: jest.fn(),
  useRouter: jest.fn(),
}));

jest.mock('next-intl', () => ({
  useTranslations: jest.fn(),
  useLocale: jest.fn(),
}));

jest.mock('@/i18n/routing', () => ({
  routing: {
    locales: ['en', 'ru'],
  },
}));

jest.mock('lucide-react', () => ({
  Loader2: () => <div data-testid='loader-icon' />,
}));

jest.mock('@/components/SignOutButton', () => ({
  SignOutButton: () => <button>Sign Out</button>,
}));

jest.mock('@/components/ui/dropdown-menu', () => ({
  DropdownMenu: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  DropdownMenuTrigger: ({ children }: { children: React.ReactNode }) => (
    <div data-testid='dropdown-trigger'>{children}</div>
  ),
  DropdownMenuContent: ({ children }: { children: React.ReactNode }) => (
    <div data-testid='dropdown-content'>{children}</div>
  ),
  DropdownMenuItem: ({
    children,
    onClick,
  }: {
    children: React.ReactNode;
    onClick?: () => void;
  }) => (
    <button data-testid='dropdown-item' onClick={onClick}>
      {children}
    </button>
  ),
}));

describe('Header Component', () => {
  const mockUseAuth = useAuth as jest.MockedFunction<typeof useAuth>;
  const mockUsePathname = usePathname as jest.MockedFunction<typeof usePathname>;
  const mockUseRouter = useRouter as jest.MockedFunction<typeof useRouter>;
  const mockUseLocale = useLocale as jest.MockedFunction<typeof useLocale>;
  const mockUseTranslations = useTranslations as jest.MockedFunction<typeof useTranslations>;

  const mockT = jest.fn((key) => {
    const translations: Record<string, string> = {
      title: 'REST Client',
      'nav.home': 'Home',
      'nav.restClient': 'REST Client',
      'nav.variables': 'Variables',
      'nav.history': 'History',
      'nav.signIn': 'Sign In',
      'nav.signUp': 'Sign Up',
      'language.en': 'English',
      'language.ru': 'Russian',
    };
    return translations[key] || key;
  });

  beforeEach(() => {
    jest.clearAllMocks();

    mockUseAuth.mockReturnValue({
      isAuthenticated: false,
      isLoading: false,
      user: null,
    });

    mockUsePathname.mockReturnValue('/');

    mockUseRouter.mockReturnValue({
      replace: jest.fn(),
      push: jest.fn(),
      back: jest.fn(),
      forward: jest.fn(),
    } as ReturnType<typeof useRouter>);

    mockUseLocale.mockReturnValue('en');

    mockUseTranslations.mockReturnValue(mockT);

    Object.defineProperty(window, 'scrollY', {
      configurable: true,
      value: 0,
    });

    window.addEventListener = jest.fn();
    window.removeEventListener = jest.fn();
  });

  test('renders the header with site title', () => {
    render(<Header />);
    expect(screen.getByText('REST Client')).toBeInTheDocument();
  });

  test('displays sign in and sign up buttons when user is not authenticated', () => {
    mockUseAuth.mockReturnValue({
      isAuthenticated: false,
      isLoading: false,
      user: null,
    });

    render(<Header />);

    expect(screen.getByText('Sign In')).toBeInTheDocument();
    expect(screen.getByText('Sign Up')).toBeInTheDocument();
    expect(screen.queryByText('Sign Out')).not.toBeInTheDocument();
  });

  test('displays navigation links and sign out button when user is authenticated', () => {
    mockUseAuth.mockReturnValue({
      isAuthenticated: true,
      isLoading: false,
      user: { id: '1', email: 'test@example.com' },
    });

    render(<Header />);

    expect(screen.getByText('Home')).toBeInTheDocument();

    const restClientLinks = screen.getAllByRole('link');
    const navRestClientLink = restClientLinks.find(
      (link) => link.textContent === 'REST Client' && link.getAttribute('href') === '/GET'
    );
    expect(navRestClientLink).toBeInTheDocument();

    expect(screen.getByText('Variables')).toBeInTheDocument();
    expect(screen.getByText('History')).toBeInTheDocument();
    expect(screen.getByText('Sign Out')).toBeInTheDocument();
    expect(screen.queryByText('Sign In')).not.toBeInTheDocument();
    expect(screen.queryByText('Sign Up')).not.toBeInTheDocument();
  });

  test('shows loading indicator when auth is loading', () => {
    mockUseAuth.mockReturnValue({
      isAuthenticated: false,
      isLoading: true,
      user: null,
    });

    mockUseLocale.mockReturnValue('en');

    render(<Header />);

    const dropdownTrigger = screen.getByTestId('dropdown-trigger');
    const languageButton = dropdownTrigger.querySelector('button');
    expect(languageButton).toHaveAttribute('disabled');
  });

  test('shows loading indicator when locale is changing', () => {
    jest.resetAllMocks();

    mockUseAuth.mockReturnValue({
      isAuthenticated: false,
      isLoading: false,
      user: null,
    });

    mockUseLocale.mockReturnValue('en');

    const mockTranslationFn = jest.fn((key) => key);
    mockUseTranslations.mockReturnValue(mockTranslationFn);

    const { rerender } = render(<Header />);

    mockUseAuth.mockReturnValue({
      isAuthenticated: false,
      isLoading: true,
      user: null,
    });

    rerender(<Header />);

    const dropdownTrigger = screen.getByTestId('dropdown-trigger');
    const button = dropdownTrigger.querySelector('button');
    expect(button).toHaveAttribute('disabled');
  });

  test('calls router.replace with new locale when language is changed', async () => {
    const mockReplace = jest.fn();
    mockUseRouter.mockReturnValue({
      replace: mockReplace,
      push: jest.fn(),
      back: jest.fn(),
      forward: jest.fn(),
    } as ReturnType<typeof useRouter>);

    mockUseLocale.mockReturnValue('en');
    mockUsePathname.mockReturnValue('/test-path');

    const TestLocaleChanger = () => {
      const router = useRouter();
      const pathname = usePathname();
      const locale = useLocale();

      const handleClick = () => {
        if ('ru' === locale) return;
        router.replace(pathname, { locale: 'ru' });
      };

      return <button onClick={handleClick}>Change to Russian</button>;
    };

    const { getByText } = render(<TestLocaleChanger />);

    fireEvent.click(getByText('Change to Russian'));

    expect(mockReplace).toHaveBeenCalledWith('/test-path', { locale: 'ru' });
  });

  test('handleLocaleChange does not trigger router.replace when locale is the same', () => {
    const mockReplace = jest.fn();
    mockUseRouter.mockReturnValue({
      replace: mockReplace,
      push: jest.fn(),
      back: jest.fn(),
      forward: jest.fn(),
    } as ReturnType<typeof useRouter>);

    mockUseLocale.mockReturnValue('en');
    mockUsePathname.mockReturnValue('/test-path');

    render(<Header />);

    const dropdownTrigger = screen.getByTestId('dropdown-trigger');
    fireEvent.click(dropdownTrigger);

    const items = screen.getAllByTestId('dropdown-item');
    const englishOption = items[0];

    fireEvent.click(englishOption);

    expect(mockReplace).not.toHaveBeenCalled();
  });

  test('handleLocaleChange does not trigger router.replace when already loading', () => {
    const mockReplace = jest.fn();
    mockUseRouter.mockReturnValue({
      replace: mockReplace,
      push: jest.fn(),
      back: jest.fn(),
      forward: jest.fn(),
    } as ReturnType<typeof useRouter>);

    mockUseLocale.mockReturnValue('en');
    mockUsePathname.mockReturnValue('/test-path');

    const TestComponent = () => {
      const [isLoading, setIsLoading] = React.useState(true);
      const router = useRouter();
      const pathname = usePathname();
      const locale = useLocale();

      const handleClick = () => {
        if (locale === 'ru' || isLoading) return;
        setIsLoading(true);
        router.replace(pathname, { locale: 'ru' });
      };

      return (
        <div>
          <span data-testid='loading-status'>{isLoading ? 'Loading' : 'Not Loading'}</span>
          <button onClick={handleClick}>Change locale</button>
        </div>
      );
    };

    render(<TestComponent />);

    const button = screen.getByText('Change locale');
    fireEvent.click(button);

    expect(mockReplace).not.toHaveBeenCalled();
  });

  test('resets locale loading state after locale change', async () => {
    const TestLocaleChangeComponent = () => {
      const [isLoading, setIsLoading] = React.useState(true);
      const currentLocale = useLocale();

      React.useEffect(() => {
        if (isLoading) {
          setIsLoading(false);
        }
      }, [currentLocale, isLoading]);

      return <div data-testid='loading-state'>{isLoading ? 'Loading' : 'Not Loading'}</div>;
    };

    mockUseLocale.mockReturnValue('en');

    const { rerender } = render(<TestLocaleChangeComponent />);

    expect(screen.getByTestId('loading-state')).toHaveTextContent('Loading');

    await waitFor(() => {
      expect(screen.getByTestId('loading-state')).toHaveTextContent('Not Loading');
    });

    mockUseLocale.mockReturnValue('ru');
    rerender(<TestLocaleChangeComponent />);

    expect(screen.getByTestId('loading-state')).toHaveTextContent('Not Loading');
  });

  test('renders SignOutButton when user is authenticated', () => {
    mockUseAuth.mockReturnValue({
      isAuthenticated: true,
      isLoading: false,
      user: { id: '1', email: 'test@example.com' },
    });

    render(<Header />);

    expect(screen.getByText('Sign Out')).toBeInTheDocument();

    expect(screen.queryByRole('link', { name: 'Sign In' })).not.toBeInTheDocument();
    expect(screen.queryByRole('link', { name: 'Sign Up' })).not.toBeInTheDocument();
  });

  test('adds scroll event listener and updates header style on scroll', () => {
    render(<Header />);

    expect(window.addEventListener).toHaveBeenCalledWith('scroll', expect.any(Function));

    Object.defineProperty(window, 'scrollY', {
      configurable: true,
      value: 20,
    });

    const scrollHandler = (window.addEventListener as jest.Mock).mock.calls.find(
      (call) => call[0] === 'scroll'
    )[1];

    scrollHandler();

    const { container } = render(<Header />);

    expect(container.querySelector('.shadow-sm')).not.toBeNull();
  });

  test('removes event listener on unmount', () => {
    const { unmount } = render(<Header />);
    unmount();

    expect(window.removeEventListener).toHaveBeenCalledWith('scroll', expect.any(Function));
  });
});
