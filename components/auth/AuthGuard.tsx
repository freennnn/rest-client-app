'use client';

import { useAuth } from './AuthProvider';
import { useRouter, usePathname } from 'next/navigation';
import { useEffect } from 'react';
import LoadingSpinner from '../ui/LoadingSpinner';

export default function AuthGuard({ 
  children 
}: { 
  children: React.ReactNode 
}) {
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    // If not loading and not authenticated, redirect to login
    if (!isLoading && !isAuthenticated && pathname !== '/login' && pathname !== '/signup') {
      router.push('/login');
    }
  }, [isAuthenticated, isLoading, router, pathname]);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <LoadingSpinner />
      </div>
    );
  }

  // Allow access to login and signup pages even when not authenticated
  if (!isAuthenticated && (pathname === '/login' || pathname === '/signup')) {
    return <>{children}</>;
  }

  // Only render children if authenticated or on public routes
  return isAuthenticated ? <>{children}</> : null;
}
