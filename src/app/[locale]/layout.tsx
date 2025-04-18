import { Header } from '@/components/Header';
import { ToastHandler } from '@/components/ToastHandler';
import { Footer } from '@/features/footer/footer';
import { cn } from '@/lib/utils';
import { AuthenticationProvider } from '@/providers/AuthenticationProvider';
import { NextIntlClientProvider } from 'next-intl';
import { Locale } from 'next-intl';
import { Geist, Geist_Mono } from 'next/font/google';
import { Toaster } from 'sonner';

import '../globals.css';

const geistSans = Geist({ subsets: ['latin'], variable: '--font-sans' });
const geistMono = Geist_Mono({ subsets: ['latin'], variable: '--font-mono' });

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: Locale }>;
}) {
  const { locale } = await params;
  return (
    <html lang={locale} suppressHydrationWarning>
      <body className={cn(geistSans.variable, geistMono.variable, 'min-h-screen bg-background')}>
        <NextIntlClientProvider>
          <AuthenticationProvider>
            <div className='relative flex min-h-screen flex-col'>
              <Header />
              <main className='flex-1'>{children}</main>
              <Footer />
            </div>
            <Toaster richColors position='top-right' />
            <ToastHandler />
          </AuthenticationProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
