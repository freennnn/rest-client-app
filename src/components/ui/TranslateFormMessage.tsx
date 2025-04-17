// src/components/ui/TranslatedFormMessage.tsx
import * as React from 'react';

import { useFormField } from '@/components/ui/form';
import { cn } from '@/lib/utils';
import { useTranslations } from 'next-intl';

interface TranslatedFormMessageProps extends React.HTMLAttributes<HTMLParagraphElement> {
  children?: string; // Translation key
  namespace?: string; // Optional namespace for translations
}

export function TranslatedFormMessage({
  className,
  children,
  namespace,
  ...props
}: TranslatedFormMessageProps) {
  const { error, formMessageId } = useFormField();
  const t = useTranslations(namespace);
  const body = error ? String(error?.message) : undefined;

  if (!children && !body) {
    return null;
  }

  return (
    <p className={cn('text-destructive text-sm', className)} id={formMessageId} {...props}>
      {children ? t(children) : body}
    </p>
  );
}
