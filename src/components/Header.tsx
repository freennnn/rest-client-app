'use client';

import { useEffect, useState } from 'react';

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Link } from '@/i18n/navigation';
import { usePathname, useRouter } from '@/i18n/navigation';
import { routing } from '@/i18n/routing';
import { cn } from '@/lib/utils';
import {
  historyPath,
  homePath,
  restClientPath,
  signInPath,
  signUpPath,
  variablesPath,
} from '@/paths';
import { useAuth } from '@/providers/AuthenticationProvider';
import { Loader2 } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useLocale } from 'next-intl';

import { SignOutButton } from './SignOutButton';
import { Button } from './ui/button';

export function Header() {
  const { isAuthenticated, isLoading: isAuthLoading } = useAuth();
  const t = useTranslations('header');
  const router = useRouter();
  const pathname = usePathname();
  const [isLocaleLoading, setIsLocaleLoading] = useState(false);
  const currentLocale = useLocale();

  console.log('[Header] Rendering, currentLocale from useLocale():', currentLocale);
  console.log("[Header] Translation for 'nav.signIn':", t('nav.signIn'));

  const handleLocaleChange = (newLocale: string) => {
    console.log(
      '[Header] handleLocaleChange: currentLocale=',
      currentLocale,
      'newLocale=',
      newLocale,
      'pathname=',
      pathname
    );
    if (newLocale === currentLocale || isLocaleLoading) return;

    setIsLocaleLoading(true);

    router.replace(pathname, { locale: newLocale });
  };

  useEffect(() => {
    // Optional: Log when effect runs
    // console.log('[Header] useEffect running, isLocaleLoading:', isLocaleLoading, 'currentLocale:', currentLocale);
    if (isLocaleLoading) {
      setIsLocaleLoading(false);
    }
  }, [currentLocale, isLocaleLoading]);

  const isLoading = isAuthLoading || isLocaleLoading;

  return (
    <header
      className={cn(
        'sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60',
        'transition-all duration-200 ease-in-out',
        'hover:bg-background/100'
      )}
    >
      <div className='container flex h-14 items-center'>
        <div className='mr-4 hidden md:flex'>
          <Link href={homePath()} className='mr-6 flex items-center space-x-2'>
            <span className='hidden font-bold sm:inline-block'>{t('title')}</span>
          </Link>
          {isAuthenticated && (
            <nav className='flex items-center space-x-6 text-sm font-medium'>
              <Link
                href={homePath()}
                className='transition-colors hover:text-foreground/80 text-foreground'
              >
                {t('nav.home')}
              </Link>
              <Link
                href={restClientPath()}
                className='transition-colors hover:text-foreground/80 text-foreground/60'
              >
                {t('nav.restClient')}
              </Link>
              <Link
                href={variablesPath()}
                className='transition-colors hover:text-foreground/80 text-foreground/60'
              >
                {t('nav.variables')}
              </Link>
              <Link
                href={historyPath()}
                className='transition-colors hover:text-foreground/80 text-foreground/60'
              >
                {t('nav.history')}
              </Link>
            </nav>
          )}
        </div>
        <div className='flex flex-1 items-center justify-between space-x-2 md:justify-end'>
          <nav className='flex items-center'>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant='ghost' size='sm' disabled={isLoading}>
                  {isLocaleLoading ? (
                    <Loader2 className='h-4 w-4 animate-spin' />
                  ) : (
                    t(`language.${currentLocale}`)
                  )}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align='end'>
                {routing.locales.map((locale) => (
                  <DropdownMenuItem
                    key={locale}
                    onClick={() => handleLocaleChange(locale as string)}
                    disabled={currentLocale === locale || isLoading}
                  >
                    {t(`language.${locale}`)}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </nav>
          {!isAuthenticated ? (
            <div className='flex items-center space-x-2'>
              <Button variant='ghost' size='sm' asChild>
                <Link href={signInPath()}>{t('nav.signIn')}</Link>
              </Button>
              <Button size='sm' asChild>
                <Link href={signUpPath()}>{t('nav.signUp')}</Link>
              </Button>
            </div>
          ) : (
            <SignOutButton />
          )}
        </div>
      </div>
    </header>
  );
}
