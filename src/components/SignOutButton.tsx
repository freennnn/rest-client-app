'use client';

import { useState } from 'react';

import { signOut } from '@/actions/authActions';
import { Button } from '@/components/ui/button';
import { createClient } from '@/utils/supabase/client';
import { useRouter } from 'next/navigation';

export function SignOutButton() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const supabase = createClient();

  const handleSignOut = async () => {
    try {
      setIsLoading(true);
      await signOut();
      // Force a refresh of the auth state on the client
      await supabase.auth.refreshSession();
      router.refresh();
    } catch (error) {
      console.error('Error during sign out:', error);
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
