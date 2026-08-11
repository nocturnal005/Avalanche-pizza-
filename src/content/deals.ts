import type { Deal } from './schema';

/**
 * The five deals, verbatim from the Special Deals design.
 *
 * `slot` is the fixed cell in the designed bento grid — one deal per slot,
 * and the grid geometry depends on it:
 *   hero   — the full-bleed Party Feast banner
 *   mega   — 8 columns, image beside copy
 *   family — 4 columns spanning 2 rows, the tall card
 *   triple — 4 columns
 *   party  — 4 columns
 *
 * `includes` is itemised into the WhatsApp message, so the shop reads back
 * exactly what the customer was shown.
 *
 * NOTE FOR THE OWNER: earlier notes listed the deals as The Ascent, The
 * Gathering, Party Feast, All 4 One and Free Choice. The designed page carries
 * The Summit and Basecamp instead, while All 4 One and Free Choice are Core
 * Menu pizzas. This file ships what is drawn — confirm it matches the offers
 * you actually run.
 */
export const deals: Deal[] = [
  {
    slug: 'party-feast',
    name: 'The Party Feast',
    kicker: 'Elite Offer',
    description:
      'Four massive artisan pizzas, three boxes of inferno-roasted wings, and endless sides. Crafted for the multitude. Forged in heat.',
    pricePesewas: 8900, // Ghc 89
    wasPricePesewas: 12000, // Ghc 120
    includes: ['4 artisan pizzas', '3 boxes of wings', 'Sides'],
    meta: [],
    image: 'deal-party-feast',
    imageAlt: 'A spread of Avalanche pizzas, wings and sides laid out for a party',
    slot: 'hero',
    available: true,
  },
  {
    slug: 'the-summit',
    name: 'The Summit',
    kicker: 'Mega Deal',
    description:
      'Two XL Signature Pizzas, 20 Wings, Large Garlic Bread, and two 2L sodas. Maximum impact for serious gatherings.',
    pricePesewas: 5500, // Ghc 55
    includes: ['2 XL signature pizzas', '20 wings', 'Large garlic bread', '2 x 2L sodas'],
    meta: [],
    image: 'deal-the-summit',
    imageAlt: 'Two extra-large gourmet pizzas in branded boxes on a dark slate surface',
    slot: 'mega',
    icon: 'flame',
    available: true,
  },
  {
    slug: 'basecamp',
    name: 'Basecamp',
    kicker: 'Family Deal',
    description:
      'One Large Classic Pizza, Family Salad, Baked Ziti, and a Dessert. Engineered to satisfy the unit.',
    pricePesewas: 4200, // Ghc 42
    includes: ['1 large classic pizza', 'Family salad', 'Baked ziti', 'Dessert'],
    meta: [
      { label: 'Serves', value: '4-6' },
      { label: 'Prep Time', value: '25 Min' },
    ],
    image: 'deal-basecamp',
    imageAlt: 'A family meal of pizza, fresh salad and baked pasta laid out together',
    slot: 'family',
    available: true,
  },
  {
    slug: 'the-ascent',
    name: 'The Ascent',
    kicker: 'Triple Deal',
    description: 'Three Medium 1-Topping Pizzas. The optimal equation for varied tastes.',
    pricePesewas: 3300, // Ghc 33
    includes: ['3 medium 1-topping pizzas'],
    meta: [],
    image: 'deal-the-ascent',
    // Owner's Stitch screen, 2026-08-12 — three open boxes, which is exactly
    // what the deal is. Master archived in design/stitch-exports/source-images/.
    imageAlt:
      'Three medium pizzas in open Avalanche boxes on a wooden table, friends laughing over drinks behind them',
    slot: 'triple',
    icon: 'filter_3',
    available: true,
  },
  {
    slug: 'the-gathering',
    name: 'The Gathering',
    kicker: 'Pizza Party',
    description: 'Five Large 1-Topping Pizzas. Designed for mass deployment. No one goes hungry.',
    pricePesewas: 6500, // Ghc 65
    includes: ['5 large 1-topping pizzas'],
    meta: [],
    image: 'deal-the-gathering',
    imageAlt: 'Five large pizzas spread across a table for a group',
    slot: 'party',
    icon: 'celebration',
    available: true,
  },
];
