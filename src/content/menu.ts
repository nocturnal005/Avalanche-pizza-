import type { Category, Product } from './schema';

/**
 * The menu. Transcribed verbatim from the Core Menu design.
 *
 * TO CHANGE A PRICE: edit `pricePesewas` below — the comment beside it shows
 * the cedi value. Open a pull request, check the preview on your phone, merge.
 * Live in about two minutes. Full guide: docs/runbooks/EDITING-CONTENT.md
 *
 * `layout` drives the bento grid and reproduces the designed tiling exactly:
 *   feature  = 2 columns × 2 rows (The Avalanche only)
 *   wide     = 2 columns × 1 row
 *   standard = 1 × 1
 *
 * Alt text is written for screen readers — the exports carried only the AI
 * prompt that generated each photo, which is not usable alt text.
 */

export const categories: Category[] = [{ id: 'pizzas', name: 'Pizzas', order: 0 }];

export const products: Product[] = [
  {
    slug: 'the-avalanche',
    name: 'The Avalanche',
    description:
      'Prepared for those who enjoy a generously topped pizza, The Avalanche combines cured meats, roasted peppers, caramelised onions and a molten four-cheese blend, finished with an intense high-temperature bake for exceptional texture and depth of flavour.',
    categoryId: 'pizzas',
    sizes: [{ id: 'standard', label: 'Standard', pricePesewas: 2800 }], // Ghc 28
    badge: 'signature',
    badgeLabel: 'Signature',
    image: 'menu-the-avalanche',
    imageAlt: 'The Avalanche pizza, heavily loaded with cured meats, peppers and melted cheese',
    layout: 'feature',
    available: true,
    order: 0,
  },
  {
    slug: 'margherita',
    name: 'Margherita',
    description:
      'San Marzano tomato sauce, fresh fior di latte mozzarella, basil, and a drizzle of extra virgin olive oil.',
    categoryId: 'pizzas',
    sizes: [{ id: 'standard', label: 'Standard', pricePesewas: 1600 }], // Ghc 16
    image: 'menu-margherita',
    imageAlt: 'Margherita pizza with mozzarella and fresh basil on a rustic wooden board',
    layout: 'standard',
    available: true,
    order: 1,
  },
  {
    slug: 'pepperoni',
    name: 'Pepperoni',
    description:
      'Double-smoked, hand-cut pepperoni that cups and crisps perfectly, layered over our rich house-made tomato sauce.',
    categoryId: 'pizzas',
    sizes: [{ id: 'standard', label: 'Standard', pricePesewas: 1900 }], // Ghc 19
    image: 'menu-pepperoni',
    imageAlt: 'Pepperoni pizza with crisped, cupped pepperoni slices and a blistered crust',
    layout: 'standard',
    available: true,
    order: 2,
  },
  {
    slug: 'chicken-feast',
    name: 'Chicken Feast',
    description:
      'Herb-roasted chicken breast, sweet red onions, bell peppers, and a smoky bourbon BBQ drizzle.',
    categoryId: 'pizzas',
    sizes: [{ id: 'standard', label: 'Standard', pricePesewas: 2200 }], // Ghc 22
    image: 'menu-chicken-feast',
    imageAlt: 'Chicken Feast pizza topped with roast chicken, red onion and bell peppers',
    layout: 'wide',
    available: true,
    order: 3,
  },
  {
    slug: 'earths-bounty',
    name: "Earth's Bounty",
    description:
      'Charred zucchini, wild mushrooms, confit garlic, cherry tomatoes, and kalamata olives with fresh arugula.',
    categoryId: 'pizzas',
    sizes: [{ id: 'standard', label: 'Standard', pricePesewas: 2000 }], // Ghc 20
    badge: 'vegetarian',
    badgeLabel: 'Veg',
    image: 'menu-earths-bounty',
    imageAlt: 'Vegetarian pizza with courgette, mushrooms, cherry tomatoes and olives',
    layout: 'standard',
    available: true,
    order: 4,
  },
  {
    slug: 'the-pacific',
    name: 'The Pacific',
    description:
      'Thick-cut honey glazed ham paired with wood-roasted pineapple chunks and jalapeño dust.',
    categoryId: 'pizzas',
    sizes: [{ id: 'standard', label: 'Standard', pricePesewas: 2100 }], // Ghc 21
    image: 'menu-the-pacific',
    imageAlt: 'The Pacific pizza with honey glazed ham and roasted pineapple',
    layout: 'standard',
    available: true,
    order: 5,
  },
  {
    slug: 'bbq-original',
    name: 'BBQ Original',
    description: 'Smoky BBQ base, mozzarella, chicken, red onions, and sweetcorn.',
    categoryId: 'pizzas',
    sizes: [{ id: 'standard', label: 'Standard', pricePesewas: 2000 }], // Ghc 20
    image: 'menu-bbq-original',
    imageAlt: 'BBQ Original pizza with chicken, red onion and sweetcorn on a smoky BBQ base',
    layout: 'wide',
    available: true,
    order: 6,
  },
  {
    slug: 'spicy-beef-one',
    name: 'Spicy Beef One',
    description: 'Spicy ground beef, jalapeños, red onions, and green peppers on a tomato base.',
    categoryId: 'pizzas',
    sizes: [{ id: 'standard', label: 'Standard', pricePesewas: 2100 }], // Ghc 21
    badge: 'spicy',
    badgeLabel: 'Spicy',
    image: 'menu-spicy-beef-one',
    imageAlt: 'Spicy beef pizza with jalapeños, red onion and green peppers',
    layout: 'standard',
    available: true,
    order: 7,
  },
  {
    slug: 'free-choice',
    name: 'Free Choice',
    description: 'Your creation. Choose any 4 toppings from our premium selection.',
    categoryId: 'pizzas',
    sizes: [{ id: 'standard', label: 'Standard', pricePesewas: 2300 }], // Ghc 23
    image: 'menu-free-choice',
    imageAlt: 'Build-your-own pizza with a colourful mix of fresh vegetable toppings',
    layout: 'standard',
    chooseToppings: 4,
    available: true,
    order: 8,
  },
  {
    slug: 'all-4-one',
    name: 'All 4 One',
    description:
      "A quartered masterpiece—Pepperoni, Margherita, BBQ Chicken, and Earth's Bounty all in one pizza.",
    categoryId: 'pizzas',
    sizes: [{ id: 'standard', label: 'Standard', pricePesewas: 2500 }], // Ghc 25
    image: 'menu-all-4-one',
    imageAlt: 'Pizza divided into four quarters, each with a different topping combination',
    layout: 'standard',
    available: true,
    order: 9,
  },
  {
    slug: 'classic',
    name: 'Classic',
    description: 'The timeless favorite—Tomato sauce, mozzarella, and a touch of oregano.',
    categoryId: 'pizzas',
    sizes: [{ id: 'standard', label: 'Standard', pricePesewas: 1500 }], // Ghc 15
    image: 'menu-classic',
    imageAlt: 'Classic pizza with tomato sauce, mozzarella and oregano',
    layout: 'standard',
    available: true,
    order: 10,
  },
];
