/**
 * THE single source of truth for how customers reach Avalanche Pizza.
 *
 * ─────────────────────────────────────────────────────────────────────────────
 *  SECURITY-CRITICAL FILE.  docs/SECURITY.md control C3.
 *
 *  Every order placed through this website arrives at the number below. If it
 *  is ever wrong — through an attack, a bad merge, or a typo — customers' orders
 *  and their money go to someone else, silently, while the site keeps working.
 *
 *  Rules, enforced in CI:
 *    • No other file may contain a `wa.me`, `tel:` or `+233` literal.
 *    • The value is pinned in tests/shop-number.pin.test.ts — changing the number
 *      requires editing TWO files, both owned by CODEOWNERS.
 *    • scripts/assert-order-links.mjs re-checks every link in the BUILT html,
 *      which catches a dependency that rewrites hrefs even when source is clean.
 * ─────────────────────────────────────────────────────────────────────────────
 */

/**
 * Placeholder until the shop supplies its real line (Stage 4).
 * Shaped like a valid Ghanaian MSISDN so the build and tests run, but obviously
 * fake so it can never be mistaken for live. The launch gate blocks on it.
 */
const PLACEHOLDER_WHATSAPP = '+233200000000';

export const SHOP = {
  name: 'Avalanche Pizza',
  tagline: 'Premium tasty pizza in the heart of Bechem.',

  /** E.164, leading '+'. Source for every wa.me and tel: link on the site. */
  whatsappE164: PLACEHOLDER_WHATSAPP,

  /** Shown as text, for people who will dial it by hand or write it down. */
  phoneDisplay: '020 000 0000',

  addressLines: [
    'Bechem Community Centre',
    'along Kwasu Road, Bechem',
    'Ahafo Region, Ghana',
  ],

  /** Append "Ref: web/…" to prefilled messages so the shop knows the source. */
  includeRefTag: true,

  /**
   * The footer's "Connect" column, as designed. The icons ship regardless —
   * they are part of the design — but each only becomes a link once its real
   * URL is filled in, so the site never carries a dead social link.
   *
   * OWNER: paste your Facebook, Instagram and TikTok URLs here.
   */
  socials: [
    { name: 'Facebook', href: '' },
    { name: 'Instagram', href: '' },
    { name: 'TikTok', href: '' },
  ],
} as const;

/**
 * True while the shop's real number is still outstanding. The launch gate in
 * docs/SECURITY.md fails while this is true; `npm run build` warns.
 */
export const CONTACT_IS_PLACEHOLDER = SHOP.whatsappE164 === PLACEHOLDER_WHATSAPP;

/** Shape check at module load — a malformed number fails the build, not a customer. */
if (!/^\+233\d{9}$/.test(SHOP.whatsappE164)) {
  throw new Error(
    `SHOP.whatsappE164 must be a Ghanaian E.164 number (+233 followed by 9 digits). Got: ${SHOP.whatsappE164}`,
  );
}
