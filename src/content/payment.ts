/**
 * Mobile money providers offered at checkout (ADR-009).
 *
 * All three ride ONE Paystack integration — the `mobile_money` channel — so
 * this list is what the customer picks from, not three separate gateways.
 *
 * A note on names: the owner asked for "MTN, Vodafone, and Telecel". Vodafone
 * Ghana became **Telecel Ghana** in 2023, and Vodafone Cash was renamed
 * Telecel Cash — they are the same wallet, not two. Showing both would offer
 * a choice that does not exist. AT Money (formerly AirtelTigo Money) is the
 * third Ghanaian rail and is included.
 *
 * `paystackCode` is the value Paystack expects for the mobile-money provider.
 */
export interface MomoProvider {
  id: string;
  name: string;
  /** Shown under the name to remove doubt about rebrands. */
  note?: string;
  paystackCode: 'mtn' | 'vod' | 'atl';
  available: boolean;
}

export const momoProviders: MomoProvider[] = [
  { id: 'mtn', name: 'MTN MoMo', paystackCode: 'mtn', available: true },
  {
    id: 'telecel',
    name: 'Telecel Cash',
    note: 'formerly Vodafone Cash',
    paystackCode: 'vod',
    available: true,
  },
  {
    id: 'at',
    name: 'AT Money',
    note: 'formerly AirtelTigo',
    paystackCode: 'atl',
    available: true,
  },
];

export const availableMomoProviders = momoProviders.filter((p) => p.available);

/**
 * Cards are deferred (ADR-009). Flipping this to true is the config half of
 * enabling them; the other half is a security review, because card acceptance
 * pulls PCI DSS SAQ-A back into scope.
 */
export const CARDS_ENABLED = false;
