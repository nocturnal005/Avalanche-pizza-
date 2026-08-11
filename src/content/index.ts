import {
  assertContentInvariants,
  categorySchema,
  dealSchema,
  deliveryZoneSchema,
  productSchema,
  toppingSchema,
  type Category,
  type Deal,
  type DeliveryZone,
  type Product,
  type Topping,
} from './schema';
import { categories as rawCategories, products as rawProducts } from './menu';
import { deals as rawDeals } from './deals';
import { toppings as rawToppings } from './toppings';
import { deliveryZones as rawZones } from './delivery';
import { IMAGE_KEYS, type ImageKey } from './images';

/**
 * Parses and freezes all content at module load — which happens during
 * `next build`. Malformed content cannot deploy; it fails the build.
 */

function parseAll<T>(schema: { parse: (v: unknown) => T }, items: unknown[], label: string): T[] {
  return items.map((item, i) => {
    try {
      return schema.parse(item);
    } catch (error) {
      throw new Error(
        `Invalid ${label} at index ${i}: ${error instanceof Error ? error.message : String(error)}`,
      );
    }
  });
}

export const categories: Category[] = parseAll(categorySchema, rawCategories, 'category');
export const products: Product[] = parseAll(productSchema, rawProducts, 'product');
export const deals: Deal[] = parseAll(dealSchema, rawDeals, 'deal');
export const toppings: Topping[] = parseAll(toppingSchema, rawToppings, 'topping');
export const deliveryZones: DeliveryZone[] = parseAll(deliveryZoneSchema, rawZones, 'delivery zone');

// Every image key must resolve, or a card renders a broken frame.
const validKeys = new Set<string>(IMAGE_KEYS);
for (const item of [...products, ...deals]) {
  if (!validKeys.has(item.image)) {
    throw new Error(`Content references unknown image key "${item.image}" in "${item.name}"`);
  }
}

assertContentInvariants({ products, deals, categories, zones: deliveryZones });

export const availableProducts = products
  .filter((p) => p.available)
  .sort((a, b) => a.order - b.order);

export const availableDeals = deals.filter((d) => d.available);

export const availableToppingNames = toppings.filter((t) => t.available).map((t) => t.name);

/**
 * The only zones a customer may choose. Checkout must read this, never the
 * raw list — an unavailable zone reaching the dropdown means an order the
 * kitchen cannot deliver, already paid for.
 */
export const availableZones = deliveryZones
  .filter((z) => z.available)
  .sort((a, b) => a.order - b.order);

export function zoneById(id: string): DeliveryZone {
  const found = availableZones.find((z) => z.id === id);
  if (!found) throw new Error(`No available delivery zone with id "${id}"`);
  return found;
}

export function productBySlug(slug: string): Product {
  const found = products.find((p) => p.slug === slug);
  if (!found) throw new Error(`No product with slug "${slug}"`);
  return found;
}

export function dealBySlot(slot: Deal['slot']): Deal {
  const found = deals.find((d) => d.slot === slot);
  if (!found) throw new Error(`No deal in slot "${slot}"`);
  return found;
}

/** The single price a product ships with — see the one-size invariant. */
export function priceOf(product: Product): number {
  const size = product.sizes[0];
  if (!size) throw new Error(`Product "${product.name}" has no size`);
  return size.pricePesewas;
}

export function sizeLabelOf(product: Product): string {
  return product.sizes[0]?.label ?? 'Standard';
}

export type { Category, Deal, DeliveryZone, Product, Topping, ImageKey };
