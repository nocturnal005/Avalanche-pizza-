import Image from 'next/image';

import { OrderCta } from '@/components/order/OrderCta';
import { image } from '@/content/images';
import { availableToppingNames, priceOf, sizeLabelOf, type Product } from '@/content';
import { formatPesewas } from '@/lib/money';
import { buildItemMessage } from '@/lib/whatsapp';

/**
 * The Core Menu bento card, in the three variants the design uses.
 *
 * `feature` is The Avalanche's 2×2 tile; `wide` spans two columns; `standard`
 * is 1×1. The signature detail is the content panel's `-mt-12`, which pulls it
 * up over the bottom 48px of the photo so the scrim fades into the card.
 */

function orderMessage(product: Product) {
  return buildItemMessage({
    name: product.name,
    pricePesewas: priceOf(product),
    sizeLabel: sizeLabelOf(product),
    chooseToppings: product.chooseToppings,
    availableToppings: product.chooseToppings ? availableToppingNames : undefined,
    ref: `web/menu/${product.slug}`,
  });
}

const SPAN: Record<Product['layout'], string> = {
  feature: 'col-span-1 md:col-span-2 lg:col-span-2 md:row-span-2',
  wide: 'md:col-span-2 lg:col-span-2',
  standard: '',
};

/** Cycles the reveal stagger across the grid so cards cascade in, not snap. */
function staggerClass(index: number): string {
  return `reveal reveal-d${(index % 4) + 1}`;
}

export function ProductCard({ product, index = 0 }: { product: Product; index?: number }) {
  if (product.layout === 'feature') return <FeatureCard product={product} index={index} />;

  const price = formatPesewas(priceOf(product));

  return (
    <article
      className={`${SPAN[product.layout]} ${staggerClass(index)} hover-lift group flex flex-col overflow-hidden rounded-lg bg-surface-container hover:shadow-2xl`}
    >
      <div className="relative h-56 overflow-hidden sm:h-64">
        <Image
          src={image(product.image)}
          alt={product.imageAlt}
          fill
          sizes="(max-width: 767px) 100vw, (max-width: 1023px) 50vw, 320px"
          className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-surface-container to-transparent opacity-80" />
        {product.badgeLabel ? (
          <span className="absolute top-4 right-4 z-20 rounded-sm border border-outline-variant bg-surface px-2 py-1 font-label-caps text-[10px] uppercase tracking-[0.1em] text-on-surface">
            {product.badgeLabel}
          </span>
        ) : null}
      </div>

      <div className="relative z-10 -mt-12 flex flex-grow flex-col bg-surface-container p-6">
        <h3 className="mb-2 font-headline-lg text-headline-lg-mobile uppercase tracking-[0.1em] text-on-surface">
          {product.name}
        </h3>
        <p className="mb-6 flex-grow font-body-md text-xs leading-relaxed text-on-surface-variant">
          {product.description}
        </p>
        <p className="mb-3 text-center font-label-caps text-lg font-medium tabular text-secondary-container">
          {price}
        </p>
        <OrderCta
          message={orderMessage(product)}
          variant="ghost"
          showIcon={false}
          ariaLabel={`Order ${product.name} on WhatsApp`}
          className="!py-2 !text-[10px] !tracking-[0.1em]"
        >
          Order on WhatsApp
        </OrderCta>
      </div>
    </article>
  );
}

function FeatureCard({ product, index = 0 }: { product: Product; index?: number }) {
  const price = formatPesewas(priceOf(product));

  return (
    <article
      className={`${SPAN.feature} ${staggerClass(index)} group relative flex flex-col overflow-hidden rounded-lg border border-surface-container-high bg-surface-container shadow-xl transition-all duration-500 hover:scale-[1.01] hover:border-outline-variant hover:shadow-2xl`}
    >
      <div className="relative h-72 flex-1 overflow-hidden md:h-full md:min-h-[320px]">
        <Image
          src={image(product.image)}
          alt={product.imageAlt}
          fill
          priority
          sizes="(max-width: 767px) 100vw, 640px"
          className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
        />
        {/* The export ships a left-to-right scrim on a vertically stacked card —
            a leftover from an earlier side-by-side layout. Corrected to fade
            upward into the copy panel, matching the mobile variant. */}
        <div className="absolute inset-0 z-10 bg-gradient-to-t from-surface-container to-transparent" />
        {product.badgeLabel ? (
          <span className="absolute top-4 left-4 z-20 rounded-sm bg-primary px-3 py-1 font-label-caps text-[10px] uppercase tracking-[0.1em] text-on-primary shadow-[0_0_15px_rgba(255,181,158,0.4)]">
            {product.badgeLabel}
          </span>
        ) : null}
      </div>

      <div className="relative z-20 flex flex-col justify-center bg-surface-container p-8 md:p-12">
        <div className="mb-4 flex items-start justify-between gap-4">
          <h2 className="font-headline-lg text-headline-lg-mobile uppercase tracking-[0.1em] text-primary md:text-headline-lg">
            {product.name}
          </h2>
          <span className="shrink-0 rounded-sm bg-primary-container px-4 py-1 font-label-caps text-body-lg font-medium tabular text-white">
            {price}
          </span>
        </div>
        <p className="mb-8 font-body-md text-body-md text-on-surface-variant">
          {product.description}
        </p>
        <div className="mt-auto">
          <OrderCta
            message={orderMessage(product)}
            variant="primary"
            ariaLabel={`Order ${product.name} on WhatsApp`}
            className="w-full md:w-auto"
          >
            Order on WhatsApp
          </OrderCta>
        </div>
      </div>
    </article>
  );
}
