import { homePath } from '@/paths';
import { redirect } from 'next/navigation';

import RestClientPage from '../../../[method]/page';

type Params = {
  method: string;
  encodedUrl: string;
  encodedBody: string;
};

export default async function MethodUrlBodyPage({ params }: { params: Promise<Params> }) {
  const { method, encodedUrl, encodedBody } = await params;

  if (!['GET', 'POST', 'PUT', 'DELETE'].includes(method.toUpperCase())) {
    redirect(homePath());
  }

  return <RestClientPage method={method} encodedUrl={encodedUrl} encodedBody={encodedBody} />;
}
