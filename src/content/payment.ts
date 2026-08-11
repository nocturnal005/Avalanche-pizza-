/**
 * Mobile money providers offered at checkout (ADR-009, gateway per ADR-010).
 *
 * All three ride ONE Flutterwave integration — the `mobilemoneyghana`
 * payment option — so this list is what the customer picks from, not three
 * separate gateways.
 *
 * A note on names: the owner asked for "MTN, Vodafone, and Telecel". Vodafone
 * Ghana became **Telecel Ghana** in 2023, and Vodafone Cash was renamed
 * Telecel Cash — they are the same wallet, not two. Showing both would offer
 * a choice that does not exist. AT Money (formerly AirtelTigo Money) is the
 * third Ghanaian rail and is included.
 *
 * `network` is the value Flutterwave expects for Ghana mobile money.
 */
export interface MomoProvider {
  id: string;
  name: string;
  /** Shown under the name to remove doubt about rebrands. */
  note?: string;
  /** Flutterwave's `network` value for Ghana mobile money. */
  network: 'MTN' | 'VODAFONE' | 'AIRTELTIGO';
  available: boolean;
}

export const momoProviders: MomoProvider[] = [
  { id: 'mtn', name: 'MTN MoMo', network: 'MTN', available: true },
  {
    id: 'telecel',
    name: 'Telecel Cash',
    note: 'formerly Vodafone Cash',
    network: 'VODAFONE',
    available: true,
  },
  {
    id: 'at',
    name: 'AT Money',
    note: 'formerly AirtelTigo',
    network: 'AIRTELTIGO',
    available: true,
  },
];

export const availableMomoProviders = momoProviders.filter((p) => p.available);

/**
 * Cards are ENABLED (ADR-010 — the owner overrode the earlier deferral).
 *
 * They are safe to accept only because payment happens on Flutterwave's
 * hosted page: no PAN, expiry or CVV ever reaches our servers or our
 * JavaScript, which keeps PCI DSS scope at SAQ-A. Building a card form on
 * this site would move us to SAQ-D and is prohibited — see docs/SECURITY.md.
 */
export const CARDS_ENABLED = true;
