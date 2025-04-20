import { redirect } from '@/i18n/navigation';
import { errorPath, homePath } from '@/paths';
import { createClient } from '@/utils/supabase/server';
import { type EmailOtpType } from '@supabase/supabase-js';
import { getLocale } from 'next-intl/server';
import { getTranslations } from 'next-intl/server';
import { type NextRequest } from 'next/server';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const token_hash = searchParams.get('token_hash');
  const type = searchParams.get('type') as EmailOtpType | null;
  const next = searchParams.get('next') ?? homePath();
  const locale = await getLocale();
  const t = await getTranslations('auth.errors');
  if (token_hash && type) {
    const supabase = await createClient();
    const { error } = await supabase.auth.verifyOtp({
      type,
      token_hash,
    });
    if (error) {
      redirect({
        href: `${errorPath()}?error=${error.message}`,
        locale,
      });
    }
    redirect({
      href: next,
      locale,
    });
  }
  redirect({
    href: {
      pathname: errorPath(),
      query: {
        error: t('noToken'),
      },
    },
    locale,
  });
}
