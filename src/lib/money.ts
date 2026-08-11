/**
 * Money is always an integer number of pesewas. 1 GHS = 100 pesewas.
 * Never a float, never a string, never a decimal in the content files.
 */

/**
 * Formats pesewas as the exact string the designs print: "Ghc 28", "Ghc 28.50",
 * "Ghc 1,200".
 *
 * `Ghc` — not `GH₵`, not `GHS` — because that is what the Core Menu and Special
 * Deals designs print, and because it is pure ASCII, which matters when the same
 * string is URL-encoded into a WhatsApp message. The cedi sign is three bytes and
 * renders as a box on older Android font stacks.
 *
 * `GHS` is used only in structured data, where a machine is reading.
 */
export function formatPesewas(pesewas: number): string {
  if (!Number.isInteger(pesewas) || pesewas < 0) {
    throw new TypeError(
      `formatPesewas expects a non-negative integer of pesewas, received: ${pesewas}`,
    );
  }

  const hasFraction = pesewas % 100 !== 0;
  const amount = new Intl.NumberFormat('en-GH', {
    minimumFractionDigits: hasFraction ? 2 : 0,
    maximumFractionDigits: hasFraction ? 2 : 0,
  }).format(pesewas / 100);

  return `Ghc ${amount}`;
}

/** Decimal cedis for schema.org `price`, which wants a machine-readable number. */
export function pesewasToDecimalString(pesewas: number): string {
  if (!Number.isInteger(pesewas) || pesewas < 0) {
    throw new TypeError(`pesewasToDecimalString expects non-negative integer pesewas: ${pesewas}`);
  }
  return (pesewas / 100).toFixed(2);
}
