'use client';

import { useEffect, useState } from 'react';

import { Icon } from '@/components/ui/Icon';
import { addLine, type BasketLine } from '@/lib/basket/store';

/**
 * The add-to-basket control. Replaces the WhatsApp CTA as the primary action
 * on menu cards and deal cards under ADR-009; WhatsApp remains as the
 * secondary path in the footer and page-level CTAs.
 *
 * Confirms inline for ~1.6s rather than navigating away — a customer building
 * a multi-item order should never be bounced to the basket after every tap.
 */

type Variant = 'primary' | 'ghost' | 'outline';

const VARIANTS: Record<Variant, string> = {
  primary:
    'bg-primary-container text-white hover:bg-primary hover:text-on-primary px-8 py-4 font-label-caps text-label-caps uppercase',
  ghost:
    'w-full border border-outline-variant text-on-surface-variant hover:border-primary hover:text-primary px-4 py-3 font-label-caps text-label-caps uppercase',
  outline:
    'border border-primary text-primary hover:bg-primary hover:text-on-primary px-6 py-3 font-label-caps text-label-caps uppercase',
};

interface AddToBasketProps {
  line: Omit<BasketLine, 'qty'>;
  variant?: Variant;
  className?: string;
  children?: React.ReactNode;
}

export function AddToBasket({
  line,
  variant = 'ghost',
  className = '',
  children,
}: AddToBasketProps) {
  const [added, setAdded] = useState(false);

  useEffect(() => {
    if (!added) return;
    const t = setTimeout(() => setAdded(false), 1600);
    return () => clearTimeout(t);
  }, [added]);

  return (
    <button
      type="button"
      onClick={() => {
        addLine(line);
        setAdded(true);
      }}
      aria-label={`Add ${line.name} to basket`}
      className={`shine inline-flex items-center justify-center gap-2 tracking-[0.1em] transition-colors duration-200 ${VARIANTS[variant]} ${className}`}
    >
      <Icon name={added ? 'check' : 'add'} className="size-4 shrink-0" />
      <span aria-live="polite">{added ? 'Added' : (children ?? 'Add to Basket')}</span>
    </button>
  );
}
