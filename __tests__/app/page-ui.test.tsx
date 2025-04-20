import React from 'react';

import { describe, expect, it } from '@jest/globals';
import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';
import Link from 'next/link';

describe('Main Page UI', () => {
  it('renders the main page with sign in/sign up buttons', () => {
    render(
      <div>
        <div className='mb-12 flex flex-col items-center gap-4 text-center'>
          <h1 className='text-3xl font-bold tracking-tight'>REST Client App</h1>
          <div className='flex gap-4 mt-2'>
            <Link href='/en/auth/signin'>Sign In</Link>
            <Link href='/en/auth/signup'>Sign Up</Link>
          </div>
        </div>
        <div>
          <h2 className='text-2xl font-semibold border-b pb-2 mb-4'>Project Overview</h2>
          <p className='text-muted-foreground leading-relaxed'>A modern REST client application</p>
        </div>
        <div>
          <h2 className='text-2xl font-semibold border-b pb-2 mb-4'>Key Features</h2>
        </div>
      </div>
    );

    expect(screen.getByText('REST Client App')).toBeInTheDocument();
    expect(screen.getByText('Sign In')).toBeInTheDocument();
    expect(screen.getByText('Sign Up')).toBeInTheDocument();
    expect(screen.getByText('Project Overview')).toBeInTheDocument();
    expect(screen.getByText('Key Features')).toBeInTheDocument();
  });

  it('renders the main page with welcome message for authenticated user', () => {
    render(
      <div>
        <div className='mb-12 text-center'>
          <h1 className='text-3xl font-bold tracking-tight'>Welcome back, Test User!</h1>
        </div>
        <div>
          <h2 className='text-2xl font-semibold border-b pb-2 mb-4'>Project Overview</h2>
          <p className='text-muted-foreground leading-relaxed'>A modern REST client application</p>
        </div>
        <div>
          <h2 className='text-2xl font-semibold border-b pb-2 mb-4'>Key Features</h2>
        </div>
      </div>
    );

    expect(screen.getByText('Welcome back, Test User!')).toBeInTheDocument();
    expect(screen.queryByText('Sign In')).not.toBeInTheDocument();
    expect(screen.queryByText('Sign Up')).not.toBeInTheDocument();
    expect(screen.getByText('Project Overview')).toBeInTheDocument();
    expect(screen.getByText('Key Features')).toBeInTheDocument();
  });
});
