import React from 'react';

import {
  FormControl,
  FormDescription,
  FormLabel,
  FormMessage,
  useFormField,
} from '@/components/ui/form';
import { render, screen } from '@testing-library/react';

jest.mock('@/components/ui/form', () => {
  const actual = jest.requireActual('@/components/ui/form');
  return {
    ...actual,
    useFormField: jest.fn(),
  };
});

const mockUseFormField = useFormField as jest.Mock;

describe.skip('Form UI unit components', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('FormLabel', () => {
    test('renders with no error', () => {
      mockUseFormField.mockReturnValue({ error: undefined, formItemId: 'fid' });
      render(<FormLabel>Label</FormLabel>);
      const label = screen.getByText('Label');
      expect(label).toHaveAttribute('for', 'fid');
      expect(label).toHaveAttribute('data-error', 'false');
    });

    test('renders with error', () => {
      mockUseFormField.mockReturnValue({ error: new Error('err'), formItemId: 'fid' });
      render(<FormLabel>Label</FormLabel>);
      const label = screen.getByText('Label');
      expect(label).toHaveAttribute('data-error', 'true');
    });
  });

  describe('FormControl', () => {
    test('renders child and attributes without error', () => {
      mockUseFormField.mockReturnValue({
        error: undefined,
        formItemId: 'fid',
        formDescriptionId: 'desc',
        formMessageId: 'msg',
      });
      render(
        <FormControl>
          <span data-testid='child' />
        </FormControl>
      );
      const el = screen.getByTestId('child');
      const wrapper = el.parentElement;
      expect(wrapper).toHaveAttribute('id', 'fid');
      expect(wrapper).toHaveAttribute('aria-describedby', 'desc');
      expect(wrapper).toHaveAttribute('aria-invalid', 'false');
    });

    test('renders child and attributes with error', () => {
      mockUseFormField.mockReturnValue({
        error: new Error(),
        formItemId: 'fid',
        formDescriptionId: 'desc',
        formMessageId: 'msg',
      });
      render(
        <FormControl>
          <span data-testid='child' />
        </FormControl>
      );
      const el = screen.getByTestId('child');
      const wrapper = el.parentElement;
      expect(wrapper).toHaveAttribute('aria-describedby', 'desc msg');
      expect(wrapper).toHaveAttribute('aria-invalid', 'true');
    });
  });

  describe('FormDescription', () => {
    test('renders description text', () => {
      mockUseFormField.mockReturnValue({ formDescriptionId: 'desc-id' });
      render(<FormDescription>Help</FormDescription>);
      const desc = screen.getByText('Help');
      expect(desc).toHaveAttribute('id', 'desc-id');
      expect(desc).toHaveAttribute('data-slot', 'form-description');
    });
  });

  describe('FormMessage', () => {
    test('returns null when no error and no children', () => {
      mockUseFormField.mockReturnValue({ error: undefined, formMessageId: 'mid' });
      const { container } = render(<FormMessage />);
      expect(container.firstChild).toBeNull();
    });

    test('renders children when no error', () => {
      mockUseFormField.mockReturnValue({ error: undefined, formMessageId: 'mid' });
      render(<FormMessage>Note</FormMessage>);
      const msg = screen.getByText('Note');
      expect(msg).toHaveAttribute('id', 'mid');
      expect(msg).toHaveAttribute('data-slot', 'form-message');
    });

    test('renders error message when error present', () => {
      mockUseFormField.mockReturnValue({ error: new Error('fail'), formMessageId: 'mid' });
      render(<FormMessage>Ignored</FormMessage>);
      const msg = screen.getByText('fail');
      expect(msg).toHaveAttribute('id', 'mid');
    });

    test('children take precedence over error', () => {
      mockUseFormField.mockReturnValue({ error: new Error('fail'), formMessageId: 'mid' });
      render(<FormMessage>Override</FormMessage>);
      const msg = screen.getByText('Override');
      expect(msg).toHaveAttribute('id', 'mid');
      expect(screen.queryByText('fail')).toBeNull();
    });
  });

  describe('useFormField context error', () => {
    test('throws error when no FormField provider', () => {
      const BadComponent = () => <FormLabel>Bad</FormLabel>;
      expect(() => render(<BadComponent />)).toThrow(
        'useFormField should be used within <FormField>'
      );
    });
  });
});
