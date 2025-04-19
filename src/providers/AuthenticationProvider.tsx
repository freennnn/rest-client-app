'use client';

import { createContext, useContext, useEffect, useState } from 'react';

import { createClient } from '@/utils/supabase/client';
import { User } from '@supabase/supabase-js';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  isAuthenticated: false,
  isLoading: true,
});

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthenticationProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    console.log('AuthProvider: Initializing auth state...');

    // Get initial user state
    const initializeAuth = async () => {
      try {
        console.log('AuthProvider: Fetching initial session...');
        const {
          data: { session },
          error,
        } = await supabase.auth.getSession();

        if (error) {
          console.error('AuthProvider: Error fetching session:', error);
          setUser(null);
          setIsAuthenticated(false);
          return;
        }

        console.log('AuthProvider: Session fetched:', session ? 'exists' : 'null');
        setUser(session?.user ?? null);
        setIsAuthenticated(!!session?.user);
      } catch (error) {
        console.error('AuthProvider: Unexpected error during initialization:', error);
        setUser(null);
        setIsAuthenticated(false);
      } finally {
        setIsLoading(false);
      }
    };

    initializeAuth();

    // Listen for auth state changes
    console.log('AuthProvider: Setting up auth state change listener...');
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log(
        'AuthProvider: Auth state changed:',
        event,
        session ? 'session exists' : 'no session'
      );

      // For sign out events, ensure we clear the state
      if (event === 'SIGNED_OUT') {
        console.log('AuthProvider: Handling sign out event');
        setUser(null);
        setIsAuthenticated(false);
        return;
      }

      // For other events, update based on session
      setUser(session?.user ?? null);
      setIsAuthenticated(!!session?.user);
    });

    return () => {
      console.log('AuthProvider: Cleaning up auth state change listener');
      subscription.unsubscribe();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <AuthContext.Provider value={{ user, isAuthenticated, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
}
