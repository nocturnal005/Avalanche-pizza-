import Link from 'next/link';

import { SiteHeader } from '@/components/layout/SiteHeader';
import { OrderCta } from '@/components/order/OrderCta';
import { CallLink } from '@/components/order/CallLink';
import { buildGeneralMessage } from '@/lib/whatsapp';

/**
 * Composed only from existing components and tokens — no new design.
 */
export default function NotFound() {
  return (
    <>
      <SiteHeader />
      <main
        id="main"
        className="flex min-h-[70vh] items-center bg-background px-margin-mobile pt-28 pb-20 md:px-margin-desktop lg:pt-20"
      >
        <div className="mx-auto flex w-full max-w-container-max flex-col items-start gap-6">
          <span className="font-label-caps text-label-caps uppercase tracking-[0.2em] text-primary">
            Page not found
          </span>
          <h1 className="max-w-2xl font-display-lg text-[32px] uppercase leading-tight tracking-[0.1em] text-on-surface md:text-display-lg">
            That page is off the menu
          </h1>
          <p className="max-w-md font-body-lg text-body-md text-on-surface-variant md:text-body-lg">
            The link may be old or mistyped. Browse the menu, or message us and we will sort you out.
          </p>
          <div className="mt-2 flex flex-wrap items-center gap-4">
            <Link
              href="/menu"
              className="inline-flex items-center border border-primary px-8 py-4 font-label-caps text-label-caps uppercase tracking-[0.2em] text-primary transition-colors hover:bg-primary/10"
            >
              View Menu
            </Link>
            <OrderCta message={buildGeneralMessage('web/404')} variant="primary">
              Order on WhatsApp
            </OrderCta>
            <CallLink variant="bare" />
          </div>
        </div>
      </main>
    </>
  );
}
