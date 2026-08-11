'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

import { Icon } from '@/components/ui/Icon';
import { availableMomoProviders, CARDS_ENABLED, type MomoProvider } from '@/content/payment';
import { basketSubtotal, clearBasket, useBasket } from '@/lib/basket/store';
import { formatPesewas } from '@/lib/money';
import type { DeliveryZone } from '@/content/schema';

/**
 * Checkout, from the owner's design: delivery details on the left, a sticky
 * order summary on the right, payment rails beneath the CTA.
 *
 * PAYMENTS ARE MOCKED (ADR-009). The provider choice and the phone number are
 * collected exactly as the real flow needs them, then handed to a simulated
 * authorisation instead of Paystack. Swapping in the real gateway replaces
 * `mockPay` with a server action that initialises a Paystack transaction —
 * nothing else on this page changes.
 *
 * Prices here are display-only. When payment becomes real, the server must
 * recompute every amount from the database and ignore whatever the client
 * sends; docs/SECURITY.md IV-2 is the standing rule.
 */

interface Props {
  zones: DeliveryZone[];
}

export function CheckoutClient({ zones }: Props) {
  const router = useRouter();
  const lines = useBasket();
  const subtotal = basketSubtotal(lines);

  const [zoneId, setZoneId] = useState(zones[0]?.id ?? '');
  const [provider, setProvider] = useState<MomoProvider['id']>(
    availableMomoProviders[0]?.id ?? 'mtn',
  );
  const [momoNumber, setMomoNumber] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const zone = zones.find((z) => z.id === zoneId) ?? zones[0];
  const fee = zone?.feePesewas ?? 0;
  const total = subtotal + fee;

  if (lines.length === 0) {
    return (
      <div className="flex flex-col items-start gap-6 border border-surface-variant bg-surface-container p-10">
        <h2 className="font-headline-lg text-headline-lg-mobile uppercase tracking-[0.1em] text-on-surface">
          Nothing to check out
        </h2>
        <p className="max-w-md font-body-md text-body-md text-on-surface-variant">
          Your basket is empty. Add something from the menu first.
        </p>
        <Link
          href="/menu"
          className="shine border border-primary px-8 py-4 font-label-caps text-label-caps uppercase tracking-[0.2em] text-primary transition-colors hover:bg-primary hover:text-on-primary"
        >
          View Menu
        </Link>
      </div>
    );
  }

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);

    // Ghanaian mobile numbers: 0XXXXXXXXX or +233XXXXXXXXX.
    const digits = momoNumber.replace(/[^\d+]/g, '');
    if (!/^(\+233\d{9}|0\d{9})$/.test(digits)) {
      setError('Enter the mobile money number as 0XX XXX XXXX.');
      return;
    }

    setSubmitting(true);
    // Stand-in for the Paystack round trip. Deliberately a visible pause so
    // the flow feels like the real thing during review.
    await new Promise((r) => setTimeout(r, 1400));

    const reference = `AV-${Math.random().toString(36).slice(2, 7).toUpperCase()}`;
    clearBasket();
    router.push(`/order/confirmed?ref=${reference}`);
  }

  return (
    <form onSubmit={onSubmit} className="grid grid-cols-1 gap-gutter lg:grid-cols-12 lg:gap-16">
      {/* Delivery details */}
      <div className="flex flex-col gap-8 lg:col-span-7">
        <section className="flex flex-col gap-6">
          <h2 className="border-b border-surface-variant pb-4 font-label-caps text-label-caps uppercase tracking-[0.2em] text-on-surface-variant">
            Delivery Details
          </h2>

          <Field label="Full Name" name="fullName" required autoComplete="name" />

          <div className="flex flex-col gap-2">
            <label
              htmlFor="phone"
              className="font-label-caps text-label-caps uppercase tracking-[0.1em] text-on-surface-variant"
            >
              Phone Number
            </label>
            <div className="flex">
              <span className="flex items-center border border-r-0 border-surface-container-high bg-surface-container-highest px-4 font-label-caps text-label-caps text-on-surface-variant">
                +233
              </span>
              <input
                id="phone"
                name="phone"
                type="tel"
                required
                autoComplete="tel-national"
                placeholder="24 000 0000"
                className="w-full border border-surface-container-high bg-surface-container-highest px-4 py-3 font-body-md text-body-md text-on-surface placeholder:text-on-surface-variant/40 focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none"
              />
            </div>
          </div>

          {/* One zone today; the select is kept so added zones need no redesign. */}
          <div className="flex flex-col gap-2">
            <label
              htmlFor="zone"
              className="font-label-caps text-label-caps uppercase tracking-[0.1em] text-on-surface-variant"
            >
              Delivery Zone
            </label>
            {zones.length > 1 ? (
              <select
                id="zone"
                value={zoneId}
                onChange={(e) => setZoneId(e.target.value)}
                className="w-full appearance-none border border-surface-container-high bg-surface-container-highest px-4 py-3 font-body-md text-body-md text-on-surface focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none"
              >
                {zones.map((z) => (
                  <option key={z.id} value={z.id}>
                    {z.name} — {formatPesewas(z.feePesewas)} delivery
                  </option>
                ))}
              </select>
            ) : (
              <p className="border border-surface-container-high bg-surface-container-highest px-4 py-3 font-body-md text-body-md text-on-surface">
                {zone?.name} — {formatPesewas(fee)} delivery
                <span className="mt-1 block font-label-caps text-[10px] uppercase tracking-[0.1em] text-on-surface-variant/70">
                  We currently deliver in Bechem only
                </span>
              </p>
            )}
          </div>

          <Field label="Area / Suburb" name="area" required />
          <Field label="Delivery Address" name="address" required />
          <Field label="Nearby Landmark" name="landmark" />
          <Field label="Order Notes" name="notes" textarea />
        </section>

        {/* Payment */}
        <section className="flex flex-col gap-6">
          <h2 className="border-b border-surface-variant pb-4 font-label-caps text-label-caps uppercase tracking-[0.2em] text-on-surface-variant">
            Mobile Money Payment
          </h2>

          <fieldset className="flex flex-col gap-3">
            <legend className="mb-2 font-label-caps text-label-caps uppercase tracking-[0.1em] text-on-surface-variant">
              Choose your provider
            </legend>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
              {availableMomoProviders.map((p) => {
                const selected = provider === p.id;
                return (
                  <label
                    key={p.id}
                    className={`flex cursor-pointer flex-col gap-1 border px-4 py-4 transition-colors ${
                      selected
                        ? 'border-primary bg-primary/10'
                        : 'border-surface-container-high bg-surface-container-highest hover:border-outline'
                    }`}
                  >
                    <input
                      type="radio"
                      name="provider"
                      value={p.id}
                      checked={selected}
                      onChange={() => setProvider(p.id)}
                      className="sr-only"
                    />
                    <span
                      className={`font-label-caps text-label-caps uppercase tracking-[0.1em] ${
                        selected ? 'text-primary' : 'text-on-surface'
                      }`}
                    >
                      {p.name}
                    </span>
                    {p.note ? (
                      <span className="font-body-md text-[11px] text-on-surface-variant/70">
                        {p.note}
                      </span>
                    ) : null}
                  </label>
                );
              })}
            </div>
          </fieldset>

          <div className="flex flex-col gap-2">
            <label
              htmlFor="momo"
              className="font-label-caps text-label-caps uppercase tracking-[0.1em] text-on-surface-variant"
            >
              Mobile Money Number
            </label>
            <input
              id="momo"
              name="momo"
              type="tel"
              inputMode="tel"
              required
              value={momoNumber}
              onChange={(e) => setMomoNumber(e.target.value)}
              placeholder="0XX XXX XXXX"
              className="w-full border border-surface-container-high bg-surface-container-highest px-4 py-3 font-body-md text-body-md text-on-surface placeholder:text-on-surface-variant/40 focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none"
            />
            <p className="font-body-md text-[12px] text-on-surface-variant/70">
              You will get a prompt on this number to approve the payment.
            </p>
            {error ? (
              <p role="alert" className="font-body-md text-[13px] text-error">
                {error}
              </p>
            ) : null}
          </div>

          {!CARDS_ENABLED ? (
            <p className="font-label-caps text-[10px] uppercase tracking-[0.1em] text-on-surface-variant/60">
              Card payments coming soon
            </p>
          ) : null}
        </section>
      </div>

      {/* Summary */}
      <div className="lg:col-span-5">
        <div className="sticky top-32 border border-surface-variant bg-surface-container p-8">
          <h2 className="mb-8 border-b border-surface-variant pb-4 font-label-caps text-label-caps uppercase tracking-[0.2em] text-on-surface-variant">
            Your Order
          </h2>

          <ul className="mb-8 space-y-6">
            {lines.map((l) => (
              <li key={l.id} className="flex items-start justify-between gap-4">
                <div className="flex gap-4">
                  <span className="mt-1 font-label-caps text-label-caps tabular text-on-surface-variant">
                    {l.qty}x
                  </span>
                  <div>
                    <p className="font-body-md text-body-md uppercase tracking-wide text-on-surface">
                      {l.name}
                    </p>
                    {l.sizeLabel ? (
                      <p className="mt-1 font-label-caps text-[10px] uppercase tracking-[0.1em] text-on-surface-variant/70">
                        {l.sizeLabel}
                      </p>
                    ) : null}
                  </div>
                </div>
                <span className="font-label-caps text-label-caps tabular whitespace-nowrap text-on-surface">
                  {formatPesewas(l.unitPesewas * l.qty)}
                </span>
              </li>
            ))}
          </ul>

          <div className="space-y-4 border-t border-surface-variant pt-6">
            <div className="flex items-center justify-between text-on-surface-variant">
              <span className="font-body-md text-body-md">Subtotal</span>
              <span className="font-label-caps text-label-caps tabular">
                {formatPesewas(subtotal)}
              </span>
            </div>
            <div className="flex items-center justify-between text-on-surface-variant">
              <span className="font-body-md text-body-md">Delivery Fee ({zone?.name})</span>
              <span className="font-label-caps text-label-caps tabular">{formatPesewas(fee)}</span>
            </div>
          </div>

          <div className="mt-6 flex items-end justify-between border-t border-surface-variant pt-6">
            <span className="font-label-caps text-label-caps uppercase tracking-[0.2em] text-on-surface">
              Total
            </span>
            <span className="font-headline-lg text-[26px] tabular tracking-[0.05em] text-secondary-container">
              {formatPesewas(total)}
            </span>
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="shine group mt-10 flex w-full items-center justify-center gap-2 bg-primary-container py-5 font-label-caps text-label-caps uppercase tracking-[0.2em] text-white transition-all duration-300 hover:bg-primary hover:text-on-primary disabled:cursor-not-allowed disabled:opacity-70"
          >
            {submitting ? (
              'Awaiting approval…'
            ) : (
              <>
                Pay {formatPesewas(total)} with Mobile Money
                <Icon
                  name="arrow_forward"
                  className="size-4 transition-transform group-hover:translate-x-1"
                />
              </>
            )}
          </button>

          <div className="mt-8 flex flex-wrap justify-center gap-2">
            {availableMomoProviders.map((p) => (
              <span
                key={p.id}
                className="border border-surface-variant bg-surface-container-high px-3 py-1.5 font-label-caps text-[10px] uppercase tracking-wider text-on-surface-variant"
              >
                {p.name}
              </span>
            ))}
          </div>

          <p className="mt-6 text-center font-label-caps text-[10px] uppercase tracking-[0.1em] text-secondary">
            Demonstration mode — no real payment is taken
          </p>
        </div>
      </div>
    </form>
  );
}

function Field({
  label,
  name,
  required,
  textarea,
  autoComplete,
}: {
  label: string;
  name: string;
  required?: boolean;
  textarea?: boolean;
  autoComplete?: string;
}) {
  const cls =
    'w-full border border-surface-container-high bg-surface-container-highest px-4 py-3 font-body-md text-body-md text-on-surface placeholder:text-on-surface-variant/40 focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none';
  return (
    <div className="flex flex-col gap-2">
      <label
        htmlFor={name}
        className="font-label-caps text-label-caps uppercase tracking-[0.1em] text-on-surface-variant"
      >
        {label}
        {required ? '' : ' (optional)'}
      </label>
      {textarea ? (
        <textarea id={name} name={name} rows={3} className={cls} />
      ) : (
        <input id={name} name={name} type="text" required={required} autoComplete={autoComplete} className={cls} />
      )}
    </div>
  );
}
