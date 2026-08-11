import type { Topping } from './schema';

/**
 * Toppings offered for the "Free Choice" pizza ("Choose any 4 toppings from our
 * premium selection").
 *
 * OWNER: this list is DERIVED from the ingredients named across your own menu
 * descriptions — it is not the shop's confirmed topping board. Please confirm
 * or correct it before launch. These names are sent verbatim in the WhatsApp
 * message, so keep them plain ASCII (no accents) and short.
 */
export const toppings: Topping[] = [
  { id: 'pepperoni', name: 'Pepperoni', available: true },
  { id: 'beef', name: 'Spicy Beef', available: true },
  { id: 'chicken', name: 'Chicken', available: true },
  { id: 'ham', name: 'Ham', available: true },
  { id: 'mushroom', name: 'Mushroom', available: true },
  { id: 'red-onion', name: 'Red Onion', available: true },
  { id: 'bell-pepper', name: 'Bell Pepper', available: true },
  { id: 'green-pepper', name: 'Green Pepper', available: true },
  { id: 'jalapeno', name: 'Jalapeno', available: true },
  { id: 'sweetcorn', name: 'Sweetcorn', available: true },
  { id: 'pineapple', name: 'Pineapple', available: true },
  { id: 'olives', name: 'Olives', available: true },
  { id: 'cherry-tomato', name: 'Cherry Tomato', available: true },
  { id: 'extra-cheese', name: 'Extra Cheese', available: true },
];
