import React from 'react';

// import userEvent from '@testing-library/user-event'; // No longer needed as action buttons removed
import { AuthenticationProvider, useAuth } from '@/providers/AuthenticationProvider';
import { Session, User } from '@supabase/supabase-js';
import { SupabaseClient } from '@supabase/supabase-js';
import { act, render, screen, waitFor } from '@testing-library/react';

// --- Mocks ---

// Mock Supabase client
// const mockSignIn = jest.fn(); // Removed
// const mockSignUp = jest.fn(); // Removed
// const mockSignOut = jest.fn(); // Removed
const mockGetSession = jest.fn();
const mockOnAuthStateChange = jest.fn();

const mockSupabase = {
  auth: {
    // signInWithPassword: mockSignIn, // Removed
    // signUp: mockSignUp, // Removed
    // signOut: mockSignOut, // Removed
    getSession: mockGetSession,
    onAuthStateChange: mockOnAuthStateChange,
  },
} as unknown as SupabaseClient;

jest.mock('@/utils/supabase/client', () => ({
  createClient: jest.fn(() => mockSupabase),
}));

// Mock sonner (if used directly in Provider)
// jest.mock('sonner', ...); // Keep if provider uses it for errors, otherwise remove

// --- Test Setup ---

// Helper component to consume context
const TestConsumerComponent = () => {
  const { user, isAuthenticated, isLoading } = useAuth();

  return (
    <div>
      <div data-testid='loading'>{isLoading ? 'Loading' : 'Idle'}</div>
      <div data-testid='user'>{user ? `User: ${user.id}` : 'No User'}</div>
      <div data-testid='isAuthenticated'>
        {isAuthenticated ? 'Authenticated' : 'Not Authenticated'}
      </div>
      {/* Removed displays/buttons for session, error, login, logout, signUp */}
    </div>
  );
};

// Helper to render provider and consumer
const renderProvider = () => {
  return render(
    <AuthenticationProvider>
      <TestConsumerComponent />
    </AuthenticationProvider>
  );
};

// Sample mock data
const mockUser: User = {
  id: 'user-123',
  app_metadata: {},
  user_metadata: {},
  aud: 'authenticated',
  created_at: '',
};
const mockSession: Session = {
  access_token: 'abc',
  refresh_token: 'def',
  user: mockUser,
  token_type: 'bearer',
  expires_in: 3600,
};

// --- Tests ---
describe('AuthenticationProvider', () => {
  let onAuthStateChangeCallback: (event: string, session: Session | null) => void;

  beforeEach(() => {
    jest.clearAllMocks();
    mockGetSession.mockResolvedValue({ data: { session: null }, error: null });
    mockOnAuthStateChange.mockImplementation((callback) => {
      onAuthStateChangeCallback = callback;
      // Don't auto-call callback immediately, let getSession finish first in test
      return { data: { subscription: { unsubscribe: jest.fn() } } };
    });
  });

  it('should initialize as loading, then update to idle with no user', async () => {
    renderProvider();
    // Should initially be loading while getSession runs
    expect(screen.getByTestId('loading')).toHaveTextContent('Loading');
    expect(screen.getByTestId('user')).toHaveTextContent('No User');
    expect(screen.getByTestId('isAuthenticated')).toHaveTextContent('Not Authenticated');

    // Wait for getSession mock to resolve and isLoading to become false
    await waitFor(() => expect(screen.getByTestId('loading')).toHaveTextContent('Idle'));
    expect(screen.getByTestId('user')).toHaveTextContent('No User');
    expect(screen.getByTestId('isAuthenticated')).toHaveTextContent('Not Authenticated');
    expect(mockGetSession).toHaveBeenCalledTimes(1);
    expect(mockOnAuthStateChange).toHaveBeenCalledTimes(1);
  });

  it('should initialize with user if getSession returns a session', async () => {
    mockGetSession.mockResolvedValue({ data: { session: mockSession }, error: null });
    renderProvider();

    expect(screen.getByTestId('loading')).toHaveTextContent('Loading');
    await waitFor(() => expect(screen.getByTestId('loading')).toHaveTextContent('Idle'));
    expect(screen.getByTestId('user')).toHaveTextContent(`User: ${mockUser.id}`);
    expect(screen.getByTestId('isAuthenticated')).toHaveTextContent('Authenticated');
  });

  it('should update context on SIGNED_IN event from onAuthStateChange', async () => {
    renderProvider();
    // Wait for initial load
    await waitFor(() => expect(screen.getByTestId('loading')).toHaveTextContent('Idle'));
    expect(screen.getByTestId('isAuthenticated')).toHaveTextContent('Not Authenticated');

    // Simulate Supabase SIGNED_IN event via the captured callback
    act(() => {
      onAuthStateChangeCallback('SIGNED_IN', mockSession);
    });

    await waitFor(() => {
      expect(screen.getByTestId('user')).toHaveTextContent(`User: ${mockUser.id}`);
      expect(screen.getByTestId('isAuthenticated')).toHaveTextContent('Authenticated');
    });
  });

  it('should update context on SIGNED_OUT event from onAuthStateChange', async () => {
    // Start logged in
    mockGetSession.mockResolvedValue({ data: { session: mockSession }, error: null });
    renderProvider();
    await waitFor(() =>
      expect(screen.getByTestId('isAuthenticated')).toHaveTextContent('Authenticated')
    );

    // Simulate Supabase SIGNED_OUT event
    act(() => {
      onAuthStateChangeCallback('SIGNED_OUT', null);
    });

    await waitFor(() => {
      expect(screen.getByTestId('user')).toHaveTextContent('No User');
      expect(screen.getByTestId('isAuthenticated')).toHaveTextContent('Not Authenticated');
    });
  });

  // Removed tests for login, logout, signUp actions via context
});
