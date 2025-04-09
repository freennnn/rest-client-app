export default function ConfirmEmailDisplay({ email }: { email: string }) {
  return (
    <div className='max-w-md w-full space-y-8 p-8 bg-white dark:bg-gray-800 rounded-lg shadow-lg'>
      <div className='text-center'>
        <h2 className='mt-6 text-3xl font-bold text-gray-900 dark:text-white'>Check your email</h2>
        <p className='mt-2 text-sm text-gray-600 dark:text-gray-400'>
          We sent an activation link to{' '}
          <span className='font-medium text-gray-900 dark:text-white'>{email}</span>
        </p>
      </div>
      <div className='mt-8 space-y-4'>
        <p className='text-sm text-gray-600 dark:text-gray-400'>
          Please check your email and click the activation link to complete your registration.
        </p>
        <p className='text-sm text-gray-600 dark:text-gray-400'>
          If you do not see the email, check your spam folder.
        </p>
      </div>
    </div>
  );
}
