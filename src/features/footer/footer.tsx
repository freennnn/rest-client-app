import rsLogo from '@public/rs-logo.svg';
import Image from 'next/image';
import Link from 'next/link';

export const Footer = () => {
  return (
    <footer className='bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800 py-3 px-6'>
      <div className='container mx-auto flex flex-wrap justify-center md:justify-between items-center gap-4'>
        <div className='flex items-center gap-4'>
          <Link
            href='https://rs.school/courses/reactjs'
            target='_blank'
            rel='noopener noreferrer'
            className='flex gap-2 align-center text-sm hover:underline hover:text-blue-600 dark:hover:text-blue-400'
          >
            <Image src={rsLogo} alt='rslogo' width={16} height={16} />
            RSschool
          </Link>
          <span className='text-sm text-gray-600 dark:text-gray-300'>© 2025 REST Client</span>
        </div>
        <div className='flex gap-4 align-center justify-center text-sm text-gray-600 dark:text-gray-300'>
          <Link
            href={'https://github.com/freennnn'}
            target='_blank'
            rel='noopener noreferrer'
            className='hover:underline hover:text-blue-600 dark:hover:text-blue-400'
          >
            @freennnn
          </Link>
          <Link
            href={'https://github.com/RUBBOSS'}
            target='_blank'
            rel='noopener noreferrer'
            className='hover:underline hover:text-blue-600 dark:hover:text-blue-400'
          >
            @RUBBOSS
          </Link>
          <Link
            href={'https://github.com/magadanov'}
            target='_blank'
            rel='noopener noreferrer'
            className='hover:underline hover:text-blue-600 dark:hover:text-blue-400'
          >
            @magadanov
          </Link>
        </div>
        <div className='text-sm text-gray-600 dark:text-gray-300'>
          Built with Next.js and TailwindCSS
        </div>
      </div>
    </footer>
  );
};
