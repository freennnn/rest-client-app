'use client';

import { signInPath } from '@/paths';
import { useRouter } from 'next/navigation';

export default function SignInButton() {
  const router = useRouter();

  return (
    <button
      onClick={() => router.push(signInPath())}
      className='p-2 border bg-white text-black dark:bg-background dark:text-white hover:scale-110 transition-transform duration-200'
    >
      Sign In
    </button>
  );
}
