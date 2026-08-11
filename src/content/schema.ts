import { z } from 'zod';

import { IMAGE_KEYS } from './images';

/**
 * The menu is data, not markup. These schemas are parsed at module load, which
 * happens during `next build` — so malformed content cannot deploy, it fails
 * the build. docs/ARCHITECTURE.md §3.
 */

/** Ghc 10,000 ceiling — a sanity bound, not a business rule. */
export const pesewas = z.number().int().nonnegative().max(1_000_000);

export const slug = z
  .string()
  .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'must be lowercase-hyphenated');

/**
 * Alt text is authored content, not a code task. The Stitch exports carry
 * `data-alt` holding the AI prompt that generated each photo — useless to a
 * screen reader, so every image gets real alt text here.
 */
export const altText = z.string().min(12).max(160);

/** ASCII only: these strings are URL-encoded into WhatsApp messages. */
const asciiText = (max: number) =>
  z
    .string()
    .min(2)
    .max(max)
    // eslint-disable-next-line no-control-regex
    .regex(/^[\x20-\x7E]+$/, 'must be ASCII — it is encoded into a WhatsApp message');

export const sizeSchema = z.object({
  id: z.enum(['standard', 'medium', 'large', 'xl']),
  label: z.string().min(2).max(12),
  pricePesewas: pesewas,
});

export const categorySchema = z.object({
  id: slug,
  name: z.string().min(2).max(30),
  order: z.number().int().nonnegative(),
});

export const productSchema = z.object({
  slug,
  name: asciiText(40),
  description: z.string().min(20).max(320),
  categoryId: slug,
  sizes: z.array(sizeSchema).min(1),
  badge: z.enum(['signature', 'vegetarian', 'spicy']).optional(),
  /** Label shown on the badge chip, verbatim from the design (e.g. "Veg"). */
  badgeLabel: z.string().max(16).optional(),
  image: z.enum(IMAGE_KEYS),
  imageAlt: altText,
  /** Span in the designed bento grid. Changing this changes the composition. */
  layout: z.enum(['feature', 'wide', 'standard']),
  /** Renders the open "my N toppings are:" WhatsApp field. */
  chooseToppings: z.number().int().min(1).max(8).optional(),
  available: z.boolean().default(true),
  order: z.number().int().nonnegative(),
});

export const dealSchema = z.object({
  slug,
  name: asciiText(40),
  kicker: z.string().min(3).max(20),
  description: z.string().min(20).max(320),
  pricePesewas: pesewas,
  wasPricePesewas: pesewas.optional(),
  /** Itemised into the WhatsApp message so the shop reads back what was shown. */
  includes: z.array(asciiText(60)).min(1).max(6),
  meta: z
    .array(z.object({ label: z.string().max(12), value: z.string().max(12) }))
    .max(2)
    .default([]),
  image: z.enum(IMAGE_KEYS),
  imageAlt: altText,
  /** Fixed cell in the designed grid. Exactly one deal per slot. */
  slot: z.enum(['hero', 'mega', 'family', 'triple', 'party']),
  icon: z.string().max(32).optional(),
  available: z.boolean().default(true),
});

export const toppingSchema = z.object({
  id: slug,
  name: asciiText(20),
  available: z.boolean().default(true),
});

export const deliveryZoneSchema = z.object({
  id: slug,
  name: asciiText(40),
  feePesewas: pesewas,
  /** Only available zones reach the checkout dropdown. */
  available: z.boolean().default(true),
  order: z.number().int().nonnegative(),
});

export type Size = z.infer<typeof sizeSchema>;
export type Category = z.infer<typeof categorySchema>;
export type Product = z.infer<typeof productSchema>;
export type Deal = z.infer<typeof dealSchema>;
export type Topping = z.infer<typeof toppingSchema>;
export type DeliveryZone = z.infer<typeof deliveryZoneSchema>;

/**
 * Invariants the schemas cannot express. Each one protects a property of the
 * designs — violating it means the page can no longer render as drawn.
 */
export function assertContentInvariants(input: {
  products: Product[];
  deals: Deal[];
  categories: Category[];
  zones: DeliveryZone[];
}): void {
  const { products, deals, categories, zones } = input;
  const fail = (message: string): never => {
    throw new Error(`Content invariant violated: ${message}`);
  };

  const productSlugs = new Set<string>();
  for (const p of products) {
    if (productSlugs.has(p.slug)) fail(`duplicate product slug "${p.slug}"`);
    productSlugs.add(p.slug);
  }

  const dealSlugs = new Set<string>();
  for (const d of deals) {
    if (dealSlugs.has(d.slug)) fail(`duplicate deal slug "${d.slug}"`);
    dealSlugs.add(d.slug);
  }

  const features = products.filter((p) => p.layout === 'feature');
  if (features.length !== 1) {
    fail(`the Core Menu bento reserves exactly one feature cell, found ${features.length}`);
  }

  if (deals.length !== 5) fail(`the Special Deals grid has five fixed cells, found ${deals.length}`);

  const slots = new Set(deals.map((d) => d.slot));
  if (slots.size !== deals.length) fail('two deals share a grid slot');

  for (const d of deals) {
    if (d.wasPricePesewas !== undefined && d.wasPricePesewas <= d.pricePesewas) {
      fail(`"${d.name}" shows a was-price that is not a reduction`);
    }
  }

  for (const p of products) {
    // No size-selector was designed. Rendering a second size would mean
    // inventing UI, which ADR-006 forbids. The array shape is kept so a future
    // model needs no migration — lifting this needs a design, not a code change.
    if (p.sizes.length !== 1) {
      fail(`"${p.name}" has ${p.sizes.length} sizes but no size-selector exists in the designs`);
    }
    if (!categories.some((c) => c.id === p.categoryId)) {
      fail(`"${p.name}" references unknown category "${p.categoryId}"`);
    }
  }

  // A checkout with no deliverable zone cannot take an order at all.
  if (!zones.some((z) => z.available)) {
    fail('no delivery zone is marked available — checkout would have nowhere to deliver');
  }

  if (categories.length !== 1) {
    fail(
      `the Core Menu is a flat grid with no section headings — a second category has nowhere to render (found ${categories.length})`,
    );
  }
}
