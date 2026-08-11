/**
 * Required wherever prices appear. ADR-007 and docs/SECURITY.md §4.6
 * (Ghana's Electronic Transactions Act 2008 vendor-disclosure duties).
 *
 * The shop cannot control delivery distance, availability, or how fast
 * ingredient costs move — and a site that prints a number it will not honour
 * is a complaint waiting to happen. Placed next to the prices, never buried
 * in a terms page.
 */
export function IndicativePriceNote({ className = '' }: { className?: string }) {
  return (
    <p
      className={`font-label-caps text-label-caps uppercase text-on-surface-variant/70 leading-relaxed ${className}`}
    >
      Prices shown are a guide. We confirm the final price and delivery in your WhatsApp chat before
      you pay.
    </p>
  );
}
