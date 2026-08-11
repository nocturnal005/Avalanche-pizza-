import type { Metadata } from 'next';
import Image from 'next/image';

import { SiteHeader } from '@/components/layout/SiteHeader';
import { DealCardWide, DealCardTall, DealCardStandard } from '@/components/deals/DealCards';
import { OrderCta } from '@/components/order/OrderCta';
import { CallLink } from '@/components/order/CallLink';
import { IndicativePriceNote } from '@/components/order/IndicativePriceNote';
import { Icon } from '@/components/ui/Icon';
import { dealBySlot } from '@/content';
import { image } from '@/content/images';
import { formatPesewas, pesewasToDecimalString } from '@/lib/money';
import { buildDealMessage, buildGeneralMessage } from '@/lib/whatsapp';
import { absoluteUrl } from '@/lib/site';
import { availableDeals } from '@/content';

export const dynamic = 'force-static';

export const metadata: Metadata = {
  title: 'Special Deals',
  description:
    'Party Feast Ghc 89, The Gathering Ghc 65, The Ascent Ghc 33. Order on WhatsApp from Avalanche Pizza, Bechem.',
  alternates: { canonical: '/deals' },
  openGraph: {
    url: '/deals',
    title: 'Special Deals | Avalanche Pizza',
    description: 'Party Feast Ghc 89, The Gathering Ghc 65, The Ascent Ghc 33. Order on WhatsApp.',
  },
};

function DealsJsonLd() {
  const data = {
    '@context': 'https://schema.org',
    '@type': 'OfferCatalog',
    name: 'Avalanche Pizza Special Deals',
    url: absoluteUrl('/deals'),
    itemListElement: availableDeals.map((d) => ({
      '@type': 'Offer',
      name: d.name,
      description: d.description,
      price: pesewasToDecimalString(d.pricePesewas),
      priceCurrency: 'GHS',
    })),
  };
  return (
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }} />
  );
}

