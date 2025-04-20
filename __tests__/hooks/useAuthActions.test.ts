import React from 'react';

import { ActionResult, useAuthActions } from '@/hooks/useAuthActions';
import { useRouter } from '@/i18n/navigation';
import { homePath, signInPath } from '@/paths';
import { createClient } from '@/utils/supabase/client';
import { act, renderHook } from '@testing-library/react';
import { useTranslations } from 'next-intl';
import { toast } from 'sonner';

// --- Mocks ---

// Mock Supabase client FIRST
jest.mock('@/utils/supabase/client');

// Mock navigation and routing dependencies
jest.mock('@/i18n/routing', () => ({
  locales: ['en', 'ru'],
  routing: {
    locales: ['en', 'ru'],
    defaultLocale: 'en',
  },
}));

// Define router mocks outside to reference them easily
const mockPush = jest.fn();
const mockRefresh = jest.fn(); // Though not used in hook, good practice if mocking the module
jest.mock('@/i18n/navigation', () => ({
  useRouter: jest.fn(() => ({
    push: mockPush,
    refresh: mockRefresh,
  })),
  usePathname: jest.fn(() => '/'), // Example pathname
  Link: ({
    href,
    children,
    ...props
  }: {
    href: string;
    children: React.ReactNode;
    [key: string]: unknown;
  }) => React.createElement('a', { href, ...props }, children),
  getPathname: jest.fn(() => '/'),
  redirect: jest.fn(),
}));

// Mock next-intl
const mockT = jest.fn((key) => key.split('.').pop() || key); // Use a more specific mock translator if needed
jest.mock('next-intl', () => ({
  useTranslations: jest.fn(() => mockT),
  useLocale: jest.fn(() => 'en'),
}));

// Mock sonner
jest.mock('sonner');

// Mock paths
jest.mock('@/paths');

// Mock next-auth/react actions - NOT USED by the hook, but keep if other tests import them indirectly
// jest.mock('next-auth/react');

// Mock server actions (if any, though createUser is Supabase here)
// jest.mock('@/actions/authActions'); // Not strictly needed as we mock Supabase calls directly

// --- Define mock functions/objects for easier access in tests ---
const mockUseRouter = useRouter as jest.Mock;
const mockUseTranslations = useTranslations as jest.Mock;

const mockToastPromise = toast.promise as jest.Mock;
const mockToastSuccess = jest.fn();
const mockToastError = jest.fn();
// IMPORTANT: Cast toast to its mocked type before assigning properties
(toast as jest.Mocked<typeof toast>).success = mockToastSuccess;
(toast as jest.Mocked<typeof toast>).error = mockToastError;

const mockHomePath = homePath as jest.Mock;
const mockSignInPath = signInPath as jest.Mock;
const mockCreateClient = createClient as jest.Mock;

// Mocks for Supabase client methods will be defined in beforeEach
// -------------------------------------------------------------

