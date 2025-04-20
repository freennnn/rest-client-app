import React from 'react';

import SignInPage from '@/app/[locale]/auth/signin/page';
import { createClient } from '@/utils/supabase/server';
import { User } from '@supabase/supabase-js';
import { render, screen } from '@testing-library/react';
import { redirect } from 'next/navigation';

// Mock Supabase server client
jest.mock('@/utils/supabase/server', () => ({
  createClient: jest.fn(),
}));

// Mock next/navigation redirect
jest.mock('next/navigation', () => ({
  redirect: jest.fn(),
}));

// Mock the actual SignInForm component to prevent testing its internals here
jest.mock('@/components/SignInForm', () => ({
  SignInForm: jest.fn(({ email }) => (
    <div data-testid='mock-signin-form' data-email={email}>
      Mock SignInForm
    </div>
  )),
}));

// Mock paths
jest.mock('@/paths', () => ({
  homePath: jest.fn(() => '/mock/home'),
}));

// Helper to mock Supabase auth state
const mockSupabaseAuthState = (user: Partial<User> | null) => {
  (createClient as jest.Mock).mockResolvedValue({
    auth: {
      getUser: jest.fn().mockResolvedValue({ data: { user } }),
    },
  });
};

// Test params
const mockSearchParams = {};

describe('SignInPage Server Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Default to unauthenticated
    mockSupabaseAuthState(null);
  });

  it('should redirect to home if user is already authenticated', async () => {
    mockSupabaseAuthState({ id: '123' }); // Mock authenticated user

    // Call the component function (it's async)
    const PageComponentPromise = SignInPage({ searchParams: Promise.resolve(mockSearchParams) });
    await PageComponentPromise; // Await completion to ensure redirect is called

    // Verify redirect was called
    expect(redirect).toHaveBeenCalledTimes(1);
    expect(redirect).toHaveBeenCalledWith('/mock/home');
  });

  it('should render SignInForm if user is not authenticated', async () => {
    mockSupabaseAuthState(null); // Ensure user is not authenticated

    const PageComponent = await SignInPage({ searchParams: Promise.resolve(mockSearchParams) });
    render(PageComponent);

    // Verify SignInForm was rendered (using the mock)
    expect(screen.getByTestId('mock-signin-form')).toBeInTheDocument();
    expect(redirect).not.toHaveBeenCalled();
  });

  it('should pass email search param to SignInForm', async () => {
    mockSupabaseAuthState(null);
    const emailParam = 'test@example.com';
    const searchParamsWithEmail = { email: emailParam };

    const PageComponent = await SignInPage({
      searchParams: Promise.resolve(searchParamsWithEmail),
    });
    render(PageComponent);

    const mockForm = screen.getByTestId('mock-signin-form');
    expect(mockForm).toBeInTheDocument();
    expect(mockForm).toHaveAttribute('data-email', emailParam);
    expect(redirect).not.toHaveBeenCalled();
  });
});
