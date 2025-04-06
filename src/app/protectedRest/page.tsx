import { createClient } from '@/utils/supabase/server';
import { redirect } from 'next/navigation';

export default async function ProtectedPage() {
  const supabase = await createClient();
  // second network request to Supabase ( first one was in middleware) before
  // the page rendered. Because middleware didn't pass the user info to the pageб
  // but at least tokens should have been updated in middleware already.
  const { data, error } = await supabase.auth.getUser();
  if (error || !data?.user) {
    redirect('/login');
  }
  return <p>Hello {data.user.email}</p>;
}
