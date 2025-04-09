import { errorPath, homePath } from '@/paths';
import { createClient } from '@/utils/supabase/server';
import { type EmailOtpType } from '@supabase/supabase-js';
import { redirect } from 'next/navigation';
import { type NextRequest } from 'next/server';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const token_hash = searchParams.get('token_hash');
  const type = searchParams.get('type') as EmailOtpType | null;
  console.log(`next=${searchParams.get('next')}`);
  const next = searchParams.get('next') ?? homePath();

  if (token_hash && type) {
    const supabase = await createClient();
    const { error } = await supabase.auth.verifyOtp({
      type,
      token_hash,
    });
    console.log(`confirm error=${error}`);
    if (!error) {
      console.log(`confirm redirecting to ${next}`);
      redirect(next);
    }
  }
  redirect(errorPath());
}
