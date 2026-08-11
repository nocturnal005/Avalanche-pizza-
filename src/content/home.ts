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

  featured: [
    {
      slug: 'margherita',
      image: 'home-feature-margherita',
      imageAlt:
        'Margherita pizza with San Marzano tomato, buffalo mozzarella and blistered basil, shot from above',
      description:
        'San Marzano D.O.P., fresh mozzarella di bufala, organic basil, extra virgin olive oil, wood-fired to a blistered perfection.',
      badge: { label: 'Vegetarian', tone: 'secondary' },
      tags: ['Wood-fired', 'Traditional'],
    },
    {
      slug: 'pepperoni',
      image: 'home-feature-pepperoni',
      imageAlt: 'Pepperoni pizza with cupped, charred pepperoni and melted provolone',
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
