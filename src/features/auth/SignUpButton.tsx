'use client';

import { signUpPath } from '@/paths';
import { useRouter } from 'next/navigation';

export default function SignUpButton() {
  const router = useRouter();

  return (
    <button
      type='button'
      onClick={() => router.push(signUpPath())}
      className='p-2 border bg-white text-black dark:bg-background dark:text-white hover:scale-110 transition-transform duration-200'
    >
      Sign Up
    </button>
  );
}
