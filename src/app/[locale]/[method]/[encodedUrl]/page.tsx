import { homePath } from '@/paths';
import { redirect } from 'next/navigation';

import RestClientPage from '../../[method]/page';

type Params = {
  method: string;
  encodedUrl: string;
};

export default async function MethodUrlPage({ params }: { params: Promise<Params> }) {
  const { method, encodedUrl } = await params;

  if (!['GET', 'POST', 'PUT', 'DELETE'].includes(method.toUpperCase())) {
    redirect(homePath());
  }

  return <RestClientPage method={method} encodedUrl={encodedUrl} />;
}
