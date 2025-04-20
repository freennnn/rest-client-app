import { nonFoundPath } from '@/paths';
import { Header } from '@/types/types';
import { decodeSegment } from '@/utils/rest-client/urlEncoder';
import { setRequestLocale } from 'next-intl/server';
import { redirect } from 'next/navigation';

import RestClientFormClient from './RestClientFormClient';

type ResolvedParams = {
  locale: string;
  method: string;
  path?: string[];
};

type ResolvedSearchParams = {
  [key: string]: string | string[] | undefined;
};

function checkMethodValidity(method?: string): boolean {
  if (typeof method !== 'string') {
    return false;
  }

  return ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS', 'HEAD'].includes(
    method.toUpperCase()
  );
}

export default async function RestClientPage({
  params: paramsPromise,
  searchParams: searchParamsPromise,
}: {
  params: Promise<ResolvedParams>;
  searchParams: Promise<ResolvedSearchParams>;
}) {
  const params = await paramsPromise;
  const searchParams = await searchParamsPromise;

  const initialMethod = params.method.toUpperCase();
  const path = params.path;
  const locale = params.locale;
  setRequestLocale(locale);

  if (!checkMethodValidity(initialMethod)) {
    redirect(nonFoundPath());
  }

  let initialEncodedUrl: string | undefined = undefined;
  let initialEncodedBody: string | undefined = undefined;

  if (path) {
    if (path.length >= 1) {
      initialEncodedUrl = path[0];
    }
    if (path.length >= 2 && ['POST', 'PUT', 'PATCH'].includes(initialMethod)) {
      initialEncodedBody = path[1];
    }
  }

  let initialDecodedUrl = '';
  if (initialEncodedUrl) {
    try {
      initialDecodedUrl = decodeSegment(initialEncodedUrl);
    } catch (err) {
      throw err;
    }
  }

  let initialDecodedBody = '';
  if (initialEncodedBody) {
    try {
      initialDecodedBody = decodeSegment(initialEncodedBody);
    } catch (err) {
      throw err;
    }
  }

  const initialHeaders: Header[] = [];
  for (const [key, value] of Object.entries(searchParams)) {
    if (typeof value === 'string') {
      initialHeaders.push({
        id: `header-initial-${key}`,
        key: key,
        value: value,
      });
    }
  }

  return (
    <RestClientFormClient
      locale={locale}
      initialMethod={initialMethod}
      initialUrl={initialDecodedUrl}
      initialBody={initialDecodedBody}
      initialHeaders={initialHeaders}
    />
  );
}
