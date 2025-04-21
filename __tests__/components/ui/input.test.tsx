import React from 'react';

import { Input } from '@/components/ui/input';
import { describe, expect, it, jest } from '@jest/globals';
import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

jest.mock('@/lib/utils', () => {
  const originalModule = jest.requireActual('@/lib/utils') as Record<string, unknown>;
  return {
    ...originalModule,
    cn: (...inputs: (string | boolean | null | undefined)[]) => inputs.filter(Boolean).join(' '),
  };
});

describe('Input Component', () => {
  it('renders an input element', () => {
    render(<Input data-testid='test-input' />);
    const input = screen.getByTestId('test-input') as HTMLInputElement;
    expect(input).toBeInTheDocument();
    expect(input.type).toBe('text');
  });

  it('renders with a specific type', () => {
    render(<Input type='password' data-testid='test-input' />);
    const input = screen.getByTestId('test-input');
    expect(input).toHaveAttribute('type', 'password');
  });

  it('renders with a placeholder', () => {
    render(<Input placeholder='Enter text' data-testid='test-input' />);
    const input = screen.getByTestId('test-input');
    expect(input).toHaveAttribute('placeholder', 'Enter text');
  });

  it('handles value changes', async () => {
    const handleChange = jest.fn();
    render(<Input onChange={handleChange} data-testid='test-input' />);
    const input = screen.getByTestId('test-input') as HTMLInputElement;

    await userEvent.type(input, 'test value');

    expect(handleChange).toHaveBeenCalledTimes(10);
    expect(input.value).toBe('test value');
  });

  it('renders as disabled', () => {
    render(<Input disabled data-testid='test-input' />);
    const input = screen.getByTestId('test-input');
    expect(input).toBeDisabled();
  });

  it('applies additional className', () => {
    render(<Input className='my-custom-class' data-testid='test-input' />);
    const input = screen.getByTestId('test-input');
    expect(input).toHaveClass('my-custom-class');
    expect(input).toHaveClass('h-9');
  });

  it('renders with aria-invalid when invalid', () => {
    render(<Input aria-invalid={true} data-testid='test-input' />);
    const input = screen.getByTestId('test-input');
    expect(input).toHaveAttribute('aria-invalid', 'true');
  });
});
