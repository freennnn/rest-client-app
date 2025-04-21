import React from 'react';

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { render, screen } from '@testing-library/react';

describe('Select Component', () => {
  test('renders Select component with default props', () => {
    render(
      <Select>
        <SelectTrigger>
          <SelectValue placeholder='Select option' />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value='1'>Option 1</SelectItem>
          <SelectItem value='2'>Option 2</SelectItem>
        </SelectContent>
      </Select>
    );

    expect(screen.getByText('Select option')).toBeInTheDocument();
  });

  test('renders Select component with provided value', () => {
    render(
      <Select value='1'>
        <SelectTrigger>
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value='1'>Option 1</SelectItem>
          <SelectItem value='2'>Option 2</SelectItem>
        </SelectContent>
      </Select>
    );

    const trigger = screen.getByRole('combobox');
    expect(trigger).toBeInTheDocument();
  });

  test('renders Select with disabled state', () => {
    render(
      <Select disabled>
        <SelectTrigger>
          <SelectValue placeholder='Select option' />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value='1'>Option 1</SelectItem>
        </SelectContent>
      </Select>
    );

    const trigger = screen.getByRole('combobox');

    expect(trigger).toHaveAttribute('disabled');
    expect(trigger).toHaveClass('disabled:opacity-50');
  });

  test('renders SelectItem with disabled state', () => {
    render(
      <Select>
        <SelectTrigger>
          <SelectValue placeholder='Select option' />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value='1' disabled>
            Option 1
          </SelectItem>
        </SelectContent>
      </Select>
    );

    expect(screen.getByRole('combobox')).toBeInTheDocument();
  });
});
