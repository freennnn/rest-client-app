import { Loader2 } from 'lucide-react';

// This component will be shown instantly for the [locale] segment
// while its children (layout.tsx, page.tsx, nested pages) are loading.
export default function Loading() {
  return (
    <div className='flex flex-1 items-center justify-center'>
      <Loader2 className='h-8 w-8 animate-spin text-muted-foreground' />
    </div>
  );
}
