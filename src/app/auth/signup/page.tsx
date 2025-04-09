import { signUp } from '@/actions/authActions';

export default function SignUpPage() {
  return (
    <form>
      <label htmlFor='email'>Email:</label>
      <input id='email' name='email' type='email' required />
      <label htmlFor='password'>Password:</label>
      <input id='password' name='password' type='password' required />
      <button formAction={signUp}>Sign up</button>
    </form>
  );
}
