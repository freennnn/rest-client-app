import { SignUpForm } from '@/components/SignUpForm';
import { homePath } from '@/paths';
import { createClient } from '@/utils/supabase/server';
import { redirect } from 'next/navigation';

export default async function SignUpPage() {
  const supabase = await createClient();
  const { data } = await supabase.auth.getUser();

  if (data.user) {
    redirect(homePath());
  }

  return (
    <div className='flex w-full items-center justify-center p-6 py-10 md:p-10 md:py-16'>
      <div className='w-full max-w-sm'>
        <SignUpForm />
      </div>
    </div>
  );
}
