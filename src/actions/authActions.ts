'use server';

import { confirmEmailPath, errorPath, homePath, signInPath } from '@/paths';
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

    const { data: responseData, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          name,
        },
      },
    });

    if (error) {
      return {
        errors: {
          _form: [error.message],
        },
      };
    }

    // Check if this is an existing user (no identities array)
    // When a user tries to sign up with an email that already exists, Supabase doesn't return an error
    // Instead it returns a user object with empty identities array
    if (!responseData.user?.identities?.length) {
      // Redirect to sign-in page with email pre-filled
      redirect(signInPath(email));
    }

    // If email confirmation is required
    if (!responseData.user?.email_confirmed_at) {
      redirect(confirmEmailPath(responseData.user?.email ?? email));
    }

    return { success: true };
  } catch (error) {
    return {
      errors: {
        _form: [`An unexpected error ${error} occurred. Please try again later.`],
      },
    };
  }
}

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
      return {
        errors: {
          _form: [error.message],
        },
      };
    }

    return { success: true };
  } catch (error) {
    console.error('Sign in error:', error);
    return {
      errors: {
        _form: [`An unexpected error ${error} occurred. Please try again later.`],
      },
    };
  }
}

export async function signOut() {
  try {
    const supabase = await createClient();
    await supabase.auth.signOut();
    revalidatePath(homePath(), 'layout');
  } catch (error) {
    console.error('Sign out error:', error);
    redirect(errorPath());
  }
  // redirect is done via error in Next.js server actions, so should be outside catch block
  redirect(homePath());
}