export default function DealsPage() {
  const hero = dealBySlot('hero');
  const summit = dealBySlot('mega');
  const basecamp = dealBySlot('family');
  const ascent = dealBySlot('triple');
  const gathering = dealBySlot('party');

  return (
    <>
      <SiteHeader active="deals" />
      <main id="main" className="min-h-screen bg-background pt-28 lg:pt-20">
        {/* Hero — The Party Feast */}
        <section className="relative flex min-h-[80vh] items-center justify-center overflow-hidden bg-surface-container-lowest px-margin-mobile py-20 md:px-margin-desktop">
          <div className="absolute inset-0">
            <Image
              src={image(hero.image)}
              alt={hero.imageAlt}
              fill
              priority
              quality={85}
              sizes="100vw"
              className="animate-fade-in scale-[1.06] object-cover object-center"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-background via-background/80 to-background/30 mix-blend-multiply" />
            <div className="absolute inset-0 bg-gradient-to-r from-background via-background/60 to-transparent" />
            <div className="pointer-events-none absolute top-1/4 right-1/4 h-[500px] w-[500px] rounded-full bg-primary/20 opacity-50 blur-[120px] mix-blend-screen" />
          </div>

          <div className="relative z-10 grid w-full max-w-container-max grid-cols-1 items-center gap-gutter lg:grid-cols-12">
            <div className="flex flex-col gap-6 lg:col-span-7 lg:gap-8">
              <div className="animate-fade-up delay-200 flex flex-wrap items-center gap-3">
                <span className="border border-primary bg-surface/50 px-3 py-1 font-label-caps text-label-caps uppercase tracking-[0.1em] text-primary backdrop-blur-sm">
                  {hero.kicker}
                </span>
                <span className="font-label-caps text-label-caps uppercase tracking-[0.3em] text-on-surface-variant">
                  Limited Time
                </span>
              </div>

              <h1 className="animate-fade-up delay-300 font-display-lg text-[40px] uppercase leading-[0.95] tracking-[0.08em] text-on-surface sm:text-[56px] md:text-[72px] lg:text-[88px]">
                The{' '}
                <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                  Party Feast
                </span>
              </h1>

              <p className="animate-fade-up delay-400 max-w-lg border-l-2 border-primary/30 pl-4 font-body-lg text-body-md leading-relaxed text-on-surface-variant md:text-body-lg">
                {hero.description}
              </p>

              <div className="animate-fade-up delay-500 flex items-end gap-4">
                <span className="font-headline-lg text-[44px] leading-none tabular text-on-surface md:text-[56px]">
                  {formatPesewas(hero.pricePesewas)}
                </span>
                {hero.wasPricePesewas ? (
                  <span className="mb-2 font-body-md text-body-md tabular text-on-surface-variant line-through">
                    {formatPesewas(hero.wasPricePesewas)}
                  </span>
                ) : null}
              </div>

              <div className="animate-fade-up delay-600 flex flex-wrap items-center gap-4">
                <OrderCta
                  message={buildDealMessage({
                    name: hero.name,
                    pricePesewas: hero.pricePesewas,
                    includes: hero.includes,
                    ref: `web/deals/${hero.slug}`,
                  })}
                  variant="primary"
                  ariaLabel={`Order ${hero.name} on WhatsApp`}
                  shimmer
                  className="!px-10 !py-5 !text-base !tracking-[0.15em] shadow-[0_0_40px_rgba(255,181,158,0.15)]"
                >
                  Claim Feast
                </OrderCta>
                <CallLink />
              </div>
            </div>
          </div>
        </section>

        {/* The collection */}
        <section className="relative z-20 bg-background px-margin-mobile py-24 md:px-margin-desktop md:py-32">
          <div className="mx-auto flex max-w-container-max flex-col gap-16 md:gap-24">
            <div className="reveal flex flex-col items-start justify-between gap-8 border-b border-surface-variant pb-8 md:flex-row md:items-end">
              <div className="flex flex-col gap-2">
                <span className="font-label-caps text-label-caps uppercase tracking-[0.3em] text-primary">
                  The Feast Edit
                </span>
                <h2 className="font-headline-lg text-[30px] uppercase tracking-[0.1em] text-on-surface sm:text-[36px] md:text-[40px]">
                  The Avalanche Collection
                </h2>
              </div>
              {/* The design's "Sort: Highest Value" is a decorative span with no
                  control behind it. Rendered as the static label it is. */}
              <div className="hidden items-center gap-4 md:flex">
                <span className="h-px w-16 bg-primary" />
                <span className="font-label-caps text-label-caps uppercase tracking-[0.1em] text-on-surface-variant">
                  Sort: Highest Value
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-gutter md:grid-cols-2 lg:grid-cols-12">
              <DealCardWide deal={summit} stagger={1} />
              <DealCardTall deal={basecamp} stagger={2} />
              <DealCardStandard deal={ascent} stagger={3} />
              <DealCardStandard deal={gathering} glow stagger={4} />
            </div>

            <IndicativePriceNote className="reveal max-w-2xl" />
          </div>
        </section>

        {/* Closing CTA */}
        <section className="relative overflow-hidden border-t border-outline-variant bg-surface-container-highest px-margin-mobile py-24 md:px-margin-desktop md:py-32">
          <div
            className="pointer-events-none absolute inset-0 opacity-5"
            style={{
              backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)',
              backgroundSize: '32px 32px',
            }}
          />
          <div className="relative z-10 mx-auto flex max-w-[800px] flex-col items-center gap-8 text-center">
            <Icon name="architecture" className="reveal reveal-d1 size-12 text-primary" />
            <h2 className="reveal reveal-d2 font-headline-lg text-[32px] uppercase leading-[1.1] tracking-[0.1em] text-on-surface sm:text-[40px] md:text-[56px]">
              Choose Your Feast
            </h2>
            <p className="reveal reveal-d3 max-w-lg font-body-lg text-body-md text-on-surface-variant md:text-body-lg">
              Choose your favourites, bring them together, and create an Avalanche feast made
              entirely around your appetite.
            </p>
            <div className="reveal reveal-d4 flex flex-wrap items-center justify-center gap-4">
              <OrderCta
                message={buildGeneralMessage('web/deals/closing')}
                variant="outline"
                className="!border-2 !px-10 !py-4 !text-base !tracking-[0.15em]"
              >
                Start Your Order
              </OrderCta>
              <CallLink />
            </div>
          </div>
        </section>
      </main>
      <DealsJsonLd />
    </>
  );
}
