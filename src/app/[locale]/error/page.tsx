import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { getTranslations } from 'next-intl/server';

export default async function Page({ searchParams }: { searchParams: Promise<{ error: string }> }) {
  const t = await getTranslations('error');
  const params = await searchParams;

  return (
    <div className='container flex h-screen w-screen flex-col items-center justify-center'>
      <Card className='w-[400px]'>
        <CardHeader>
          <CardTitle>{t('title')}</CardTitle>
        </CardHeader>
        <CardContent>
          {params?.error ? (
            <p className='text-sm text-muted-foreground'>
              {t('withError', { error: params.error })}
            </p>
          ) : (
            <p className='text-sm text-muted-foreground'>{t('withoutError')}</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
