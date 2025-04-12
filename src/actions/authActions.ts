'use server';

import { confirmEmailPath, errorPath, homePath, signInPath } from '@/paths';
import { createClient } from '@/utils/supabase/server';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

export async function signIn(formData: FormData) {
  const supabase = await createClient();

  const { error } = await supabase.auth.signInWithPassword({
    email: formData.get('email') as string,
    password: formData.get('password') as string,
  });

  if (error) {
    //TODO: show toast
    //showToast(error.message);
    redirect(errorPath());
  }
  // invalidates Next cache for home page path, forces page re-render, re-fetches data
  // 'layout' parameter invalidates both page and its layout cache, children
  // layouts and pages, refreshes all shared components (here - auth-dependent aka navigation menu)
  revalidatePath(homePath(), 'layout');
  redirect(homePath());
}

export async function signUp(formData: FormData) {
  const supabase = await createClient();

  const requestData = {
    email: formData.get('email') as string,
    password: formData.get('password') as string,
  };
  const { data: responseData, error } = await supabase.auth.signUp(requestData);
  console.log(`signUp error=${error}`);

  if (error) {
    //TODO: show toast
    //showToast(error.message);
    redirect(errorPath());
  }

  // Check if this is an existing user (no identities array)
  //When a user tries to sign up with an email that already exists, Supabase doesn't return an error - instead it returns a user object with empty identitie
  if (!responseData.user?.identities?.length) {
    //TODO: show toast
    //showToast('clear message that the email is already registered');
    // Redirect to sign-in page with email pre-filled
    redirect(signInPath(requestData.email));
  }

  // New user - redirect to confirm email page with email parameter
  redirect(confirmEmailPath(requestData.email));
}

export async function signOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  revalidatePath(homePath(), 'layout');
  redirect(homePath());
}
