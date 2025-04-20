import { SignInForm } from '@/components/SignInForm';
import { homePath } from '@/paths';
import { createClient } from '@/utils/supabase/server';
// Imports for auth check and redirect
import { redirect } from 'next/navigation';

export default async function SignInPage({
  searchParams: searchParamsPromise, // Rename for clarity
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  // Auth check first
  const supabase = await createClient();
  const { data } = await supabase.auth.getUser();

  if (data.user) {
    // If user is logged in, redirect to home
    redirect(homePath());
  }

  // Proceed with rendering sign-in form if not logged in
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
