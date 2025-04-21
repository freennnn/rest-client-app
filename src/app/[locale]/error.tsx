'use client';

import { Button } from '@/components/ui/button';
import { useRouter } from '@/i18n/navigation';
import { homePath } from '@/paths';
import { useTranslations } from 'next-intl';

export default function ErrorComponent({ error }: { error: Error & { digest?: string } }) {
  const t = useTranslations('ErrorPage');
  const router = useRouter();

  return (
    <div className='flex flex-col items-center justify-center flex-1 px-4 py-12 text-center'>
      <h2 className='text-2xl font-semibold text-destructive'>{t('title')}</h2>
      <p className='mt-4 text-muted-foreground'>
        {t('description')}
        {error.message ? ` (${error.message})` : ''}
      </p>
      <Button onClick={() => router.push(homePath())} className='mt-6'>
        {t('backToHome')}
      </Button>
    </div>
  );
}
