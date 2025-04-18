'use client';

import { useEffect } from 'react';

import { usePathname, useRouter } from '@/i18n/navigation';
import { useSearchParams } from 'next/navigation';

const AUTH_EVENT_PARAM_KEY = 'authEvent';
const PROCESSED_KEY = 'auth_event_processed';

export function AuthRedirectRefresher() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    const authEvent = searchParams.get(AUTH_EVENT_PARAM_KEY);
    const hasProcessed = sessionStorage.getItem(PROCESSED_KEY);

    if (authEvent === 'true' && !hasProcessed) {
      console.log('AuthRedirectRefresher: Auth event detected, refreshing router...');
      sessionStorage.setItem(PROCESSED_KEY, 'true');

      const params = new URLSearchParams(searchParams.toString());
      params.delete(AUTH_EVENT_PARAM_KEY);
      const newUrl = `${pathname}${params.toString() ? `?${params.toString()}` : ''}`;
      window.history.replaceState({ ...window.history.state, as: newUrl, url: newUrl }, '', newUrl);

      // router.refresh() tells Next.js to refetch server data for /target and
      // update the client components. This forces your AuthenticationProvider
      // to effectively re-sync with the current cookie state, updating the Header.
      router.refresh();
    }

    if (authEvent !== 'true' && hasProcessed) {
      console.log('AuthRedirectRefresher: Cleaning processed flag.');
      sessionStorage.removeItem(PROCESSED_KEY);
    }
  }, [searchParams, router, pathname]);

  return null;
}
