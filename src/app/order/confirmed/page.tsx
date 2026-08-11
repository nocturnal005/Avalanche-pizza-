import type { Metadata } from 'next';
import Link from 'next/link';
import { Suspense } from 'react';

import { SiteHeader } from '@/components/layout/SiteHeader';
import { CallLink } from '@/components/order/CallLink';
import { Icon } from '@/components/ui/Icon';
import { OrderReference } from './OrderReference';

export const dynamic = 'force-static';

export const metadata: Metadata = {
  title: 'Order Confirmed',
  robots: { index: false, follow: false },
};

/**
 * Placeholder confirmation, standing in until the Order Tracking design is
 * built in O2. It exists so the flow has a real destination during review
 * rather than dead-ending after payment.
 *
 * Nothing here is a real order yet — see the banner.
 */
export default function OrderConfirmedPage() {
  return (
    <>
      <SiteHeader />
      <main
        id="main"
        className="mx-auto flex w-full max-w-3xl flex-col items-start gap-6 px-margin-mobile pt-32 pb-24 md:px-margin-desktop"
      >
        <span className="flex size-12 items-center justify-center rounded-full bg-primary/10 text-primary">
          <Icon name="check" className="size-6" />
        </span>

        <h1 className="font-headline-lg text-headline-lg-mobile uppercase tracking-[0.1em] text-on-surface md:text-headline-lg">
          Order received
        </h1>

        <Suspense fallback={null}>
          <OrderReference />
        </Suspense>

        <p className="max-w-xl font-body-md text-body-md text-on-surface-variant">
          We will confirm your order and delivery time shortly. Keep your phone nearby.
        </p>

        <div className="mt-2 w-full border-l-2 border-secondary bg-surface-container p-5">
          <p className="font-label-caps text-label-caps uppercase tracking-[0.1em] text-secondary">
            Demonstration mode
          </p>
          <p className="mt-2 font-body-md text-body-md text-on-surface-variant">
            No payment was taken and no order reached the kitchen. Live mobile money payment
            switches on once the Paystack account is verified.
          </p>
        </div>

        <div className="mt-4 flex flex-wrap items-center gap-4">
          <Link
            href="/menu"
            className="shine border border-primary px-8 py-4 font-label-caps text-label-caps uppercase tracking-[0.2em] text-primary transition-colors hover:bg-primary hover:text-on-primary"
          >
            Order Again
          </Link>
          <CallLink />
        </div>
      </main>
    </>
  );
}
