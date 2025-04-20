import { SignInForm } from '@/components/SignInForm';

export default async function SignInPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const params = await searchParams;
  const email = typeof params.email === 'string' ? params.email : '';

  return (
    <div className='flex w-full items-center justify-center p-6 py-10 md:p-10 md:py-16'>
      <div className='w-full max-w-sm'>
        <SignInForm email={email} />
      </div>
    </div>
  );
}
