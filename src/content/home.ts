import type { ImageKey } from './images';

/**
 * Homepage copy, verbatim from the design.
 *
 * The featured cards keep their own photography, description, badge and tags —
 * that is design content. But the NAME and PRICE resolve from menu.ts, because
 * the Home design prints "Classic Margherita — $18" and "Inferno Pepperoni —
 * $22" in US dollars for pizzas the Core Menu prices at Ghc 16 and Ghc 19.
 * One pizza cannot carry two prices in two currencies; the menu is the single
 * source of truth for identity and money. ADR-006 deviation 6.
 */

export interface FeaturedCard {
  /** Resolves name + price from menu.ts. */
  slug: string;
  image: ImageKey;
  imageAlt: string;
  /** The Home design's own copy, which differs from the Core Menu description. */
  description: string;
  badge: { label: string; tone: 'secondary' | 'error' };
  tags: string[];
}

export const home = {
  hero: {
    eyebrow: 'Bespoke Edition',
    headline: 'Hits every taste bud.',
    body: 'Intense heat. Unrivalled crust. Prepared for people who enjoy tasty pizza.',
    image: 'home-hero' as ImageKey,
    imageAlt:
      'A wood-fired Avalanche pizza with a blistered crust, lit by the glow of the oven behind it',
    flourish: 'Est. 2024',
  },

  collection: {
    eyebrowTitle: 'The',
    accentWord: 'Premium',
    titleTail: 'Collection',
    body: 'Carefully prepared, thoughtfully layered, and baked at intense heat. Every ingredient is chosen to build depth, balance and flavour in every bite.',
    linkLabel: 'Explore Core Menu',
  },

  /**
   * The two cards the homepage leads with.
   *
   * OPEN MISMATCH ON THE FIRST CARD (raised with the owner, 2026-08-11).
   * `slug: 'margherita'` drives the heading and the price, so the card reads
   * "Margherita — San Marzano D.O.P., fresh mozzarella di bufala, organic
   * basil" while the photograph he chose shows a pizza loaded with peppers,
   * onions, mushrooms and olives. The image was replaced exactly as asked;
   * pointing the card at a different product is a merchandising decision and
   * his to make. `earths-bounty` on the Core Menu matches the photograph and
   * carries the same Vegetarian badge, so the fix is one word here if he
   * wants it.
   */
  featured: [
    {
      slug: 'margherita',
      image: 'home-feature-margherita',
      // Describes the photograph, which the owner replaced on 2026-08-11 with
      // a loaded vegetarian pizza. Alt text has to match the picture, not the
      // card's heading — see the note under `featured` about that mismatch.
      imageAlt:
        'A vegetarian pizza on a rustic wooden table, topped with red and green peppers, red onion, mushrooms, black olives and basil on a blistered, charred crust, shot from above',
      description:
        'San Marzano D.O.P., fresh mozzarella di bufala, organic basil, extra virgin olive oil, wood-fired to a blistered perfection.',
      badge: { label: 'Vegetarian', tone: 'secondary' },
      tags: ['Wood-fired', 'Traditional'],
    },
    {
      slug: 'pepperoni',
      image: 'home-feature-pepperoni',
      imageAlt:
        'A pepperoni pizza on a slate board, crisped pepperoni over melted mozzarella, with friends laughing around a table in the warmly lit restaurant behind it',
      description:
        'Artisan cupping pepperoni, aged provolone, house-made spicy arrabbiata sauce, finished with a hot honey drizzle.',
      badge: { label: 'Spicy', tone: 'error' },
      tags: ['Meat', 'Hot Honey'],
    },
  ] satisfies FeaturedCard[],

  process: {
    eyebrow: 'The Process',
    titleLead: 'Fired at',
    titleAccent: '500 degrees',
    body: 'We don’t just bake; we resurrect flavour. Our dough undergoes a 24-hour cold fermentation before meeting the intense oven heat, cooked fast and kissed by a 500 degree flame to deliver that perfect crust.',
    stats: [
      { value: '24', unit: 'hr', caption: 'Fermentation' },
      { value: '500', unit: '°', caption: 'Oak Fire Heat' },
      { value: '60', unit: 's', caption: 'Bake Time' },
    ],
    tiles: {
      dough: {
        image: 'story-chef-dough' as ImageKey,
        alt: 'A chef stretching fresh pizza dough by hand, dusted with flour',
      },
      flame: {
        image: 'story-oven-flame' as ImageKey,
        alt: 'The blue flame of the pizza oven at full heat',
      },
      ingredients: {
        image: 'story-ingredients' as ImageKey,
        alt: 'Fresh tomatoes, mozzarella, basil, flour and olive oil laid out on a dark surface',
      },
    },
    feature: {
      title: 'Quality by Design',
      body: 'Every ingredient is sourced for its purity and flavour profile, ensuring excellence in every slice.',
    },
  },
} as const;
