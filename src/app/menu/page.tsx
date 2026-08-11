import type { Metadata } from 'next';

import { SiteHeader } from '@/components/layout/SiteHeader';
import { ProductCard } from '@/components/menu/ProductCard';
import { IndicativePriceNote } from '@/components/order/IndicativePriceNote';
import { OrderCta } from '@/components/order/OrderCta';
import { CallLink } from '@/components/order/CallLink';
import { availableProducts, priceOf } from '@/content';
import { pesewasToDecimalString } from '@/lib/money';
import { buildGeneralMessage } from '@/lib/whatsapp';
import { absoluteUrl } from '@/lib/site';

export const dynamic = 'force-static';

export const metadata: Metadata = {
  title: 'Core Menu',
  description:
    'Wood-fired pizza in Bechem, from Ghc 15. Order on WhatsApp — Margherita, Pepperoni, The Avalanche and more.',
  alternates: { canonical: '/menu' },
  openGraph: {
    url: '/menu',
    title: 'Core Menu | Avalanche Pizza',
    description: 'Wood-fired pizza in Bechem, from Ghc 15. Order on WhatsApp.',
  },
};

function MenuJsonLd() {
  const data = {
    '@context': 'https://schema.org',
    '@type': 'Menu',
    name: 'Avalanche Pizza Core Menu',
    url: absoluteUrl('/menu'),
    hasMenuSection: {
      '@type': 'MenuSection',
      name: 'Pizzas',
      hasMenuItem: availableProducts.map((p) => ({
        '@type': 'MenuItem',
        name: p.name,
        description: p.description,
        offers: {
          '@type': 'Offer',
          price: pesewasToDecimalString(priceOf(p)),
          priceCurrency: 'GHS',
        },
      })),
    },
  };
  return (
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }} />
  );
}

export default function MenuPage() {
  return (
    <>
      <SiteHeader active="menu" />
      <main id="main" className="min-h-screen bg-background pt-28 lg:pt-20">
        {/* Page intro */}
        <section className="relative overflow-hidden px-margin-mobile py-16 md:px-margin-desktop md:py-24">
          <div className="absolute inset-0 z-0 bg-surface-container-low opacity-50" />
          <div className="pointer-events-none absolute -top-40 -right-40 h-96 w-96 rounded-full bg-primary opacity-5 blur-[120px]" />
          <div className="relative z-10 mx-auto flex max-w-container-max flex-col items-center text-center">
            <span className="animate-fade-up delay-100 mb-4 block font-label-caps text-label-caps uppercase tracking-[0.1em] text-primary">
              The Elite Selection
            </span>
            <h1 className="animate-fade-up delay-200 mb-6 font-display-lg text-[34px] uppercase tracking-[0.1em] text-on-surface sm:text-[40px] md:text-display-lg">
              Core Menu
            </h1>
            <p className="animate-fade-up delay-300 mx-auto max-w-2xl font-body-lg text-body-md text-on-surface-variant md:text-body-lg">
              We take the time to prepare our dough properly, select ingredients carefully and build
              every pizza with the consistency our customers should expect.
            </p>
          </div>
        </section>

        {/* The bento grid */}
        <section className="px-margin-mobile py-16 md:px-margin-desktop">
          <div className="mx-auto max-w-container-max">
            <div className="grid grid-flow-row-dense grid-cols-1 gap-gutter md:grid-cols-2 lg:grid-cols-4">
              {availableProducts.map((product, i) => (
                <ProductCard key={product.slug} product={product} index={i} />
              ))}
            </div>

            <div className="mt-12 flex flex-col items-start gap-8 border-t border-outline-variant/30 pt-10 md:flex-row md:items-center md:justify-between">
              <IndicativePriceNote className="max-w-xl" />
              <div className="flex flex-wrap gap-4">
                <OrderCta message={buildGeneralMessage('web/menu/footer')} variant="primary">
                  Order on WhatsApp
                </OrderCta>
                <CallLink />
              </div>
            </div>
          </div>
        </section>
      </main>
      <MenuJsonLd />
    </>
  );
}
