import { SignInForm } from '@/components/SignInForm';
import { homePath } from '@/paths';
import { createClient } from '@/utils/supabase/server';
import { redirect } from 'next/navigation';

export default async function SignInPage({
  searchParams: searchParamsPromise,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const supabase = await createClient();
  const { data } = await supabase.auth.getUser();

  if (data.user) {
    redirect(homePath());
  }

  const params = await searchParamsPromise;
  const email = typeof params.email === 'string' ? params.email : '';

  return (
    <div className='flex w-full items-center justify-center p-6 py-10 md:p-10 md:py-16'>
      <div className='w-full max-w-sm'>
        <SignInForm email={email} />
      </div>
    </div>
  );
}
