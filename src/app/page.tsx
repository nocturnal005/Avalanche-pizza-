import Image from 'next/image';
import Link from 'next/link';

import { SiteHeader } from '@/components/layout/SiteHeader';
import { OrderCta } from '@/components/order/OrderCta';
import { CallLink } from '@/components/order/CallLink';
import { IndicativePriceNote } from '@/components/order/IndicativePriceNote';
import { Icon } from '@/components/ui/Icon';
import { home } from '@/content/home';
import { image } from '@/content/images';
import { priceOf, productBySlug, sizeLabelOf } from '@/content';
import { formatPesewas } from '@/lib/money';
import { buildGeneralMessage, buildItemMessage } from '@/lib/whatsapp';

export const dynamic = 'force-static';

export default function HomePage() {
  const { hero, collection, featured, process } = home;

  return (
    <>
      <SiteHeader active="home" />
      <main id="main" className="min-h-screen bg-background pt-28 lg:pt-20">
        {/* ── Hero ─────────────────────────────────────────────────────── */}
        <section className="relative flex min-h-[560px] w-full items-center justify-center overflow-hidden bg-background lg:h-[80vh] lg:min-h-[600px]">
          <div className="absolute inset-0 z-0">
            <Image
              src={image(hero.image)}
              alt={hero.imageAlt}
              fill
              priority
              quality={85}
              sizes="100vw"
              className="animate-fade-in scale-105 object-cover object-center"
            />
            <div className="absolute inset-0 z-10 bg-gradient-to-t from-background via-background/60 to-surface/40 mix-blend-multiply" />
            <div className="absolute inset-0 z-10 bg-gradient-to-r from-background via-transparent to-transparent opacity-80" />
          </div>

          <div className="relative z-20 flex w-full max-w-container-max flex-col items-start justify-center gap-6 px-margin-mobile py-16 md:gap-8 md:px-margin-desktop">
            <span className="animate-fade-up delay-100 border-l-2 border-primary pl-4 font-label-caps text-label-caps uppercase tracking-[0.1em] text-primary">
              {hero.eyebrow}
            </span>

            <h1 className="animate-fade-up delay-200 max-w-3xl font-display-lg text-[38px] uppercase leading-none tracking-[0.1em] text-on-surface sm:text-[52px] md:text-[68px] lg:text-[80px]">
              {hero.headline}
            </h1>

            <p className="animate-fade-up delay-300 max-w-md border-l border-outline-variant pl-6 font-body-lg text-body-md text-on-surface-variant md:text-body-lg">
              {hero.body}
            </p>

            <div className="animate-fade-up delay-400 mt-2 flex flex-wrap items-center gap-4 md:gap-6">
              <OrderCta
                message={buildGeneralMessage('web/home/hero')}
                variant="primary"
                className="!px-8 !tracking-[0.2em] md:!px-10"
              >
                Order Now
              </OrderCta>
              <Link
                href="/menu"
                className="inline-flex items-center gap-2 border border-primary px-8 py-4 font-label-caps text-label-caps uppercase tracking-[0.2em] text-primary transition-colors duration-300 hover:bg-primary/10 md:px-10"
              >
                View Menu
                <Icon name="arrow_forward" className="size-4" />
              </Link>
            </div>

            <div className="mt-2 md:hidden">
              <CallLink variant="bare" />
            </div>
          </div>

          {/* "Est. 2024" flourish */}
          <div className="animate-fade-in delay-700 absolute bottom-8 right-margin-desktop z-20 hidden flex-col items-end gap-2 md:flex">
            <span className="mb-4 font-label-caps text-label-caps tracking-[0.1em] text-on-surface-variant opacity-50 [writing-mode:vertical-rl] rotate-180">
              {hero.flourish}
            </span>
            <span className="h-16 w-px bg-gradient-to-t from-primary to-transparent" />
          </div>
        </section>

        {/* ── The Premium Collection ───────────────────────────────────── */}
        <section className="relative overflow-hidden bg-surface-container py-20 md:py-24">
          <div className="pointer-events-none absolute top-0 right-0 h-[800px] w-[800px] -translate-y-1/2 translate-x-1/3 rounded-full bg-primary/5 blur-[120px]" />

          <div className="relative z-10 mx-auto w-full max-w-container-max px-margin-mobile md:px-margin-desktop">
            <div className="reveal mb-12 flex flex-col justify-between gap-8 border-b border-outline-variant pb-8 md:mb-16 md:flex-row md:items-end">
              <div className="flex max-w-xl flex-col gap-4">
                <h2 className="font-headline-lg text-headline-lg-mobile uppercase tracking-[0.1em] text-on-surface md:text-headline-lg">
                  {collection.eyebrowTitle}{' '}
                  <span className="italic text-primary">{collection.accentWord}</span>{' '}
                  {collection.titleTail}
                </h2>
                <p className="font-body-md text-body-md text-on-surface-variant">
                  {collection.body}
                </p>
              </div>
              <Link
                href="/menu"
                className="group flex shrink-0 items-center gap-2 font-label-caps text-label-caps uppercase tracking-[0.2em] text-primary transition-colors hover:text-primary-container"
              >
                {collection.linkLabel}
                <Icon
                  name="arrow_forward"
                  className="size-4 transition-transform group-hover:translate-x-1"
                />
              </Link>
            </div>

            <div className="grid grid-cols-1 gap-gutter md:grid-cols-2">
              {featured.map((card, index) => {
                const product = productBySlug(card.slug);
                const price = formatPesewas(priceOf(product));
                return (
                  <article
                    key={card.slug}
                    className={`reveal reveal-d${index + 1} group relative flex h-full flex-col overflow-hidden border border-surface-container-high bg-surface transition-colors duration-500 hover:border-outline-variant ${
                      index === 1 ? 'md:translate-y-12' : ''
                    }`}
                  >
                    <div className="relative h-64 w-full overflow-hidden bg-background sm:h-80 md:h-[400px]">
                      <Image
                        src={image(card.image)}
                        alt={card.imageAlt}
                        fill
                        // 85, not the 75 cards normally take. These are the
                        // largest photographs on the homepage, and since
                        // 2026-08-11 they sit on 1024px masters rather than
                        // 1408px ones — less pixel headroom to spend on
                        // compression, so spend less of it.
                        quality={85}
                        sizes="(max-width: 767px) 100vw, 560px"
                        className="object-cover transition-transform duration-[1500ms] ease-out group-hover:scale-110"
                      />
                      <div className="absolute inset-0 z-10 bg-gradient-to-t from-surface via-transparent to-transparent" />
                      <span
                        className={`absolute top-4 left-4 z-20 border border-outline-variant bg-surface-container-highest px-3 py-1 font-label-caps text-[10px] uppercase tracking-[0.1em] ${
                          card.badge.tone === 'secondary' ? 'text-secondary' : 'text-error'
                        }`}
                      >
                        {card.badge.label}
                      </span>
                    </div>

                    <div className="z-10 flex flex-grow flex-col justify-between gap-6 bg-surface p-6 md:p-8">
                      <div>
                        <div className="mb-4 flex items-start justify-between gap-4">
                          <h3 className="font-headline-lg text-headline-lg-mobile uppercase tracking-[0.05em] text-on-surface">
                            {product.name}
                          </h3>
                          <span className="shrink-0 font-label-caps text-label-caps tracking-[0.1em] tabular text-primary">
                            {price}
                          </span>
                        </div>
                        <p className="font-body-md text-body-md text-on-surface-variant">
                          {card.description}
                        </p>
                      </div>

                      <div className="flex flex-col gap-5">
                        <div className="flex flex-wrap gap-2">
                          {card.tags.map((tag) => (
                            <span
                              key={tag}
                              className="border border-surface-container-high bg-surface-container px-3 py-1 font-label-caps text-[10px] uppercase tracking-[0.1em] text-on-surface-variant"
                            >
                              {tag}
                            </span>
                          ))}
                        </div>
                        <OrderCta
                          message={buildItemMessage({
                            name: product.name,
                            pricePesewas: priceOf(product),
                            sizeLabel: sizeLabelOf(product),
                            ref: `web/home/${product.slug}`,
                          })}
                          variant="ghost"
                          showIcon={false}
                          ariaLabel={`Order ${product.name} on WhatsApp`}
                        >
                          Order on WhatsApp
                        </OrderCta>
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>

            <IndicativePriceNote className="reveal mt-16 max-w-2xl md:mt-24" />
          </div>
        </section>

        {/* ── Fired at 500 degrees ─────────────────────────────────────── */}
        <section className="relative border-t border-surface-container-high bg-background py-20 md:py-32">
          <div className="mx-auto max-w-container-max px-margin-mobile md:px-margin-desktop">
            <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-12">
              <div className="reveal flex flex-col gap-8 lg:col-span-5">
                <div className="flex flex-col gap-2">
                  <span className="font-label-caps text-label-caps uppercase tracking-[0.1em] text-outline-variant">
                    {process.eyebrow}
                  </span>
                  <h2 className="font-headline-lg text-headline-lg-mobile uppercase leading-tight tracking-[0.1em] text-on-surface md:text-headline-lg">
                    {process.titleLead}
                    <br />
                    <span className="italic text-primary">{process.titleAccent}</span>
                  </h2>
                </div>

                <p className="font-body-lg text-body-md text-on-surface-variant md:text-body-lg">
                  {process.body}
                </p>

                <div className="mt-2 flex flex-wrap items-center gap-6 md:gap-8">
                  {process.stats.map((stat, i) => (
                    <div key={stat.caption} className="flex items-center gap-6 md:gap-8">
                      {i > 0 ? <span className="hidden h-12 w-px bg-surface-container-high sm:block" /> : null}
                      <div className="flex flex-col gap-1">
                        <span className="font-display-lg text-4xl tabular text-on-surface">
                          {stat.value}
                          <span className="text-2xl text-primary">{stat.unit}</span>
                        </span>
                        <span className="font-label-caps text-[10px] uppercase tracking-[0.1em] text-outline">
                          {stat.caption}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="reveal reveal-d2 relative lg:col-span-6 lg:col-start-7">
                <div className="pointer-events-none absolute -inset-4 rounded-full bg-primary/5 blur-3xl" />
                <div className="relative z-10 grid grid-cols-2 gap-4">
                  <div className="flex flex-col gap-4 md:translate-y-8">
                    <div className="group h-48 overflow-hidden border border-surface-container-high bg-surface-container md:h-64">
                      <div className="relative h-full w-full">
                        <Image
                          src={image(process.tiles.dough.image)}
                          alt={process.tiles.dough.alt}
                          fill
                          sizes="(max-width: 1023px) 50vw, 256px"
                          className="object-cover opacity-80 grayscale transition-all duration-[2000ms] group-hover:scale-110 group-hover:opacity-100 group-hover:grayscale-0"
                        />
                      </div>
                    </div>
                    <div className="group h-40 overflow-hidden border border-surface-container-high bg-surface-container md:h-48">
                      <div className="relative h-full w-full">
                        <Image
                          src={image(process.tiles.flame.image)}
                          alt={process.tiles.flame.alt}
                          fill
                          sizes="(max-width: 1023px) 50vw, 256px"
                          className="object-cover opacity-80 transition-transform duration-[2000ms] group-hover:scale-110"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col gap-4 md:-translate-y-8">
                    <div className="group h-48 overflow-hidden border border-surface-container-high bg-surface-container md:h-64">
                      <div className="relative h-full w-full">
                        <Image
                          src={image(process.tiles.ingredients.image)}
                          alt={process.tiles.ingredients.alt}
                          fill
                          sizes="(max-width: 1023px) 50vw, 256px"
                          className="object-cover opacity-80 transition-all duration-[2000ms] group-hover:scale-110 group-hover:opacity-100"
                        />
                      </div>
                    </div>
                    <div className="flex h-40 flex-col justify-center border border-surface-container-high bg-surface-container-lowest p-5 md:h-48 md:p-6">
                      <Icon name="restaurant" className="mb-4 size-8 text-primary" />
                      <h3 className="mb-2 font-headline-lg text-lg uppercase tracking-[0.05em] text-on-surface md:text-xl">
                        {process.feature.title}
                      </h3>
                      <p className="font-body-md text-sm text-on-surface-variant">
                        {process.feature.body}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
    </>
  );
}
