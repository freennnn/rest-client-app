'use server';

import { confirmEmailPath, homePath, signInPath } from '@/paths';
import { signInSchema, signUpSchema } from '@/utils/schemas/auth';
import { createClient } from '@/utils/supabase/server';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

// Base form state for sign in
export type SignInFormState = {
  success?: boolean;
  errors?: {
    _form?: string[];
    email?: string[];
    password?: string[];
  };
};

// Extended form state for sign up that includes name field
export type SignUpFormState = SignInFormState & {
  errors?: {
    _form?: string[];
    email?: string[];
    password?: string[];
    name?: string[];
  };
};

// success = redirect to confirmEmailPath(email), toast here only if errors
export async function signUp(
  prevState: SignUpFormState,
  formData: FormData
): Promise<SignUpFormState> {
  try {
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;
    const name = formData.get('name') as string;

    // Server-side validation
    const result = signUpSchema.safeParse({ email, password, name });
    if (!result.success) {
      return {
        errors: result.error.flatten().fieldErrors,
      };
    }

    const supabase = await createClient();

    // Check if user already exists (optional, but good practice)
    const { data: existingUser, error: fetchError } = await supabase
      .from('users') // Adjust if your profile table is different
      .select('id')
      .eq('email', email)
      .single();

    if (fetchError && fetchError.code !== 'PGRST116') {
      // Ignore 'not found' error
      throw fetchError;
    }

    if (existingUser) {
      // Redirect to sign-in page with email pre-filled
      redirect(`${signInPath(email)}?toast=user_already-exist`);
      // return {
      //   errors: { _form: ['User with this email already exists.'] },
      //   success: false,
      // };
    }

    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          name,
        },
      },
    });

    if (error) {
      console.error('Sign up error:', error);
      return {
        errors: { _form: ['Sign up failed: ' + error.message] },
        success: false,
      };
    }

    redirect(confirmEmailPath(email));
  } catch (error) {
    console.error('Sign up error:', error);
    return {
      errors: { _form: ['Sign up failed: An unexpected error occurred.'] },
      success: false,
    };
  }
}

// success = redirect to homePath() with toast there, toast here only if errors
export async function signIn(
  prevState: SignInFormState,
  formData: FormData
): Promise<SignInFormState> {
  try {
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;

    // Server-side validation
    const result = signInSchema.safeParse({ email, password });
    if (!result.success) {
      return {
        errors: result.error.flatten().fieldErrors,
      };
    }
    const supabase = await createClient();

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      console.error('Sign in error:', error);
      // Return error state for useActionState on the client
      return {
        errors: {
          _form: ['Sign in failed: ' + (error instanceof Error ? error.message : 'Supabase error')],
        },
        success: false,
      };
    }
  } catch (error) {
    console.error('Sign in error:', error);
    return {
      errors: {
        _form: ['Sign in failed: ' + (error instanceof Error ? error.message : 'Unknown error')],
      },
      success: false,
    };
  }

  // --- SUCCESS ---
  // 1. Invalidate Cache
  revalidatePath(homePath(), 'layout');

  // 2. Redirect with success flag for toast and auth event for AuthRedirectRefresher
  redirect(homePath() + '?toast=signin_success&authEvent=true');
}

// both cases redirect with toast there
export async function signOut() {
  const supabase = await createClient();

  const { error } = await supabase.auth.signOut();
  if (error) {
    console.error('Error signing out:', error);
    redirect(`${homePath()}?toast=signout_error`);
  }

  revalidatePath(homePath(), 'layout');
  redirect(`${homePath()}?toast=signout_success&authEvent=true`);
}
