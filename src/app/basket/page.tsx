import type { Metadata } from 'next';

import { SiteHeader } from '@/components/layout/SiteHeader';
import { availableZones } from '@/content';
import { BasketClient } from './BasketClient';

export const dynamic = 'force-static';

export const metadata: Metadata = {
  title: 'Your Basket',
  description: 'Review your Avalanche Pizza order before checkout.',
  robots: { index: false, follow: true },
};

export default function BasketPage() {
  // Bechem is the only zone, so the fee is a constant the server can pass in.
  const fee = availableZones[0]?.feePesewas ?? 0;

  return (
    <>
      <SiteHeader />
      <main
        id="main"
        className="mx-auto w-full max-w-[1400px] flex-grow px-margin-mobile pt-32 pb-24 md:px-margin-desktop"
      >
        <h1 className="mb-12 border-b border-surface-container-high pb-4 font-headline-lg text-headline-lg-mobile uppercase tracking-[0.1em] text-on-surface md:mb-16 md:text-headline-lg">
          Your Basket
        </h1>
        <BasketClient deliveryFeePesewas={fee} />
      </main>
    </>
  );
}
