'use client';

import { useState } from 'react';

import { Button } from '@/components/ui/button';
import { useAuthActions } from '@/hooks/useAuthActions';
import { useTranslations } from 'next-intl';

export function SignOutButton() {
  const { signOut } = useAuthActions();
  const [isLoading, setIsLoading] = useState(false);
  const t = useTranslations('auth');
  const handleSignOut = async () => {
    try {
      setIsLoading(true);
      await signOut();
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Button variant='ghost' onClick={handleSignOut} disabled={isLoading}>
      {isLoading ? t('signingOut') : t('signOut')}
    </Button>
  );
}
