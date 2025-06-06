'use client';

import { useState } from 'react';

import { useRouter } from '@/i18n/navigation';
import { homePath, signInPath } from '@/paths';
import { createClient } from '@/utils/supabase/client';
import { useTranslations } from 'next-intl';
import { toast } from 'sonner';

export interface ActionResult {
  success: boolean;
  error?: {
    message: string;
    translatedMessage: string;
    code?: string;
  };
}

export function useAuthActions() {
  const router = useRouter();
  const supabase = createClient();
  const t = useTranslations('auth');
  const [isPending, setIsPending] = useState(false);

  const signIn = async (email: string, password: string): Promise<ActionResult> => {
    setIsPending(true);

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (error) {
        const errorKey = error.message.includes('Invalid login credentials')
          ? 'signInFailedCredentials'
          : 'signInFailedGeneric';
        const errorMessage = t(errorKey, { error: error.message });
        toast.error(errorMessage);
        return {
          success: false,
          error: { message: error.message, translatedMessage: errorMessage, code: error.code },
        };
      }

      toast.success(t('loginSuccessTitle'), {
        description: t('loginSuccessDescription'),
      });
      router.push(homePath());
      return { success: true };
    } catch {
      const errorMessage = t('signInFailedGeneric');
      toast.error(errorMessage);

      return { success: false, error: { message: errorMessage, translatedMessage: errorMessage } };
    } finally {
      setIsPending(false);
    }
  };

  const signUp = async (email: string, password: string, name: string): Promise<ActionResult> => {
    setIsPending(true);

    try {
      const { data: existingUser } = await supabase
        .from('auth.users')
        .select('id')
        .eq('email', email)
        .single();

      if (existingUser) {
        toast.success(t('userAlreadyExistTitle'), {
          description: t('userAlreadyExistDescription'),
        });
        router.push(signInPath(email));
        router.refresh();

        return {
          success: false,
          error: { message: 'User already exists', translatedMessage: t('userAlreadyExistTitle') },
        };
      }
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            name,
          },
        },
      });

      if (error) {
        const errorMessage = t('signUpFailedGeneric');
        toast.error(errorMessage);
        return {
          success: false,
          error: { message: error.message, translatedMessage: errorMessage, code: error.code },
        };
      }

      toast.success(t('signUpSuccessTitle'), {
        description: t('signUpSuccessDescription'),
      });
      router.push(homePath());
      router.refresh();

      return { success: true };
    } catch {
      const errorMessage = t('signUpFailedGeneric');
      toast.error(errorMessage);
      return { success: false, error: { message: errorMessage, translatedMessage: errorMessage } };
    } finally {
      setIsPending(false);
    }
  };

  const signOut = async (): Promise<ActionResult> => {
    setIsPending(true);

    try {
      const { error } = await supabase.auth.signOut();
      if (error) {
        const errorMessage = t('signOutErrorTitle');
        toast.error(errorMessage, {
          description: t('signOutErrorDescription'),
        });
        return {
          success: false,
          error: { message: error.message, translatedMessage: errorMessage },
        };
      }

      toast.success(t('signOutSuccessTitle'));
      router.push(homePath());
      router.refresh();
      return { success: true };
    } catch {
      const errorMessage = t('signOutErrorTitle');
      toast.error(errorMessage);
      return { success: false, error: { message: errorMessage, translatedMessage: errorMessage } };
    } finally {
      setIsPending(false);
    }
  };

  return { signIn, signUp, signOut, isPending };
}