describe('useAuthActions Hook', () => {
  // Declare Supabase method mocks here, define in beforeEach
  let mockSignInWithPassword: jest.Mock;
  let mockSignUp: jest.Mock;
  let mockSignOut: jest.Mock;
  let mockFrom: jest.Mock;
  let mockSelect: jest.Mock;
  let mockEq: jest.Mock;
  let mockSingle: jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks(); // Clears call history for ALL mocks

    // --- Reset specific mock implementations for each test ---

    // Router
    mockUseRouter.mockReturnValue({ push: mockPush, refresh: mockRefresh }); // Re-assign return value
    mockPush.mockClear(); // Clear calls specifically
    mockRefresh.mockClear();

    // Translations
    mockUseTranslations.mockReturnValue(mockT); // Re-assign return value
    mockT.mockClear();
    mockT.mockImplementation((key) => key.split('.').pop() || key); // Reset default t implementation

    // Toasts
    mockToastSuccess.mockClear();
    mockToastError.mockClear();
    mockToastPromise.mockClear();
    // Default implementation for toast.promise that resolves/rejects and calls our specific mocks
    mockToastPromise.mockImplementation(
      async (
        promise: Promise<unknown>,
        options?: {
          loading?: string;
          success?: (data: unknown) => string | React.ReactNode | undefined;
          error?: (error: unknown) => string | React.ReactNode | undefined;
        }
      ) => {
        // No need to show loading in tests
        try {
          const result = await promise;
          const message =
            typeof options?.success === 'function' ? options.success(result) : options?.success;
          if (message) mockToastSuccess(message);
          return result; // Return result for potential chaining/assertions in test
        } catch (err) {
          const message =
            typeof options?.error === 'function' ? options.error(err) : options?.error;
          if (message) mockToastError(message);
          throw err; // Re-throw error so tests expecting failure can catch it
        }
      }
    );

    // Paths
    mockHomePath.mockReturnValue('/mock-home');
    mockSignInPath.mockReturnValue('/mock-signin');

    // Supabase client setup - Define the mock methods for this test
    mockSignInWithPassword = jest
      .fn()
      .mockResolvedValue({ data: { user: { id: 'user-123' } }, error: null });
    mockSignUp = jest
      .fn()
      .mockResolvedValue({ data: { user: { id: 'new-user-456' } }, error: null });
    mockSignOut = jest.fn().mockResolvedValue({ error: null });
    mockEq = jest.fn(); // Define mockEq first
    mockSingle = jest.fn().mockResolvedValue({ data: null, error: null }); // Default: user does not exist
    mockSelect = jest.fn().mockReturnValue({ eq: mockEq });
    mockEq.mockReturnValue({ single: mockSingle }); // Now use mockSingle
    mockFrom = jest.fn().mockReturnValue({ select: mockSelect });

    mockCreateClient.mockReturnValue({
      auth: {
        signInWithPassword: mockSignInWithPassword,
        signUp: mockSignUp,
        signOut: mockSignOut,
      },
      // Mock the query builder chain
      from: mockFrom,
    });
  });

  // --- Test Cases ---

  it('should initialize with isPending false', () => {
    const { result } = renderHook(() => useAuthActions());
    expect(result.current.isPending).toBe(false);
  });

  // --- signIn Tests ---
  it('signIn should set pending state correctly', async () => {
    const { result } = renderHook(() => useAuthActions());
    expect(result.current.isPending).toBe(false);

    let signInPromise: Promise<ActionResult> | undefined;
    await act(async () => {
      signInPromise = result.current.signIn('test@example.com', 'password');
    });

    // Wait for the promise to resolve and the state to reset
    await act(async () => {
      if (signInPromise) {
        await signInPromise;
      }
    });
    expect(result.current.isPending).toBe(false);
  });

  it('signIn should call Supabase client, show success toast, and navigate on success', async () => {
    const { result } = renderHook(() => useAuthActions());
    const email = 'test@success.com';
    const password = 'password';

    await act(async () => {
      await result.current.signIn(email, password);
    });

    expect(mockSignInWithPassword).toHaveBeenCalledWith({ email, password });
    expect(mockPush).toHaveBeenCalledTimes(1);
    expect(mockPush).toHaveBeenCalledWith('/mock-home'); // Check against mocked path
    expect(mockToastSuccess).toHaveBeenCalledTimes(1);
    expect(mockToastSuccess).toHaveBeenCalledWith(mockT('loginSuccessTitle'), {
      description: mockT('loginSuccessDescription'),
    });
    expect(mockToastError).not.toHaveBeenCalled();
  });

  it('signIn should show error toast and not navigate on failure', async () => {
    const mockError = { message: 'Invalid login credentials' }; // Supabase error structure
    mockSignInWithPassword.mockResolvedValue({ error: mockError });
    const { result } = renderHook(() => useAuthActions());

    // Expect the promise to reject or handle the error internally
    await act(async () => {
      // The hook should catch the error and show a toast
      await result.current.signIn('test@fail.com', 'wrong');
    });

    expect(mockSignInWithPassword).toHaveBeenCalledTimes(1);
    expect(mockToastError).toHaveBeenCalledTimes(1);
    // Check specific error key mapping based on hook logic
    expect(mockToastError).toHaveBeenCalledWith('signInFailedCredentials');
    expect(mockPush).not.toHaveBeenCalled();
    expect(mockToastSuccess).not.toHaveBeenCalled();
  });

  // --- signUp Tests ---
  it('signUp should set pending state correctly', async () => {
    const { result } = renderHook(() => useAuthActions());
    expect(result.current.isPending).toBe(false);

    let signUpPromise: Promise<ActionResult> | undefined;
    await act(async () => {
      signUpPromise = result.current.signUp('new@user.com', 'password', 'New User');
    });

    // Wait for the promise to resolve and the state to reset
    await act(async () => {
      if (signUpPromise) {
        await signUpPromise;
      }
    });
    expect(result.current.isPending).toBe(false);
  });

  it('signUp should check user existence, call Supabase client, show success toast, and navigate on success (new user)', async () => {
    mockSingle.mockResolvedValue({ data: null, error: null }); // Ensure user doesn't exist
    const { result } = renderHook(() => useAuthActions());
    const email = 'new@success.com';
    const password = 'password';
    const name = 'New User';

    await act(async () => {
      await result.current.signUp(email, password, name);
    });

    // Check existence check first
    expect(mockFrom).toHaveBeenCalledWith('auth.users'); // Correct table name
    expect(mockSelect).toHaveBeenCalledWith('id');
    expect(mockEq).toHaveBeenCalledWith('email', email);
    expect(mockSingle).toHaveBeenCalledTimes(1);

    // Then check sign up
    expect(mockSignUp).toHaveBeenCalledTimes(1);
    // Supabase `signUp` options expect `data` nested under `options`
    expect(mockSignUp).toHaveBeenCalledWith({ email, password, options: { data: { name } } });
    expect(mockPush).toHaveBeenCalledTimes(1);
    expect(mockPush).toHaveBeenCalledWith('/mock-home'); // Navigate home after signup
    expect(mockToastSuccess).toHaveBeenCalledTimes(1);
    // Match actual hook call signature using mockT
    expect(mockToastSuccess).toHaveBeenCalledWith(mockT('signUpSuccessTitle'), {
      description: mockT('signUpSuccessDescription'),
    });
    expect(mockToastError).not.toHaveBeenCalled();
  });

  it('signUp should show error toast and navigate to signIn if user already exists', async () => {
    mockSingle.mockResolvedValue({ data: { id: 'existing-id' }, error: null }); // Simulate existing user
    const { result } = renderHook(() => useAuthActions());
    const email = 'exists@example.com';

    await act(async () => {
      await result.current.signUp(email, 'password', 'Exists');
    });

    expect(mockFrom).toHaveBeenCalledWith('auth.users'); // Correct table name
    expect(mockSingle).toHaveBeenCalledTimes(1);
    expect(mockSignUp).not.toHaveBeenCalled(); // Should not attempt sign up
    expect(mockPush).toHaveBeenCalledTimes(1);
    expect(mockPush).toHaveBeenCalledWith('/mock-signin'); // Navigate to signin path
    // Expect toast.success because the hook calls it for existing users
    expect(mockToastSuccess).toHaveBeenCalledTimes(1);
    expect(mockToastSuccess).toHaveBeenCalledWith(mockT('userAlreadyExistTitle'), {
      description: mockT('userAlreadyExistDescription'),
    });
    expect(mockToastError).not.toHaveBeenCalled(); // Error toast should not be called
  });

  it('signUp should show error toast on Supabase signUp failure', async () => {
    mockSingle.mockResolvedValue({ data: null, error: null }); // User does not exist
    const mockSignUpError = { message: 'Sign up failed' };
    mockSignUp.mockResolvedValue({ data: null, error: mockSignUpError }); // Simulate Supabase signup error
    const { result } = renderHook(() => useAuthActions());

    await act(async () => {
      // Hook should catch the error
      await result.current.signUp('fail@signup.com', 'password', 'Fail');
    });

    expect(mockSignUp).toHaveBeenCalledTimes(1);
    expect(mockToastError).toHaveBeenCalledTimes(1);
    // Use mockT for consistency, though the key itself might be sufficient if simple
    expect(mockToastError).toHaveBeenCalledWith(mockT('signUpFailedGeneric'));
    expect(mockPush).not.toHaveBeenCalled();
    expect(mockToastSuccess).not.toHaveBeenCalled();
  });

  // --- signOut Tests ---
  it('signOut should set pending state correctly', async () => {
    const { result } = renderHook(() => useAuthActions());
    expect(result.current.isPending).toBe(false);

    let signOutPromise: Promise<ActionResult> | undefined;
    await act(async () => {
      signOutPromise = result.current.signOut();
    });

    // Wait for the promise to resolve and the state to reset
    await act(async () => {
      if (signOutPromise) {
        await signOutPromise;
      }
    });
    expect(result.current.isPending).toBe(false);
  });

  it('signOut should call Supabase client, show success toast, and navigate to signIn on success', async () => {
    const { result } = renderHook(() => useAuthActions());

    await act(async () => {
      await result.current.signOut();
    });

    expect(mockSignOut).toHaveBeenCalledTimes(1);
    expect(mockPush).toHaveBeenCalledTimes(1);
    expect(mockPush).toHaveBeenCalledWith('/mock-home'); // Correct navigation target
    expect(mockToastSuccess).toHaveBeenCalledTimes(1);
    // Use mockT
    expect(mockToastSuccess).toHaveBeenCalledWith(mockT('signOutSuccessTitle'));
    expect(mockToastError).not.toHaveBeenCalled();
  });

  it('signOut should show error toast on Supabase signOut failure', async () => {
    const mockSignOutError = { message: 'Sign out failed' };
    mockSignOut.mockResolvedValue({ error: mockSignOutError }); // Simulate Supabase signOut error
    const { result } = renderHook(() => useAuthActions());

    await act(async () => {
      // Hook should catch the error
      await result.current.signOut();
    });

    expect(mockSignOut).toHaveBeenCalledTimes(1);
    expect(mockToastError).toHaveBeenCalledTimes(1);
    // Match actual hook call signature using mockT
    expect(mockToastError).toHaveBeenCalledWith(mockT('signOutErrorTitle'), {
      description: mockT('signOutErrorDescription'),
    });
    expect(mockPush).not.toHaveBeenCalled(); // Should not navigate on failure
    expect(mockToastSuccess).not.toHaveBeenCalled();
  });
});
