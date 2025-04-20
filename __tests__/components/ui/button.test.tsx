import React from 'react';

import { Button } from '@/components/ui/button';
import { describe, expect, it } from '@jest/globals';
import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';
import Link from 'next/link';

jest.mock('@/lib/utils', () => ({
  cn: (...inputs: (string | undefined | null | boolean | Record<string, boolean>)[]) =>
    inputs.filter(Boolean).join(' '),
}));

describe('Button Component', () => {
  it('renders a button with default styling', () => {
    render(<Button>Click me</Button>);

    const button = screen.getByRole('button', { name: 'Click me' });
    expect(button).toBeInTheDocument();
    expect(button).toHaveClass('bg-primary');
    expect(button).toHaveClass('text-primary-foreground');
  });

  it('renders a button with different variants', () => {
    const { rerender } = render(<Button variant='destructive'>Destructive</Button>);

    let button = screen.getByRole('button', { name: 'Destructive' });
    expect(button).toHaveClass('bg-destructive');

    rerender(<Button variant='outline'>Outline</Button>);
    button = screen.getByRole('button', { name: 'Outline' });
    expect(button).toHaveClass('border');
    expect(button).toHaveClass('bg-background');

    rerender(<Button variant='secondary'>Secondary</Button>);
    button = screen.getByRole('button', { name: 'Secondary' });
    expect(button).toHaveClass('bg-secondary');

    rerender(<Button variant='ghost'>Ghost</Button>);
    button = screen.getByRole('button', { name: 'Ghost' });
    expect(button).toHaveClass('hover:bg-accent');

    rerender(<Button variant='link'>Link</Button>);
    button = screen.getByRole('button', { name: 'Link' });
    expect(button).toHaveClass('text-primary');
    expect(button).toHaveClass('hover:underline');
  });

  it('renders a button with different sizes', () => {
    const { rerender } = render(<Button size='default'>Default</Button>);

    let button = screen.getByRole('button', { name: 'Default' });
    expect(button).toHaveClass('h-9');

    rerender(<Button size='sm'>Small</Button>);
    button = screen.getByRole('button', { name: 'Small' });
    expect(button).toHaveClass('h-8');

    rerender(<Button size='lg'>Large</Button>);
    button = screen.getByRole('button', { name: 'Large' });
    expect(button).toHaveClass('h-10');

    rerender(<Button size='icon'>Icon</Button>);
    button = screen.getByRole('button', { name: 'Icon' });
    expect(button).toHaveClass('size-9');
  });
  it('renders as a child element when asChild is true', () => {
    render(
      <Button asChild>
        <Link href='/test'>Link Button</Link>
      </Button>
    );

    const linkButton = screen.getByRole('link', { name: 'Link Button' });
    expect(linkButton).toBeInTheDocument();
    expect(linkButton).toHaveAttribute('href', '/test');
    expect(linkButton).toHaveClass('bg-primary');
  });
});
