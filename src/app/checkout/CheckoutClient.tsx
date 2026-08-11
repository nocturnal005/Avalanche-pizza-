'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

import { Icon } from '@/components/ui/Icon';
import { availableMomoProviders, CARDS_ENABLED } from '@/content/payment';
import { basketSubtotal, clearBasket, useBasket } from '@/lib/basket/store';
import { formatPesewas } from '@/lib/money';
import type { DeliveryZone } from '@/content/schema';

/**
 * Checkout, from the owner's design: delivery details on the left, a sticky
 * order summary on the right, payment rails beneath the CTA.
 *
 * Payment runs through Flutterwave's HOSTED checkout (ADR-010): we post the
 * order to /api/payments/initiate, the server prices it and returns a payment
 * link, and the customer completes payment on Flutterwave's page. Card details
 * and mobile money PINs are entered there, never here — that is what keeps
 * card acceptance at PCI SAQ-A.
 *
 * The method chosen here only orders Flutterwave's options; the customer can
 * still switch on their page. The mobile money NUMBER is deliberately not
 * collected here — Flutterwave asks for it, and asking twice invites typos.
 *
 * Prices shown are display-only. The server recomputes every amount from its
 * own data and ignores whatever this page sends; docs/SECURITY.md IV-2.
 * Without credentials the endpoint returns a mock link and the flow still
 * runs end to end.
 */

interface Props {
  zones: DeliveryZone[];
}

export function CheckoutClient({ zones }: Props) {
  const router = useRouter();
  const lines = useBasket();
  const subtotal = basketSubtotal(lines);

  const [zoneId, setZoneId] = useState(zones[0]?.id ?? '');
  const [method, setMethod] = useState<'momo' | 'card'>('momo');
  const [phone, setPhone] = useState('');
  const [fullName, setFullName] = useState('');
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

    const digits = phone.replace(/[^\d+]/g, '');
    if (!/^(\+233\d{9}|0\d{9})$/.test(digits)) {
      setError('Enter your phone number as 0XX XXX XXXX.');
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch('/api/payments/initiate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          // Identities and quantities only — the server does the pricing.
          lines: lines.map((l) => ({ kind: l.kind, slug: l.slug, qty: l.qty })),
          zoneId: zone?.id,
          customer: { name: fullName || 'Guest', phone: digits },
          method,
        }),
      });

      const data = (await res.json()) as { paymentLink?: string; error?: string; mode?: string };
      if (!res.ok || !data.paymentLink) {
        setError(data.error ?? 'Could not start the payment. Please try again.');
        setSubmitting(false);
        return;
      }

      // Mock mode stays in-app; live mode hands off to Flutterwave.
      if (data.mode === 'mock') {
        clearBasket();
        router.push(data.paymentLink);
      } else {
        window.location.href = data.paymentLink;
      }
    } catch {
      setError('Network problem. Check your connection and try again.');
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="grid grid-cols-1 gap-gutter lg:grid-cols-12 lg:gap-16">
      {/* Delivery details */}
      <div className="flex flex-col gap-8 lg:col-span-7">
        <section className="flex flex-col gap-6">
          <h2 className="border-b border-surface-variant pb-4 font-label-caps text-label-caps uppercase tracking-[0.2em] text-on-surface-variant">
            Delivery Details
          </h2>

          <div className="flex flex-col gap-2">
            <label
              htmlFor="fullName"
              className="font-label-caps text-label-caps uppercase tracking-[0.1em] text-on-surface-variant"
            >
              Full Name
            </label>
            <input
              id="fullName"
              name="fullName"
              type="text"
              required
              autoComplete="name"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="w-full border border-surface-container-high bg-surface-container-highest px-4 py-3 font-body-md text-body-md text-on-surface placeholder:text-on-surface-variant/40 focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none"
            />
          </div>

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
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
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
            Payment
          </h2>

          <fieldset className="flex flex-col gap-3">
            <legend className="mb-3 font-label-caps text-label-caps uppercase tracking-[0.1em] text-on-surface-variant">
              How would you like to pay?
            </legend>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <MethodCard
                selected={method === 'momo'}
                onSelect={() => setMethod('momo')}
                title="Mobile Money"
                detail="MTN MoMo, Telecel Cash, AT Money"
              />
              {CARDS_ENABLED ? (
                <MethodCard
                  selected={method === 'card'}
                  onSelect={() => setMethod('card')}
                  title="Card"
                  detail="Visa, Mastercard"
                />
              ) : null}
            </div>
          </fieldset>

          <p className="font-body-md text-[13px] leading-relaxed text-on-surface-variant/80">
            {method === 'momo'
              ? 'You will choose your network and approve the payment on your phone at the next step.'
              : 'You will enter your card details securely at the next step. They never touch this site.'}
          </p>

          {error ? (
            <p role="alert" className="font-body-md text-[13px] text-error">
              {error}
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
                Pay {formatPesewas(total)}
                <Icon
                  name="arrow_forward"
                  className="size-4 transition-transform group-hover:translate-x-1"
                />
              </>
            )}
          </button>

          <div className="mt-8 flex flex-wrap justify-center gap-2">
            {[
              ...availableMomoProviders.map((p) => p.name),
              ...(CARDS_ENABLED ? ['Visa', 'Mastercard'] : []),
            ].map((name) => (
              <span
                key={name}
                className="border border-surface-variant bg-surface-container-high px-3 py-1.5 font-label-caps text-[10px] uppercase tracking-wider text-on-surface-variant"
              >
                {name}
              </span>
            ))}
          </div>

          <p className="mt-4 flex items-center justify-center gap-1.5 font-label-caps text-[10px] uppercase tracking-[0.1em] text-on-surface-variant/70">
            Secured by Flutterwave
          </p>

          <p className="mt-3 text-center font-label-caps text-[10px] uppercase tracking-[0.1em] text-secondary">
            Demonstration mode — no real payment is taken
          </p>
        </div>
      </div>
    </form>
  );
}

function MethodCard({
  selected,
  onSelect,
  title,
  detail,
}: {
  selected: boolean;
  onSelect: () => void;
  title: string;
  detail: string;
}) {
  return (
    <label
      className={`flex cursor-pointer flex-col gap-1 border px-4 py-4 transition-colors ${
        selected
          ? 'border-primary bg-primary/10'
          : 'border-surface-container-high bg-surface-container-highest hover:border-outline'
      }`}
    >
      <input
        type="radio"
        name="method"
        checked={selected}
        onChange={onSelect}
        className="sr-only"
      />
      <span
        className={`font-label-caps text-label-caps uppercase tracking-[0.1em] ${
          selected ? 'text-primary' : 'text-on-surface'
        }`}
      >
        {title}
      </span>
      <span className="font-body-md text-[11px] text-on-surface-variant/70">{detail}</span>
    </label>
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
