import { SHOP } from '@/config/shop';
import { formatPesewas } from '@/lib/money';
import { toWhatsAppDigits } from '@/lib/phone';

/**
 * Every order on this site is a link built here. There is no other path from a
 * product to an action, and CI asserts that no component builds one itself.
 *
 * Two rules govern the message templates:
 *   1. Pure ASCII. These strings are URL-encoded into a wa.me link; the cedi
 *      sign, em dashes and curly quotes are multi-byte and render badly or
 *      inconsistently on older Android WhatsApp builds.
 *   2. Anything the customer must fill in goes LAST, because WhatsApp puts the
 *      caret at the end of the prefilled text. A message that stops mid-thought
 *      is a message they finish in one tap.
 */

const WA_BASE = 'https://wa.me/';

/** Browsers cap URLs near 2000 chars and some clients truncate the prefill. */
const MAX_URL_LENGTH = 1800;

const GREETING = 'Hello Avalanche Pizza!';
const CONFIRM_LINE = 'Please confirm the price and delivery to my location.';

/**
 * Builds the wa.me link.
 *
 * encodeURIComponent — never encodeURI, never URLSearchParams. URLSearchParams
 * encodes spaces as '+', which WhatsApp renders literally ("I+would+like"), and
 * encodeURI leaves '&', '?' and '#' intact, which truncates the message at the
 * first ampersand in a product name.
 */
export function buildWhatsAppUrl(message: string, e164: string = SHOP.whatsappE164): string {
  const url = `${WA_BASE}${toWhatsAppDigits(e164)}?text=${encodeURIComponent(message)}`;

  if (url.length > MAX_URL_LENGTH) {
    throw new Error(
      `WhatsApp URL is ${url.length} characters, over the ${MAX_URL_LENGTH} limit. Shorten the message.`,
    );
  }
  return url;
}

/** tel: keeps the '+' — the opposite of wa.me. */
export function buildTelUrl(e164: string = SHOP.whatsappE164): string {
  return `tel:${e164}`;
}

function withRef(lines: string[], ref: string): string {
  const body = lines.join('\n');
  return SHOP.includeRefTag ? `${body}\n\nRef: ${ref}` : body;
}

export interface ItemMessageInput {
  name: string;
  pricePesewas: number;
  /** Omitted from the message when the label is "Standard" — the designs show no size picker. */
  sizeLabel?: string;
  quantity?: number;
  /** Renders the open "my N toppings are:" field, e.g. Free Choice. */
  chooseToppings?: number;
  availableToppings?: readonly string[];
  ref: string;
}

/** A single menu item, optionally with an open toppings field. */
export function buildItemMessage(input: ItemMessageInput): string {
  const qty = input.quantity ?? 1;
  const size =
    input.sizeLabel && input.sizeLabel.toLowerCase() !== 'standard' ? ` (${input.sizeLabel})` : '';

  const lines = [
    GREETING,
    '',
    'I would like to order:',
    `${qty} x ${input.name}${size} - ${formatPesewas(input.pricePesewas)}`,
    '',
    CONFIRM_LINE,
  ];

  if (input.chooseToppings && input.availableToppings?.length) {
    lines.push(
      '',
      `Toppings available: ${input.availableToppings.join(', ')}`,
      `My ${input.chooseToppings} toppings are:`,
    );
    // The open field must be last, so no Ref tag follows it.
    return lines.join('\n');
  }

  return withRef(lines, input.ref);
}

export interface DealMessageInput {
  name: string;
  pricePesewas: number;
  includes?: readonly string[];
  ref: string;
}

/** A deal — reads back exactly what the customer was shown. */
export function buildDealMessage(input: DealMessageInput): string {
  const lines = [
    GREETING,
    '',
    `I would like the ${input.name} deal - ${formatPesewas(input.pricePesewas)}.`,
  ];

  if (input.includes?.length) {
    lines.push(`Includes: ${input.includes.join(', ')}`);
  }

  lines.push('', CONFIRM_LINE);
  return withRef(lines, input.ref);
}

/** The page-level "Order Now" CTAs, where no specific item is chosen yet. */
export function buildGeneralMessage(ref: string): string {
  return withRef(
    [GREETING, '', 'I would like to place an order. Please can you help me choose?'],
    ref,
  );
}
