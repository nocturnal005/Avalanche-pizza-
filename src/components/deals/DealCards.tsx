import Image from 'next/image';

import { Icon, type IconName } from '@/components/ui/Icon';
import { AddToBasket } from '@/components/basket/AddToBasket';
import { image } from '@/content/images';
import type { Deal } from '@/content';
import { formatPesewas } from '@/lib/money';

/**
 * The four deal cards. The design gives each a distinct shape rather than one
 * flexible card, so they are separate components — trying to unify them would
 * mean parameterising away the thing that makes the grid interesting.
 *
 *   wide     Summit    — 8 cols, image beside copy, filled gold kicker
 *   tall     Basecamp  — 4 cols × 2 rows, meta pairs, right-aligned price
 *   standard Ascent    — 4 cols, circled icon
 *   standard Gathering — 4 cols, bare icon, corner glow
 */

function basketLine(deal: Deal) {
  return {
    id: `deal:${deal.slug}`,
    kind: 'deal' as const,
    slug: deal.slug,
    name: deal.name,
    unitPesewas: deal.pricePesewas,
    tags: [...deal.includes],
  };
}

export function DealCardWide({ deal, stagger = 1 }: { deal: Deal; stagger?: number }) {
  return (
    <article
      className={`reveal reveal-d${stagger} hover-lift group relative flex flex-col overflow-hidden bg-surface-container hover:shadow-2xl md:flex-row lg:col-span-8`}
    >
      <div className="pointer-events-none absolute inset-0 z-20 border border-surface-container-high transition-colors group-hover:border-primary/30" />

      <div className="relative h-56 overflow-hidden bg-surface-dim sm:h-64 md:h-auto md:w-1/2">
        <Image
          src={image(deal.image)}
          alt={deal.imageAlt}
          fill
          sizes="(max-width: 767px) 100vw, 420px"
          className="object-cover transition-transform duration-700 group-hover:scale-110"
        />
        <div className="absolute inset-0 z-10 bg-gradient-to-t from-surface-container via-transparent to-transparent opacity-80 md:bg-gradient-to-l" />
      </div>

      <div className="relative z-10 flex flex-col justify-between bg-surface-container p-8 md:w-1/2 md:p-12">
        <div className="flex flex-col gap-4">
          <div className="flex items-start justify-between gap-4">
            <span className="bg-secondary-container px-2 py-1 font-label-caps text-label-caps uppercase tracking-[0.1em] text-on-secondary-container">
              {deal.kicker}
            </span>
            {deal.icon ? (
              <Icon
                name={deal.icon as IconName}
                className="size-6 shrink-0 text-primary transition-transform group-hover:rotate-12"
              />
            ) : null}
          </div>
          <h3 className="font-headline-lg text-headline-lg-mobile uppercase tracking-[0.05em] text-on-surface md:text-headline-lg">
            {deal.name}
          </h3>
          <p className="font-body-md text-body-md text-on-surface-variant">{deal.description}</p>
        </div>

        <div className="mt-8 flex flex-wrap items-center justify-between gap-4">
          <span className="font-headline-lg text-[32px] tabular text-on-surface">
            {formatPesewas(deal.pricePesewas)}
          </span>
          <AddToBasket line={basketLine(deal)} variant="outline" className="!tracking-[0.2em]">
            Add to Basket
          </AddToBasket>
        </div>
      </div>
    </article>
  );
}

