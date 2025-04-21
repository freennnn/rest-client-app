import { Header } from '@/components/Header';
import HydrationErrorHandler from '@/components/HydrationErrorHandler';
import { Footer } from '@/features/footer/footer';
import { routing } from '@/i18n/routing';
import { AuthenticationProvider } from '@/providers/AuthenticationProvider';
import { Locale, NextIntlClientProvider, hasLocale } from 'next-intl';
import { setRequestLocale } from 'next-intl/server';
import { Geist, Geist_Mono } from 'next/font/google';
import { notFound } from 'next/navigation';
import { Toaster } from 'sonner';

import '../globals.css';

const geistSans = Geist({ subsets: ['latin'], variable: '--font-sans' });
const geistMono = Geist_Mono({ subsets: ['latin'], variable: '--font-mono' });

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: Locale }>;
}) {
  const { locale } = await params;

  if (!hasLocale(routing.locales, locale)) {
    notFound();
  }

  setRequestLocale(locale);

  return (
    <html lang={locale} suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
        suppressHydrationWarning
      >
        <HydrationErrorHandler />
        <NextIntlClientProvider>
          <AuthenticationProvider>
            <div className='relative flex flex-col min-h-screen'>
              <Header />
              <main className='flex-1'>{children}</main>
              <Footer />
            </div>
            <Toaster richColors position='bottom-right' />
          </AuthenticationProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
