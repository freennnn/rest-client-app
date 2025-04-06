'use server';

import { createClient } from '@/utils/supabase/server';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

export async function logIn(formData: FormData) {
  const supabase = await createClient();

  const {
    data: { session },
    error,
  } = await supabase.auth.signInWithPassword({
    email: formData.get('email') as string,
    password: formData.get('password') as string,
  });

  if (error) {
    redirect('/error');
  }
  // ivalidates Next cache for home page path, forces page re-render, re-fetches data
  // 'layout' parameter invalidates both page and its layout cache, children
  // layouts and pages, refreshes all shared components (here - auth-dependent aka navigation menu)
  revalidatePath('/', 'layout');
  redirect('/');
}

export async function signUp(formData: FormData) {
  const supabase = await createClient();

  const data = {
    email: formData.get('email') as string,
    password: formData.get('password') as string,
  };
  console.log(data);
  const { error } = await supabase.auth.signUp(data);
  console.log(`signUp error=${error}`);
  if (error) {
    redirect('/error');
  }

  //revalidatePath('/', 'layout');
  redirect('/protectedRest');
}

export async function signOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect('/');
}
