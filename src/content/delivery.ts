import type { DeliveryZone } from './schema';

/**
 * Where Avalanche Pizza delivers, and what it costs.
 *
 * Only zones with `available: true` are offered at checkout — the rest exist
 * to record intent and to make re-enabling a one-word change rather than a
 * re-derivation of fees.
 *
 * DELIVERY IS BECHEM-ONLY (Frank, 2026-08-11). His checkout design listed
 * Derma and Techimantia, but the shop cannot service them yet, so they ship
 * disabled. Offering a zone the kitchen cannot reach is worse than not
 * offering it: the customer has already paid by the time anyone notices.
 *
 * TO ADD A ZONE: flip `available` to true and confirm the fee. It appears in
 * the checkout dropdown immediately.
 */
export const deliveryZones: DeliveryZone[] = [
  {
    id: 'bechem-town',
    name: 'Bechem Town',
    feePesewas: 1000, // GH₵ 10
    available: true,
    order: 0,
  },
  {
    id: 'derma',
    name: 'Derma',
    feePesewas: 1500, // GH₵ 15 — from the design; unconfirmed
    available: false,
    order: 1,
  },
  {
    id: 'techimantia',
    name: 'Techimantia',
    feePesewas: 2000, // GH₵ 20 — from the design; unconfirmed
    available: false,
    order: 2,
  },
];
