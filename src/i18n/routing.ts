import { defineRouting } from 'next-intl/routing';

export const locales = ['en', 'ru'] as const;

export const routing = defineRouting({
  locales: locales,
  defaultLocale: 'en',
  // localePrefix: 'as-needed',
});
