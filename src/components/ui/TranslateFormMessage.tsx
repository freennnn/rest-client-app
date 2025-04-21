import * as React from 'react';

import { useFormField } from '@/components/ui/form';
import { cn } from '@/lib/utils';
import { useTranslations } from 'next-intl';

interface TranslatedFormMessageProps extends React.HTMLAttributes<HTMLParagraphElement> {
  children?: string;
  namespace?: string;
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