export function DealCardTall({ deal, stagger = 2 }: { deal: Deal; stagger?: number }) {
  return (
    <article
      className={`reveal reveal-d${stagger} hover-lift group relative flex flex-col overflow-hidden bg-surface-container-low hover:shadow-2xl lg:col-span-4 lg:row-span-2`}
    >
      <div className="pointer-events-none absolute inset-0 z-20 border border-surface-container-high transition-colors group-hover:border-primary/30" />

      <div className="relative h-56 overflow-hidden bg-surface-dim sm:h-64 lg:h-1/2">
        <Image
          src={image(deal.image)}
          alt={deal.imageAlt}
          fill
          sizes="(max-width: 1023px) 100vw, 400px"
          className="object-cover transition-transform duration-700 group-hover:scale-110"
        />
        <div className="absolute inset-0 z-10 bg-gradient-to-t from-surface-container-low to-transparent opacity-90" />
      </div>

      <div className="relative z-10 flex flex-1 flex-col justify-between bg-surface-container-low p-8 md:p-10">
        <div className="flex flex-col gap-4">
          <span className="w-fit border-b border-surface-variant pb-2 font-label-caps text-label-caps uppercase tracking-[0.3em] text-tertiary">
            {deal.kicker}
          </span>
          <h3 className="font-headline-lg text-[30px] uppercase leading-[1.1] tracking-[0.05em] text-on-surface md:text-[36px]">
            {deal.name}
          </h3>
          <p className="font-body-md text-body-md text-on-surface-variant">{deal.description}</p>

          {deal.meta.length > 0 ? (
            <dl className="mt-4 flex flex-col gap-2 font-label-caps text-[11px] font-medium uppercase tracking-[0.1em] text-on-surface-variant/70">
              {deal.meta.map((pair) => (
                <div
                  key={pair.label}
                  className="flex justify-between border-b border-surface-variant/50 pb-1"
                >
                  <dt>{pair.label}</dt>
                  <dd className="tabular">{pair.value}</dd>
                </div>
              ))}
            </dl>
          ) : null}
        </div>

        <div className="mt-8 flex flex-col gap-4">
          <span className="text-right font-headline-lg text-[36px] tabular text-on-surface md:text-[40px]">
            {formatPesewas(deal.pricePesewas)}
          </span>
          <AddToBasket line={basketLine(deal)} variant="outline" className="w-full !py-4 !tracking-[0.2em]">
            Add to Basket
          </AddToBasket>
        </div>
      </div>
    </article>
  );
}

export function DealCardStandard({
  deal,
  glow = false,
  stagger = 3,
}: {
  deal: Deal;
  glow?: boolean;
  stagger?: number;
}) {
  const surface = glow ? 'bg-surface-container' : 'bg-surface-container-lowest';
  const scrim = glow ? 'from-surface-container' : 'from-surface-container-lowest';

  return (
    <article
      className={`reveal reveal-d${stagger} hover-lift group relative flex flex-col overflow-hidden border border-surface-variant ${surface} hover:shadow-2xl lg:col-span-4`}
    >
      <div className="relative h-56 overflow-hidden bg-surface-dim sm:h-64">
        <Image
          src={image(deal.image)}
          alt={deal.imageAlt}
          fill
          sizes="(max-width: 767px) 100vw, (max-width: 1023px) 50vw, 400px"
          className="object-cover transition-transform duration-700 group-hover:scale-110"
        />
        <div className={`absolute inset-0 z-10 bg-gradient-to-t ${scrim} to-transparent opacity-90`} />
      </div>

      {glow ? (
        <div className="pointer-events-none absolute -right-10 -top-10 h-40 w-40 rounded-full bg-primary/5 blur-[40px] transition-colors group-hover:bg-primary/10" />
      ) : null}

      <div className="relative z-10 flex flex-1 flex-col p-8">
        <div className="mb-6 flex items-start justify-between gap-4">
          <span className="font-label-caps text-label-caps uppercase tracking-[0.2em] text-primary">
            {deal.kicker}
          </span>
          {deal.icon ? (
            glow ? (
              <Icon name={deal.icon as IconName} className="size-6 shrink-0 text-on-surface-variant" />
            ) : (
              <span className="flex size-8 shrink-0 items-center justify-center rounded-full border border-outline/30 bg-surface">
                <Icon name={deal.icon as IconName} className="size-4 text-on-surface-variant" />
              </span>
            )
          ) : null}
        </div>

        <h3 className="mb-3 font-headline-lg text-[26px] uppercase tracking-[0.05em] text-on-surface md:text-[28px]">
          {deal.name}
        </h3>
        <p className="mb-6 flex-1 font-body-md text-body-md text-on-surface-variant">
          {deal.description}
        </p>

        <div className="flex items-end justify-between gap-4 border-t border-surface-variant pt-6">
          <span className="font-headline-lg text-[28px] tabular text-on-surface">
            {formatPesewas(deal.pricePesewas)}
          </span>
          <AddToBasket
            line={basketLine(deal)}
            variant="outline"
            className="!px-4 !py-2 !text-[10px]"
          >
            Add
          </AddToBasket>
        </div>
      </div>
    </article>
  );
}
