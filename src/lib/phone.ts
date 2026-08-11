/**
 * Ghanaian phone number handling.
 *
 * Ghana's national significant number is nine digits behind a trunk '0', so a
 * local 0244400000 (ten digits) is +233244400000 (twelve digits) in E.164 and
 * 233244400000 on wa.me. Leaving the trunk zero in place produces a
 * valid-looking link that reaches nobody — which is the whole reason this
 * module exists rather than inline string surgery at each call site.
 */

/** '024 440 0000' | '0244400000' | '233244400000' | '+233244400000' -> '+233244400000' */
export function toE164Ghana(input: string): string {
  const s = input.replace(/[^\d+]/g, '');

  if (/^\+233\d{9}$/.test(s)) return s;
  if (/^233\d{9}$/.test(s)) return `+${s}`;
  if (/^0\d{9}$/.test(s)) return `+233${s.slice(1)}`;

  throw new Error(`Not a valid Ghanaian mobile number: ${input}`);
}

/**
 * wa.me wants bare digits: no '+', no spaces, no dashes, no leading zero.
 * `tel:` wants the opposite — the full E.164 including the '+'. Getting these
 * backwards is the classic bug, so they are separate functions with separate tests.
 */
export function toWhatsAppDigits(e164: string): string {
  if (!/^\+\d{6,15}$/.test(e164)) {
    throw new Error(`toWhatsAppDigits expects E.164 with a leading '+': ${e164}`);
  }
  return e164.slice(1);
}

/** '+233244400000' -> '024 440 0000' — how a Ghanaian reads their own number. */
export function toLocalDisplay(e164: string): string {
  const digits = toWhatsAppDigits(e164);
  if (!digits.startsWith('233') || digits.length !== 12) {
    throw new Error(`toLocalDisplay expects a Ghanaian E.164 number: ${e164}`);
  }
  const national = `0${digits.slice(3)}`;
  return `${national.slice(0, 3)} ${national.slice(3, 6)} ${national.slice(6)}`;
}
