'use client';

import { signOut } from '@/actions/authActions';
import { Button } from '@/components/ui/button';
import { useTranslations } from 'next-intl';

export function SignOutButton() {
  const tAuth = useTranslations('auth');

  return (
    <Button
      onClick={() => {
        signOut();
      }}
    >
      {tAuth('signOut')}
    </Button>
  );
}
