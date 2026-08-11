import { buildWhatsAppUrl } from '@/lib/whatsapp';
import { Icon } from '@/components/ui/Icon';

/**
 * The only path from a product to an action.
 *
 * A plain server-rendered <a> with the message already encoded in the href —
 * no onClick, no router, no <button> pretending to be a link. On a congested
 * 3G cell JavaScript often arrives late or not at all, and a customer who can
 * tap Order while the bundle is still downloading is a customer who ordered.
 * CI asserts that every order link in the built HTML is an anchor.
 */

type Variant = 'primary' | 'outline' | 'ghost' | 'bare';

const VARIANTS: Record<Variant, string> = {
  /** Solid flame fill — the designs' "Claim Feast" / hero treatment. */
  primary:
    'bg-primary-container text-white hover:bg-primary hover:text-on-primary ' +
    'px-8 py-4 font-label-caps text-label-caps uppercase',
  /** 1px outline, fills on hover — the designs' secondary button. */
  outline:
    'border border-outline text-on-surface hover:bg-primary hover:text-on-primary hover:border-primary ' +
    'px-6 py-3 font-label-caps text-label-caps uppercase',
  /** Card-level action: full width, subtle until hover. */
  ghost:
    'w-full border border-outline-variant text-on-surface-variant ' +
    'hover:border-primary hover:text-primary ' +
    'px-4 py-3 font-label-caps text-label-caps uppercase',
  /** Inline text link — no chrome. */
  bare: 'text-primary hover:text-primary-fixed font-label-caps text-label-caps uppercase',
};

interface OrderCtaProps {
  /** Built by buildItemMessage / buildDealMessage / buildGeneralMessage. */
  message: string;
  children: React.ReactNode;
  variant?: Variant;
  className?: string;
  /** Show the WhatsApp mark. Off for dense card buttons where space is tight. */
  showIcon?: boolean;
  /**
   * Ten buttons all reading "Order" are indistinguishable to a screen reader,
   * so every card button names its product here.
   */
  ariaLabel?: string;
  /**
   * Adds the slow looping sheen the designs give their hero CTA. Reserve it
   * for the single most important button on a page — everywhere else the
   * on-hover sweep is enough.
   */
  shimmer?: boolean;
}

export function OrderCta({
  message,
  children,
  variant = 'primary',
  className = '',
  showIcon = true,
  ariaLabel,
  shimmer = false,
}: OrderCtaProps) {
  // `bare` is an inline text link — chrome-less, so no sheen.
  const motion = variant === 'bare' ? '' : `shine${shimmer ? ' shimmer-loop' : ''}`;

  return (
    <a
      href={buildWhatsAppUrl(message)}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={ariaLabel}
      className={`inline-flex items-center justify-center gap-2.5 transition-colors duration-200 ${motion} ${VARIANTS[variant]} ${className}`}
    >
      {showIcon ? <Icon name="whatsapp" className="size-4 shrink-0" /> : null}
      <span>{children}</span>
    </a>
  );
}
