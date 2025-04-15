'use client';

import { useState } from 'react';

import CustomSelect from '@/components/select/select';
import { usePathname, useRouter } from '@/i18n/navigation';
import { routing } from '@/i18n/routing';
import langLogo from '@public/lang.svg';
import logo from '@public/logo.svg';
import { useLocale, useTranslations } from 'next-intl';
import Image from 'next/image';
import Link from 'next/link';

import styles from './header.module.scss';

export const Header = () => {
  const router = useRouter();
  const pathname = usePathname();
  const currentLocale = useLocale();
  const t = useTranslations();
  const [isLoading, setIsLoading] = useState(false);

  const handleLocaleChange = (locale: string) => {
    setIsLoading(true);
    router.replace(pathname, { locale });
  };

  const options = routing.locales.map((locale) => ({
    label: t(`languages.${locale}`),
    value: locale,
  }));

  const defaultValue = options.find((option) => option.value === currentLocale) || options[0];

  return (
    <>
      {isLoading && (
        <div className='fixed inset-0 z-50 flex items-center justify-center bg-gray-300/5 backdrop-blur-sm'>
          <div className='animate-spin rounded-full h-12 w-12 border-t-2 border-white'></div>
        </div>
      )}
      <header className='flex align-center sticky top-0 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800 py-3 px-6'>
        <Link href='/' className='flex items-center cursor-pointer'>
          <div id={styles.logo}>
            <Image src={logo} alt='logo' width={32} height={32} />
            <strong>ShadMen</strong>
          </div>
        </Link>
        <div className={styles.action}>
          <CustomSelect
            icon={langLogo}
            defaultValue={defaultValue}
            options={options}
            onChange={handleLocaleChange}
          />
          <button
            type='button'
            className='p-2 border-1 bg-white text-black dark:bg-background dark:text-white hover:scale-110 transition-transform duration-200'
          >
            {t('signIn')}
          </button>
          <button
            type='button'
            className='p-2 border-1 bg-white text-black dark:bg-background dark:text-white hover:scale-110 transition-transform duration-200'
          >
            {t('signUp')}
          </button>
        </div>
      </header>
    </>
  );
};
