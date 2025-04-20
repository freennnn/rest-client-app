import { Button } from '@/components/ui/button';
import { Link } from '@/i18n/navigation';
import { homePath } from '@/paths';
import type { Metadata } from 'next';
import { getLocale, getTranslations, setRequestLocale } from 'next-intl/server';

type ResolvedParams = {
  locale?: string;
};

export async function generateMetadata({
  params: paramsPromise,
}: {
  params: Promise<ResolvedParams>;
}): Promise<Metadata> {
  const params = await paramsPromise;

  const locale = params?.locale ?? (await getLocale());

  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: 'NotFoundPage' });

  return {
    title: t('metadataTitle'),
  };
}

export default async function NotFoundPage({
  params: paramsPromise,
}: {
  params: Promise<ResolvedParams>;
}) {
  const params = await paramsPromise;

  const locale = params?.locale ?? (await getLocale());

  setRequestLocale(locale);

  const t = await getTranslations({ locale, namespace: 'NotFoundPage' });

  return (
    <div className='flex flex-col items-center justify-center flex-1 px-4 py-12 text-center'>
      <h1 className='text-4xl font-bold tracking-tight text-foreground sm:text-5xl'>
        {t('title')}
      </h1>
      <p className='mt-4 text-base text-muted-foreground'>{t('description')}</p>
      <Button asChild className='mt-6'>
        <Link href={homePath()}>{t('backToHome')}</Link>
      </Button>
    </div>
  );
}
