import { signOut } from '@/actions/authActions';
import SignInButton from '@/features/auth/SignInButton';
import SignUpButton from '@/features/auth/SignUpButton';
import { createClient } from '@/utils/supabase/server';
import { Locale } from 'next-intl';
import { setRequestLocale } from 'next-intl/server';

type Props = {
  params: Promise<{ locale: Locale }>;
};

export default async function IndexPage({ params }: Props) {
  const { locale } = await params;
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
    </>
  );
}
