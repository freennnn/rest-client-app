import React from 'react';
import { useForm } from 'react-hook-form';

import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { render, screen } from '@testing-library/react';

interface TestSchema {
  test: string;
}

const TestForm = ({ error }: { error?: string }) => {
  const methods = useForm<TestSchema>();
  React.useEffect(() => {
    if (error) {
      methods.setError('test', { type: 'manual', message: error });
    }
  }, [error, methods]);

  return (
    <Form {...methods}>
      <FormField
        name='test'
        control={methods.control}
        render={({ field }) => (
          <FormItem>
            <FormLabel>My Label</FormLabel>
            <FormControl>
              <input data-testid='ctrl' {...field} />
            </FormControl>
            <FormDescription>Description text</FormDescription>
            <FormMessage>Initial message</FormMessage>
          </FormItem>
        )}
      />
    </Form>
  );
};

describe('Form integration components', () => {
  test('renders label, control, description, and message without error', () => {
    render(<TestForm />);
    const label = screen.getByText('My Label');
    expect(label).toHaveAttribute('for');
    expect(label.getAttribute('data-error')).toBe('false');

    const ctrl = screen.getByTestId('ctrl');
    const describedBy = ctrl.getAttribute('aria-describedby');
    expect(describedBy).toContain('-form-item-description');
    expect(ctrl).toHaveAttribute('aria-invalid', 'false');

    const desc = screen.getByText('Description text');
    expect(desc).toHaveAttribute('data-slot', 'form-description');

    const msg = screen.getByText('Initial message');
    expect(msg).toHaveAttribute('data-slot', 'form-message');
  });

  test('shows error message and updates attributes on error', () => {
    render(<TestForm error='Oops error' />);
    const label = screen.getByText('My Label');
    expect(label.getAttribute('data-error')).toBe('true');

    const ctrl = screen.getByTestId('ctrl');
    const describedBy = ctrl.getAttribute('aria-describedby');
    expect(describedBy).toContain('-form-item-description');
    expect(describedBy).toContain('-form-item-message');
    expect(ctrl).toHaveAttribute('aria-invalid', 'true');

    expect(screen.getByText('Oops error')).toBeInTheDocument();
  });
});

describe('form exports', () => {
  test('should export all form components', () => {
    expect(Form).toBeDefined();
    expect(FormField).toBeDefined();
    expect(FormItem).toBeDefined();
    expect(FormLabel).toBeDefined();
    expect(FormControl).toBeDefined();
    expect(FormDescription).toBeDefined();
    expect(FormMessage).toBeDefined();
  });
});
