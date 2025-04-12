'use client';

import { useRouter } from '@/i18n/navigation';
import { signInPath } from '@/paths';

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
