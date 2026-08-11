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
 * control. docs/SECURITY.md IV-2.
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
    method: z.enum(['momo', 'card']),
  })
  .strict();

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
      meta: { txRef },
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
