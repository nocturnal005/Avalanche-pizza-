import type { Metadata } from 'next';

import { SiteHeader } from '@/components/layout/SiteHeader';
import { availableZones } from '@/content';
import { CheckoutClient } from './CheckoutClient';

export const dynamic = 'force-static';

export const metadata: Metadata = {
  title: 'Checkout',
  description: 'Complete your Avalanche Pizza order with mobile money.',
  robots: { index: false, follow: false },
};

export default function CheckoutPage() {
  return (
    <>
      <SiteHeader />
      <main
        id="main"
        className="mx-auto w-full max-w-[1400px] px-margin-mobile pt-32 pb-24 md:px-margin-desktop"
      >
        <h1 className="mb-12 border-b border-surface-variant pb-4 font-headline-lg text-headline-lg-mobile uppercase tracking-[0.1em] text-on-surface md:mb-16 md:text-headline-lg">
          Checkout
        </h1>
        <CheckoutClient zones={availableZones} />
      </main>
    </>
  );
}
