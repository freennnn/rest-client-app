import { signOut } from '@/actions/authActions';
import { SignOutButton } from '@/components/SignOutButton';
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
  const t = await getTranslations({ locale, namespace: 'MainPage' });

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
      <div className='z-10 max-w-5xl w-full items-center justify-between font-mono text-sm lg:flex'>
        <p className='fixed left-0 top-0 flex w-full justify-center border-b border-gray-300 bg-gradient-to-b from-zinc-200 pb-6 pt-8 backdrop-blur-2xl dark:border-neutral-800 dark:bg-zinc-800/30 dark:from-inherit lg:static lg:w-auto lg:rounded-xl lg:border lg:bg-gray-200 lg:p-4 lg:dark:bg-zinc-800/30'>
          {t('title')}
        </p>
        <div className='fixed bottom-0 left-0 flex h-48 w-full items-end justify-center bg-gradient-to-t from-white via-white dark:from-black dark:via-black lg:static lg:h-auto lg:w-auto lg:bg-none'>
          <SignOutButton />
        </div>
      </div>
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
