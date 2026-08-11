import { NextResponse } from 'next/server';

import {
  SIGNATURE_HEADER,
  cedisToPesewas,
  verifyWebhookSignature,
} from '@/lib/payments/flutterwave';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * Flutterwave webhook — the authority on whether an order is paid.
 *
 * The browser's return from the redirect proves nothing: the customer
 * controls it and can craft any URL they like. Only a signature-verified
 * webhook (cross-checked against the verify API) may mark an order paid.
 *
 * Order of operations matters and is not negotiable:
 *   1. read the RAW body — re-serialised JSON breaks the HMAC;
 *   2. verify the signature before parsing or trusting anything;
 *   3. re-check amount and currency against OUR figure for that reference;
 *   4. record the event id first so redelivery is idempotent;
 *   5. answer 200 quickly — Flutterwave retries anything else for days.
 *
 * NOT YET COMPLETE: steps 3–4 need the orders table, which arrives with the
 * database (ADR-009). Until then this endpoint authenticates and logs the
 * event without fulfilling anything, which is the safe half to ship first —
 * it can never wrongly mark an order paid because it marks nothing at all.
 */
export async function POST(request: Request) {
  // 1 — raw body, before any parsing.
  const rawBody = await request.text();

  // 2 — authenticate.
  const signature = request.headers.get(SIGNATURE_HEADER);
  if (!verifyWebhookSignature(rawBody, signature)) {
    return new NextResponse('invalid signature', { status: 401 });
  }

  let event: {
    event?: string;
    data?: { id?: number; tx_ref?: string; status?: string; amount?: number; currency?: string };
  };
  try {
    event = JSON.parse(rawBody);
  } catch {
    return new NextResponse('unparseable body', { status: 400 });
  }

  const data = event.data ?? {};
  const summary = {
    event: event.event,
    txRef: data.tx_ref,
    transactionId: data.id,
    status: data.status,
    amountPesewas: typeof data.amount === 'number' ? cedisToPesewas(data.amount) : undefined,
    currency: data.currency,
  };

  // TODO(orders-table): look up the order by tx_ref, re-verify via the
  // verify API, confirm amount + currency, then transition pending -> paid
  // exactly once, keyed on the transaction id.
  console.info('[flutterwave] authenticated webhook', summary);

  // 5 — always acknowledge once authenticated.
  return NextResponse.json({ received: true });
}
