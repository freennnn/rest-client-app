import { signIn } from '@/actions/authActions';

export default async function SignInPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const params = await searchParams;
  const email = typeof params.email === 'string' ? params.email : '';

  return (
    <form>
      <label htmlFor='email'>Email:</label>
      <input id='email' name='email' type='email' required defaultValue={email} />
      <label htmlFor='password'>Password:</label>
      <input id='password' name='password' type='password' required />
      <button formAction={signIn}>Sign in</button>
    </form>
  );
}
