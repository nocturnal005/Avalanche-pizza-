'use client';

import Link from 'next/link';

import { Icon } from '@/components/ui/Icon';
import { basketCount, useBasket } from '@/lib/basket/store';

/**
 * The header basket, restored now that a real basket exists (ADR-009).
 *
 * It was removed under ADR-006 deviation 1 because a basket that opened
 * WhatsApp would have lied about what happened next. That objection is gone.
 *
 * Renders the designed treatment: the icon with a 20px count pill offset into
 * its top-right corner. The count starts at 0 on the server and fills in on
 * hydration, so there is no mismatch.
 */
export function BasketBadge() {
  const lines = useBasket();
  const count = basketCount(lines);

  return (
    <Link
      href="/basket"
      aria-label={count > 0 ? `Basket, ${count} item${count === 1 ? '' : 's'}` : 'Basket, empty'}
      className="relative flex items-center text-on-surface-variant transition-colors hover:text-primary"
    >
      <Icon name="basket" className="size-6 lg:size-7" />
      <span
        className={`absolute -top-2 -right-2 flex size-5 items-center justify-center rounded-full bg-primary-container text-[10px] font-bold tabular text-white transition-opacity ${
          count > 0 ? 'opacity-100' : 'opacity-0'
        }`}
        aria-hidden="true"
      >
        {count}
      </span>
    </Link>
  );
}
