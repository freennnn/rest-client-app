'use client';

import { useState } from 'react';

import { Button } from '@/components/ui/button';
import { useAuthActions } from '@/hooks/useAuthActions';

export function SignOutButton() {
  const { signOut } = useAuthActions();
  const [isLoading, setIsLoading] = useState(false);

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
      {isLoading ? 'Signing out...' : 'Sign out'}
    </Button>
  );
}
