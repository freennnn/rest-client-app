import { Button } from '@/components/ui/button';
import { Link } from '@/i18n/navigation';
import { signInPath, signUpPath } from '@/paths';
import { createClient } from '@/utils/supabase/server';
import { Locale } from 'next-intl';
import { getTranslations, setRequestLocale } from 'next-intl/server';

type Props = {
  params: Promise<{ locale: Locale }>;
};

// export async function generateMetadata({ params }: Props): Promise<Metadata> {
//   const { locale } = await params;
//   const t = await getTranslations({ locale, namespace: 'MainPage' });

//   return {
//     title: t('title'),
//   };
// }
// // Attemp for SSG for our main page
// export function generateStaticParams() {
//   return routing.locales.map((locale) => ({ locale }));
// }

export default async function IndexPage({ params }: Props) {
  const { locale } = await params;
  // console.log('IndexPage locale =', locale);

  // next-intl uses its middleware to attach an x-next-intl-locale header to the incoming request,
  // holding the negotiated locale as a value. This technique allows the locale
  // to be read at arbitrary places (like regular ServerComponents,
  // not pages or layours with locale param) via headers().get('x-next-intl-locale').
  // However, the usage of headers opts the route into dynamic rendering.
  // By using setRequestLocale, we provide the locale (that is received
  // in layouts and pages via params) to next-intl. All APIs from next-intl
  // can now read from this value instead of the header, enabling static rendering.

  setRequestLocale(locale);

  const supabase = await createClient();

  const { data: userData } = await supabase.auth.getUser();
  const user = userData?.user;
  const t = await getTranslations('MainPage');

  return (
    <div className='container mx-auto max-w-4xl py-10 px-4'>
      {/* === Top Section: Title & Auth === */}
      {user ? (
        <div className='mb-12 text-center'>
          <h1 className='text-3xl font-bold tracking-tight'>
            {t('welcomeBack', { name: user.user_metadata?.name || t('userName') })}
          </h1>
        </div>
      ) : (
        <div className='mb-12 flex flex-col items-center gap-4 text-center'>
          <h1 className='text-4xl font-bold tracking-tight'>{t('title')}</h1>
          <div className='flex gap-4 mt-2'>
            <Button size='lg' asChild>
              <Link href={signInPath()}>{t('signIn')}</Link>
            </Button>
            <Button size='lg' asChild variant='secondary'>
              <Link href={signUpPath()}>{t('signUp')}</Link>
            </Button>
          </div>
        </div>
      )}

      {/* === Main Content Section === */}
      <section className='space-y-10'>
        {/* --- Project Overview --- */}
        <div>
          <h2 className='text-2xl font-semibold border-b pb-2 mb-4'>{t('projectOverviewTitle')}</h2>
          <p className='text-muted-foreground leading-relaxed'>{t('projectOverviewDesc')}</p>
        </div>

        {/* --- Key Features --- */}
        <div>
          <h2 className='text-2xl font-semibold border-b pb-2 mb-4'>{t('keyFeaturesTitle')}</h2>
          <div className='space-y-6'>
            <div>
              <h3 className='text-lg font-medium mb-2'>{t('keyFeaturesApiSupportTitle')}</h3>
              <p className='text-muted-foreground ml-4'>{t('keyFeaturesApiSupportDesc')}</p>
            </div>

            <div>
              <h3 className='text-lg font-medium mb-2'>{t('keyFeaturesReqConstTitle')}</h3>
              <ul className='list-disc list-outside space-y-2 pl-8 text-muted-foreground'>
                <li>
                  <strong>{t('keyFeaturesReqConstMethodLabel')}:</strong>{' '}
                  {t('keyFeaturesReqConstMethodDesc')}
                </li>
                <li>
                  <strong>{t('keyFeaturesReqConstEndpointLabel')}:</strong>{' '}
                  {t('keyFeaturesReqConstEndpointDesc')}
                </li>
                <li>
                  <strong>{t('keyFeaturesReqConstHeadersLabel')}:</strong>{' '}
                  {t('keyFeaturesReqConstHeadersDesc')}
                </li>
                <li>
                  <strong>{t('keyFeaturesReqConstBodyLabel')}:</strong>{' '}
                  {t('keyFeaturesReqConstBodyDesc')}
                </li>
              </ul>
            </div>

            <div>
              <h3 className='text-lg font-medium mb-2'>{t('keyFeaturesVarsTitle')}</h3>
              <p className='text-muted-foreground ml-4'>{t('keyFeaturesVarsDesc')}</p>
            </div>

            <div>
              <h3 className='text-lg font-medium mb-2'>{t('keyFeaturesRespVisTitle')}</h3>
              <ul className='list-disc list-outside space-y-2 pl-8 text-muted-foreground'>
                <li>
                  <strong>{t('keyFeaturesRespVisStatusLabel')}:</strong>{' '}
                  {t('keyFeaturesRespVisStatusDesc')}
                </li>
                <li>
                  <strong>{t('keyFeaturesRespVisFormatLabel')}:</strong>{' '}
                  {t('keyFeaturesRespVisFormatDesc')}
                </li>
              </ul>
            </div>

            <div>
              <h3 className='text-lg font-medium mb-2'>{t('keyFeaturesHistoryTitle')}</h3>
              <ul className='list-disc list-outside space-y-2 pl-8 text-muted-foreground'>
                <li>
                  <strong>{t('keyFeaturesHistoryStorageLabel')}:</strong>{' '}
                  {t('keyFeaturesHistoryStorageDesc')}
                </li>
                <li>
                  <strong>{t('keyFeaturesHistoryMgmtLabel')}:</strong>{' '}
                  {t('keyFeaturesHistoryMgmtDesc')}
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* --- Technical Specifications --- */}
        <div>
          <h2 className='text-2xl font-semibold border-b pb-2 mb-4'>{t('techSpecTitle')}</h2>
          <ul className='list-disc list-outside space-y-2 pl-8 text-muted-foreground'>
            <li>
              <strong>{t('techSpecFrameworksLabel')}:</strong> {t('techSpecFrameworksValue')}
            </li>
            <li>
              <strong>{t('techSpecAuthLabel')}:</strong> {t('techSpecAuthValue')}
            </li>
            <li>
              <strong>{t('techSpecRoutingLabel')}:</strong> {t('techSpecRoutingValue')}
            </li>
            <li>
              <strong>{t('techSpecErrorHandlingLabel')}:</strong> {t('techSpecErrorHandlingValue')}
            </li>
            <li>
              <strong>{t('techSpecI18nLabel')}:</strong> {t('techSpecI18nValue')}
            </li>
            <li>
              <strong>{t('techSpecResponsiveLabel')}:</strong> {t('techSpecResponsiveValue')}
            </li>
            <li>
              <strong>{t('techSpecDevPracticesLabel')}:</strong> {t('techSpecDevPracticesValue')}
            </li>
            <li>
              <strong>{t('techSpecDeploymentLabel')}:</strong> {t('techSpecDeploymentValue')}
            </li>
          </ul>
        </div>

        {/* --- Conclusion --- */}
        <div>
          <h2 className='text-2xl font-semibold border-b pb-2 mb-4'>{t('conclusionTitle')}</h2>
          <p className='text-muted-foreground leading-relaxed'>{t('conclusionDesc')}</p>
        </div>
      </section>
    </div>
  );
}
