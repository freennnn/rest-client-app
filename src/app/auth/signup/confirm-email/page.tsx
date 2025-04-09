import ConfirmEmailDisplay from '@/features/auth/ConfirmEmailDisplay';

export default async function SignUpSuccessPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const email = (await searchParams).email;
  return (
    <div className='min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900'>
      <ConfirmEmailDisplay email={(email as string) || 'provided email'} />
    </div>
  );
}
