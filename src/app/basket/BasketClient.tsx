'use client';

import Link from 'next/link';

import { Icon } from '@/components/ui/Icon';
import { IndicativePriceNote } from '@/components/order/IndicativePriceNote';
import {
  basketSubtotal,
  removeLine,
  setQty,
  useBasket,
  type BasketLine,
} from '@/lib/basket/store';
import { formatPesewas } from '@/lib/money';

/**
 * The basket, from the owner's "Basket V2" design: line cards on the left,
 * a sticky order summary on the right, promo field beneath the lines.
 *
 * Delivery is a flat GH₵ 10 (Bechem is the only zone), but the design says
 * "Calculated at checkout" and that stays until the owner rules on showing a
 * true total here — see ADR-009.
 */
export function BasketClient({ deliveryFeePesewas }: { deliveryFeePesewas: number }) {
  const lines = useBasket();
  const subtotal = basketSubtotal(lines);

  if (lines.length === 0) return <EmptyBasket />;

  return (
    <div className="grid grid-cols-1 gap-gutter lg:grid-cols-12 lg:gap-16">
      {/* Lines */}
      <div className="flex flex-col gap-6 lg:col-span-8">
        {lines.map((line) => (
          <LineCard key={line.id} line={line} />
        ))}

        <div className="mt-8 flex max-w-md flex-col gap-4 sm:flex-row">
          <input
            type="text"
            placeholder="PROMO CODE"
            aria-label="Promo code"
            className="w-full border border-surface-container-high bg-surface-container-highest px-4 py-3 font-label-caps text-label-caps text-on-surface placeholder:text-on-surface-variant/50 focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none"
          />
          <button
            type="button"
            className="border border-primary px-6 py-3 font-label-caps text-label-caps tracking-[0.1em] whitespace-nowrap text-primary transition-colors hover:bg-primary/10"
          >
            Apply
          </button>
        </div>
        <p className="font-label-caps text-[10px] uppercase tracking-[0.1em] text-on-surface-variant/50">
          Promo codes are not active yet.
        </p>
      </div>

      {/* Summary */}
      <div className="mt-12 lg:col-span-4 lg:mt-0">
        <div className="sticky top-32 border border-surface-container-high bg-surface-container p-8">
          <h2 className="mb-8 border-b border-surface-container-high pb-4 font-headline-lg text-headline-lg-mobile uppercase tracking-[0.1em] text-on-surface">
            Order Summary
          </h2>

          <div className="space-y-4">
            <Row label="Subtotal" value={formatPesewas(subtotal)} />
            <Row label="Delivery" value={formatPesewas(deliveryFeePesewas)} muted />
          </div>

          <div className="mt-6 flex items-end justify-between border-t border-surface-container-high pt-6">
            <span className="font-label-caps text-label-caps uppercase tracking-[0.2em] text-on-surface">
              Total
            </span>
            <span className="font-headline-lg text-[26px] tabular tracking-[0.05em] text-secondary-container">
              {formatPesewas(subtotal + deliveryFeePesewas)}
            </span>
          </div>

          <Link
            href="/checkout"
            className="shine mt-8 flex w-full items-center justify-center gap-2 bg-primary-container py-5 font-label-caps text-label-caps uppercase tracking-[0.2em] text-white transition-colors hover:bg-primary hover:text-on-primary"
          >
            Proceed to Checkout
            <Icon name="arrow_forward" className="size-4" />
          </Link>

          <Link
            href="/menu"
            className="mt-4 flex w-full items-center justify-center py-3 font-label-caps text-label-caps uppercase tracking-[0.2em] text-on-surface-variant transition-colors hover:text-primary"
          >
            Continue Shopping
          </Link>

          <IndicativePriceNote className="mt-6" />
        </div>
      </div>
    </div>
  );
}

function Row({ label, value, muted }: { label: string; value: string; muted?: boolean }) {
  return (
    <div className="flex items-center justify-between text-on-surface-variant">
      <span className="font-body-md text-body-md">{label}</span>
      <span className={`font-label-caps text-label-caps tabular ${muted ? 'opacity-80' : ''}`}>
        {value}
      </span>
    </div>
  );
}

function LineCard({ line }: { line: BasketLine }) {
  return (
    <article className="flex flex-col items-start justify-between gap-6 border border-surface-container-high bg-surface-container p-6 sm:flex-row sm:items-center">
      <div className="flex-grow">
        <h3 className="mb-2 font-headline-lg text-headline-lg-mobile tracking-[0.05em] text-on-surface">
          {line.name}
        </h3>
        {line.sizeLabel ? (
          <p className="mb-3 font-body-md text-body-md text-on-surface-variant">
            Size: {line.sizeLabel}
          </p>
        ) : null}
        {line.tags?.length ? (
          <div className="mb-4 flex flex-wrap gap-2 sm:mb-0">
            {line.tags.map((tag) => (
              <span
                key={tag}
                className="bg-surface-container-high px-2 py-1 font-label-caps text-label-caps uppercase tracking-[0.1em] text-primary"
              >
                {tag}
              </span>
            ))}
          </div>
        ) : null}
      </div>

      <div className="flex w-full items-center justify-between gap-6 sm:w-auto sm:justify-end sm:gap-12">
        <div className="flex items-center border border-surface-container-high">
          <button
            type="button"
            onClick={() => setQty(line.id, line.qty - 1)}
            aria-label={`Decrease ${line.name} quantity`}
            className="px-3 py-1 text-on-surface-variant transition-colors hover:bg-surface-container-high"
          >
            −
          </button>
          <span className="px-3 font-label-caps text-label-caps tabular text-on-surface" aria-live="polite">
            {line.qty}
          </span>
          <button
            type="button"
            onClick={() => setQty(line.id, line.qty + 1)}
            aria-label={`Increase ${line.name} quantity`}
            className="px-3 py-1 text-on-surface-variant transition-colors hover:bg-surface-container-high"
          >
            +
          </button>
        </div>

        <div className="min-w-[80px] text-right font-label-caps text-label-caps tabular text-primary">
          {formatPesewas(line.unitPesewas * line.qty)}
        </div>

        <button
          type="button"
          onClick={() => removeLine(line.id)}
          aria-label={`Remove ${line.name} from basket`}
          className="text-on-surface-variant transition-colors hover:text-error"
        >
          <Icon name="close" className="size-5" />
        </button>
      </div>
    </article>
  );
}

function EmptyBasket() {
  return (
    <div className="flex flex-col items-start gap-6 border border-surface-container-high bg-surface-container p-10 md:p-16">
      <Icon name="basket" className="size-10 text-primary" />
      <h2 className="font-headline-lg text-headline-lg-mobile uppercase tracking-[0.1em] text-on-surface">
        Your basket is empty
      </h2>
      <p className="max-w-md font-body-md text-body-md text-on-surface-variant">
        Nothing here yet. Browse the menu or take a look at what is on offer.
      </p>
      <div className="mt-2 flex flex-wrap gap-4">
        <Link
          href="/menu"
          className="shine border border-primary px-8 py-4 font-label-caps text-label-caps uppercase tracking-[0.2em] text-primary transition-colors hover:bg-primary hover:text-on-primary"
        >
          View Menu
        </Link>
        <Link
          href="/deals"
          className="px-8 py-4 font-label-caps text-label-caps uppercase tracking-[0.2em] text-on-surface-variant transition-colors hover:text-primary"
        >
          See Deals
        </Link>
      </div>
    </div>
  );
}
