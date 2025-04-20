import React from 'react';

import SignUpPage from '@/app/[locale]/auth/signup/page';
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

// Mock the actual SignUpForm component
jest.mock('@/components/SignUpForm', () => ({
  SignUpForm: jest.fn(() => <div data-testid='mock-signup-form'>Mock SignUpForm</div>),
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

describe('SignUpPage Server Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Default to unauthenticated
    mockSupabaseAuthState(null);
  });

  it('should redirect to home if user is already authenticated', async () => {
    mockSupabaseAuthState({ id: '123' }); // Mock authenticated user

    // Call the component function (it's async)
    const PageComponentPromise = SignUpPage(); // SignUpPage doesn't take searchParams
    await PageComponentPromise; // Await completion to ensure redirect is called

    // Verify redirect was called
    expect(redirect).toHaveBeenCalledTimes(1);
    expect(redirect).toHaveBeenCalledWith('/mock/home');
  });

  it('should render SignUpForm if user is not authenticated', async () => {
    mockSupabaseAuthState(null); // Ensure user is not authenticated

    const PageComponent = await SignUpPage();
    render(PageComponent);

    // Verify SignUpForm was rendered (using the mock)
    expect(screen.getByTestId('mock-signup-form')).toBeInTheDocument();
    expect(redirect).not.toHaveBeenCalled();
  });
});
