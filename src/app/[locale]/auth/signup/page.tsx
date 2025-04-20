import { SignUpForm } from '@/components/SignUpForm';
import { homePath } from '@/paths';
import { createClient } from '@/utils/supabase/server';
// Imports for auth check and redirect
import { redirect } from 'next/navigation';

// Make component async
export default async function SignUpPage() {
  // Auth check first
  const supabase = await createClient();
  const { data } = await supabase.auth.getUser();

  if (data.user) {
    // If user is logged in, redirect to home
    redirect(homePath());
  }

  // Proceed with rendering sign-up form if not logged in
  return (
    <div className='flex w-full items-center justify-center p-6 py-10 md:p-10 md:py-16'>
      <div className='w-full max-w-sm'>
        <SignUpForm />
      </div>
    </div>
  );
}
