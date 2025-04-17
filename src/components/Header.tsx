'use client';

import { useState } from 'react';

import { signOut } from '@/actions/authActions';
import { Button } from '@/components/ui/button';
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
import { useLocale } from 'next-intl';
import { useTranslations } from 'next-intl';

export function Header() {
  const t = useTranslations('header');
  const { isAuthenticated } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  const [isLoading, setIsLoading] = useState(false);

  const currentLocale = useLocale();

  const handleLocaleChange = (newLocale: string) => {
    if (newLocale === currentLocale || isLoading) return;

    setIsLoading(true);
    try {
      router.replace(pathname, { locale: newLocale });
    } catch (error) {
      console.error('Failed to change locale:', error);
      setIsLoading(false);
    }
  };

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
                  {isLoading ? (
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
                    onClick={() => handleLocaleChange(locale)}
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
            <Button
              variant='ghost'
              size='sm'
              onClick={() => {
                signOut();
              }}
            >
              {t('nav.signOut')}
            </Button>
          )}
        </div>
      </div>
    </header>
  );
}
