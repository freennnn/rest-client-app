import React from 'react';

import { TranslatedFormMessage } from '@/components/ui/TranslateFormMessage';
import { useFormField } from '@/components/ui/form';
import { render, screen } from '@testing-library/react';
import { useTranslations } from 'next-intl';

jest.mock('@/components/ui/form', () => ({
  useFormField: jest.fn(),
}));

jest.mock('next-intl', () => ({
  useTranslations: jest.fn(),
}));

describe('TranslatedFormMessage', () => {
  const mockUseFormField = useFormField as jest.Mock;
  const mockUseTranslations = useTranslations as jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();
    mockUseTranslations.mockReturnValue((key: string) => `translated:${key}`);
  });

  test('renders nothing when no children and no error', () => {
    mockUseFormField.mockReturnValue({ error: undefined, formMessageId: 'msgid' });
    const { container } = render(<TranslatedFormMessage />);
    expect(container.firstChild).toBeNull();
  });

  test('renders translated children when children provided', () => {
    mockUseFormField.mockReturnValue({ error: undefined, formMessageId: 'msgid' });
    render(<TranslatedFormMessage>myKey</TranslatedFormMessage>);
    expect(screen.getByText('translated:myKey')).toBeInTheDocument();
  });

  test('renders error message when error provided and no children', () => {
    mockUseFormField.mockReturnValue({
      error: new Error('error occurred'),
      formMessageId: 'msgid',
    });
    render(<TranslatedFormMessage />);
    expect(screen.getByText('error occurred')).toBeInTheDocument();
  });

  test('renders translated children when both children and error provided', () => {
    mockUseFormField.mockReturnValue({
      error: new Error('error occurred'),
      formMessageId: 'msgid',
    });
    render(<TranslatedFormMessage>myKey</TranslatedFormMessage>);
    expect(screen.getByText('translated:myKey')).toBeInTheDocument();
    expect(screen.queryByText('error occurred')).toBeNull();
  });
});
