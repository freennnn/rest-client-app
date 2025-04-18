'use client';

import { useEffect } from 'react';

import { useTranslations } from 'next-intl';
import { useRouter, useSearchParams } from 'next/navigation';
import { toast } from 'sonner';

export function ToastHandler() {
  const searchParams = useSearchParams();
  const t = useTranslations('');
  const router = useRouter();

  useEffect(() => {
    const toastValue = searchParams.get('toast');

    if (!toastValue) return; // Exit if no toast parameter

    switch (toastValue) {
      case 'signin_success':
        toast.success(t('auth.loginSuccessTitle'), {
          description: t('auth.loginSuccessDescription'),
        });
        break;
      case 'signout_success':
        toast.success(t('auth.signOutSuccessTitle'), {
          description: t('auth.signOutSuccessDescription'),
        });
        break;
      case 'signout_error':
        toast.error(t('auth.signOutErrorTitle'), {
          description: t('auth.signOutErrorDescription'),
        });
        break;
      case 'user_already_exist':
        toast.error(t('auth.userAlreadyExistTitle'), {
          description: t('auth.userAlreadyExistDescription'),
        });
        break;

      default:
        // Optional: Log unexpected toast values
        console.warn('Unhandled toast value:', toastValue);
        break;
    }

    router.replace(window.location.pathname, { scroll: false });
  }, [searchParams, router, t]);

  // This component doesn't render anything itself
  return null;
}
