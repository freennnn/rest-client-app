import React from 'react';

import { Label } from '@/components/ui/label';
import { describe, expect, it, jest } from '@jest/globals';
import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';

jest.mock('@/lib/utils', () => {
  const originalModule = jest.requireActual('@/lib/utils') as Record<string, unknown>;
  return {
    ...originalModule,
    cn: (...inputs: (string | boolean | null | undefined)[]) => inputs.filter(Boolean).join(' '),
  };
});

describe('Label Component', () => {
  it('renders a label element', () => {
    render(<Label>Test Label</Label>);
    const label = screen.getByText('Test Label');
    expect(label).toBeInTheDocument();
    expect(label.tagName).toBe('LABEL');
  });

  it('renders with htmlFor attribute', () => {
    render(<Label htmlFor='test-input'>Test Label</Label>);
    const label = screen.getByText('Test Label');
    expect(label).toHaveAttribute('for', 'test-input');
  });

  it('applies additional className', () => {
    render(<Label className='my-custom-class'>Test Label</Label>);
    const label = screen.getByText('Test Label');
    expect(label).toHaveClass('my-custom-class');
    expect(label).toHaveClass('font-medium');
  });
});
