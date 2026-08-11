import { NextResponse } from 'next/server';
import { z } from 'zod';

import { availableZones, productBySlug, dealBySlot, priceOf, deals } from '@/content';
import { initiatePayment, isLive, type PaymentOption } from '@/lib/payments/flutterwave';
import { siteUrl } from '@/lib/site';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * Starts a payment.
 *
 * THE SERVER PRICES THE ORDER. The request carries only identities and
 * quantities — never prices. Anything the browser says about money is a
 * display hint we ignore, because the browser is under the customer's
 * control. docs/SECURITY.md C11.1.
 *
 * Without credentials this returns a mock link so the flow stays clickable
 * during review; with them it returns a real Flutterwave hosted checkout.
 */

const bodySchema = z
  .object({
    lines: z
      .array(
        z
          .object({
            kind: z.enum(['product', 'deal']),
            slug: z.string().min(1).max(60),
            qty: z.number().int().min(1).max(15),
          })
          .strict(),
      )
      .min(1)
      .max(25),
    zoneId: z.string().min(1).max(60),
    customer: z
      .object({
        name: z.string().min(2).max(80),
        phone: z.string().regex(/^(\+233\d{9}|0\d{9})$/, 'invalid Ghanaian number'),
        email: z.string().email().optional(),
      })
      .strict(),
    // Where the rider goes. Collected by the design's form, so it must not be
    // dropped on the floor — see the note above `deliveryNote`.
    delivery: z
      .object({
        area: z.string().min(2).max(80),
        address: z.string().min(2).max(160),
        landmark: z.string().max(120).optional(),
        notes: z.string().max(300).optional(),
      })
      .strict(),
    method: z.enum(['momo', 'card']),
  })
  .strict();

/**
 * Flattens the delivery details into the one place a paid order can currently
 * be read: the transaction's metadata in the Flutterwave dashboard.
 *
 * This is a stopgap and is marked as one. There is no orders table yet
 * (ADR-009), no admin board, and no email — so without this, a live order
 * would arrive with a name, a phone number and nowhere to deliver it. It is
 * replaced by the orders table, not extended: metadata is a reasonable place
 * to *read* an address once, and a bad place to keep one.
 *
 * Values are truncated because Flutterwave's meta fields are not a database
 * and a 300-character note should not be able to fail a payment.
 */
function deliveryNote(d: z.infer<typeof bodySchema>['delivery'], zoneName: string) {
  const cut = (s: string, n: number) => (s.length > n ? `${s.slice(0, n - 1)}…` : s);
  return {
    zone: zoneName,
    area: cut(d.area, 80),
    address: cut(d.address, 160),
    ...(d.landmark ? { landmark: cut(d.landmark, 120) } : {}),
    ...(d.notes ? { notes: cut(d.notes, 200) } : {}),
  };
}

export async function POST(request: Request) {
  let parsed;
  try {
    parsed = bodySchema.parse(await request.json());
  } catch {
    return NextResponse.json({ error: 'Invalid request' }, { status: 422 });
  }

  // ---- Price it, from our own data ------------------------------------
  let subtotal = 0;
  for (const line of parsed.lines) {
    if (line.kind === 'product') {
      const product = productBySlug(line.slug);
      if (!product.available) {
        return NextResponse.json({ error: `${product.name} is unavailable` }, { status: 409 });
      }
      subtotal += priceOf(product) * line.qty;
    } else {
      const deal = deals.find((d) => d.slug === line.slug);
      if (!deal || !deal.available) {
        return NextResponse.json({ error: 'That deal is unavailable' }, { status: 409 });
      }
      subtotal += deal.pricePesewas * line.qty;
    }
  }

  const zone = availableZones.find((z) => z.id === parsed.zoneId);
  if (!zone) {
    return NextResponse.json({ error: 'We do not deliver to that area' }, { status: 409 });
  }

  const totalPesewas = subtotal + zone.feePesewas;
  const txRef = `AV-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).slice(2, 6).toUpperCase()}`;

  // ---- Mock mode: no credentials yet ----------------------------------
  if (!isLive()) {
    // Logged, not stored: it is the only record a demonstration order leaves,
    // and it lets the flow be reviewed end to end before an account exists.
    console.info('[mock-order]', {
      txRef,
      totalPesewas,
      method: parsed.method,
      customer: parsed.customer.name,
      ...deliveryNote(parsed.delivery, zone.name),
    });
    return NextResponse.json({
      mode: 'mock',
      txRef,
      totalPesewas,
      paymentLink: `/order/confirmed?ref=${txRef}&mock=1`,
    });
  }

  // ---- Live ------------------------------------------------------------
  const options: PaymentOption[] =
    parsed.method === 'card' ? ['card', 'mobilemoneyghana'] : ['mobilemoneyghana', 'card'];

  try {
    const { paymentLink } = await initiatePayment({
      txRef,
      amountPesewas: totalPesewas,
      customer: {
        name: parsed.customer.name,
        phone: parsed.customer.phone,
        // Flutterwave requires an email; guests rarely give one.
        email: parsed.customer.email ?? `orders+${txRef}@avalanchepizza.invalid`,
      },
      redirectUrl: `${siteUrl()}/order/confirmed`,
      options,
      meta: { txRef, ...deliveryNote(parsed.delivery, zone.name) },
    });

    return NextResponse.json({ mode: 'live', txRef, totalPesewas, paymentLink });
  } catch {
    // Never leak gateway internals to the browser.
    return NextResponse.json(
      { error: 'Could not start the payment. Please try again.' },
      { status: 502 },
    );
  }
}
