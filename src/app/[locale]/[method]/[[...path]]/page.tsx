import { nonFoundPath } from '@/paths';
import { Header } from '@/types/types';
import { decodeSegment } from '@/utils/rest-client/urlEncoder';
import { setRequestLocale } from 'next-intl/server';
import { redirect } from 'next/navigation';

import RestClientFormClient from './RestClientFormClient';

// Define the expected resolved structure
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
  // Keep the expanded list of methods
  return ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS', 'HEAD'].includes(
    method.toUpperCase()
  );
}

// Page component is now async Server Component
export default async function RestClientPage({
  params: paramsPromise,
  searchParams: searchParamsPromise,
}: {
  // Type props as Promises
  params: Promise<ResolvedParams>;
  searchParams: Promise<ResolvedSearchParams>;
}) {
  // Await the promises to get the resolved objects
  const params = await paramsPromise;
  const searchParams = await searchParamsPromise;

  // Now access properties from the resolved objects
  const initialMethod = params.method.toUpperCase();
  const path = params.path;
  const locale = params.locale; // Can access locale now
  setRequestLocale(locale);

  // Validate Method
  if (!checkMethodValidity(initialMethod)) {
    redirect(nonFoundPath());
  }

  // Parse Path
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

  // Decode Initial Values
  let initialDecodedUrl = '';
  if (initialEncodedUrl) {
    try {
      initialDecodedUrl = decodeSegment(initialEncodedUrl);
    } catch (err) {
      console.error('Failed to decode URL segment on server:', err);
    }
  }

  let initialDecodedBody = '';
  if (initialEncodedBody) {
    try {
      initialDecodedBody = decodeSegment(initialEncodedBody);
    } catch (err) {
      console.error('Failed to decode body segment on server:', err);
    }
  }

  // Parse Headers using the resolved searchParams
  const initialHeaders: Header[] = [];
  for (const [key, value] of Object.entries(searchParams)) {
    // Ensure value is a string (though Next.js usually provides string | string[])
    if (typeof value === 'string') {
      initialHeaders.push({
        id: `header-initial-${key}`, // Keep generating an ID for React keys
        key: key, // Use the key directly
        value: value, // Use the value directly
      });
    }
  }

  // Render Client Component
  return (
    <RestClientFormClient
      locale={locale}
      initialMethod={initialMethod}
      initialUrl={initialDecodedUrl}
      initialBody={initialDecodedBody}
      initialHeaders={initialHeaders}
      // Pass the raw encoded values too, in case client needs them for history update?
      // initialEncodedUrl={initialEncodedUrl}
      // initialEncodedBody={initialEncodedBody}
    />
  );
}
