import CustomSelect from '@/components/select/select';
import darkMode from '@public/dark-mode.svg';
import lightMode from '@public/light-mode.svg';
import logo from '@public/logo.svg';
import Image from 'next/image';

import langLogo from '../../../public/lang.svg';
import styles from './header.module.scss';

export const Header = () => {
  return (
    <header className='flex align-center sticky top-0 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800 py-3 px-6'>
      <div id={styles.logo}>
        <Image src={logo} alt='logo' width={32} height={32} priority />
        <strong>ShadMen</strong>
      </div>
      <div className={styles.action}>
        <div className='w-10 flex justify-center align-center p-2 border-1 bg-white text-black dark:bg-background dark:text-white hover:scale-110 transition-transform duration-200'>
          <Image src={lightMode} alt='mode' width={16} height={16} priority />
        </div>
        <CustomSelect
          icon={langLogo}
          options={[
            {
              label: 'Eng',
              value: 'eng',
            },
            {
              label: 'Rus',
              value: 'rus',
            },
          ]}
        />
        <button
          type='button'
          className='p-2 border-1 bg-white text-black dark:bg-background dark:text-white hover:scale-110 transition-transform duration-200'
        >
          Sign In
        </button>
        <button
          type='button'
          className='p-2 border-1 bg-white text-black dark:bg-background dark:text-white hover:scale-110 transition-transform duration-200'
        >
          Sign Up
        </button>
      </div>
    </header>
  );
};
