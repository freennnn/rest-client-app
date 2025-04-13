import { signOut } from '@/actions/authActions';
import SignInButton from '@/features/auth/SignInButton';
import SignUpButton from '@/features/auth/SignUpButton';
import { routing } from '@/i18n/routing';
import { createClient } from '@/utils/supabase/server';
import { Locale } from 'next-intl';
import { setRequestLocale } from 'next-intl/server';
import { getTranslations } from 'next-intl/server';
import Link from 'next/link';

type Props = {
  params: Promise<{ locale: Locale }>;
};

export async function generateMetadata({ params }: Props) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'MainPage' });

  return {
    title: t('title'),
  };
}
// Attemp for SSG for our main page
export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export default async function IndexPage({ params }: Props) {
  const { locale } = await params;
  console.log('IndexPage locale =', locale);

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
  const { data, error } = await supabase.auth.getUser();
  if (error || !data?.user) {
    //redirect(signInPath());
    return (
      <div>
        Hi guest, please sign in to use all the app features
        <SignInButton />
        <SignUpButton />
        <Link href='/GET' className='text-blue-500 hover:text-blue-700 underline'>
          Go to REST Client
        </Link>
      </div>
    );
  }
  return (
    <>
      {data.user && <p>Hello {data.user.email}</p>}
      {data.user && (
        <form action={signOut}>
          <button type='submit'>Sign Out</button>
        </form>
      )}
      <Link href='/GET' className='text-blue-500 hover:text-blue-700 underline'>
        Go to REST Client
      </Link>
    </>
  );
}
