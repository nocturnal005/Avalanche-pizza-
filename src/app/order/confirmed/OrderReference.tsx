'use client';

import { useSearchParams } from 'next/navigation';

/** The order reference, read from the URL the checkout redirected to. */
export function OrderReference() {
  const ref = useSearchParams().get('ref');
  if (!ref) return null;

  return (
    <p className="font-label-caps text-label-caps uppercase tracking-[0.2em] text-primary">
      Reference {ref}
    </p>
  );
}
