import { SHOP } from '@/config/shop';
import { buildTelUrl } from '@/lib/whatsapp';
import { Icon } from '@/components/ui/Icon';

/**
 * The co-equal fallback to WhatsApp.
 *
 * Covers the customer without WhatsApp installed, the desktop visitor with no
 * WhatsApp Web session, and anyone whose browser registers no tel: handler —
 * which is why the footer also prints the number as plain selectable text.
 */

type Variant = 'outline' | 'bare';

const VARIANTS: Record<Variant, string> = {
  outline:
    'border border-outline text-on-surface hover:bg-primary hover:text-on-primary hover:border-primary ' +
    'px-6 py-3 pointer-coarse:py-4 font-label-caps text-label-caps uppercase',
  // `bare` is a chrome-less inline link, so padding it would shift the text.
  // `tap-y` buys the 44px hit area on touch only, drawn size untouched.
  bare: 'tap-y text-on-surface-variant hover:text-primary',
};

interface CallLinkProps {
  children?: React.ReactNode;
  variant?: Variant;
  className?: string;
  showIcon?: boolean;
}

export function CallLink({
  children,
  variant = 'outline',
  className = '',
  showIcon = true,
}: CallLinkProps) {
  return (
    <a
      href={buildTelUrl()}
      className={`inline-flex items-center justify-center gap-2.5 transition-colors duration-200 ${
        variant === 'bare' ? '' : 'shine'
      } ${VARIANTS[variant]} ${className}`}
    >
      {showIcon ? <Icon name="phone" className="size-4 shrink-0" /> : null}
      <span>{children ?? `Call ${SHOP.phoneDisplay}`}</span>
    </a>
  );
}
