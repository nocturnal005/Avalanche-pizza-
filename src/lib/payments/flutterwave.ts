import 'server-only';

import crypto from 'node:crypto';

/**
 * Flutterwave integration (ADR-010).
 *
 * ─────────────────────────────────────────────────────────────────────────────
 *  UNITS — the most dangerous detail in this file.
 *
 *  We store money as INTEGER PESEWAS. Flutterwave v3 expects `amount` in
 *  MAJOR units — cedis, decimal. This is the opposite of Paystack, which took
 *  minor units. Sending 9800 where GH₵ 98.00 was meant charges the customer
 *  GH₵ 9,800. Every conversion goes through the two helpers below and nowhere
 *  else.
 * ─────────────────────────────────────────────────────────────────────────────
 *
 * We use Flutterwave STANDARD (hosted checkout at /v3/payments), not the
 * direct charge endpoint. The customer completes payment on Flutterwave's own
 * page, so card PANs never reach our servers or our JavaScript — that is what
 * keeps PCI scope at SAQ-A now that cards are enabled. Never replace this with
 * a card form of our own.
 */

const API = 'https://api.flutterwave.com/v3';

/** Integer pesewas -> the decimal cedi amount Flutterwave expects. */
export function pesewasToCedis(pesewas: number): number {
  if (!Number.isInteger(pesewas) || pesewas < 0) {
    throw new TypeError(`pesewasToCedis expects non-negative integer pesewas, got ${pesewas}`);
  }
  return Number((pesewas / 100).toFixed(2));
}

/** Flutterwave's decimal cedis -> integer pesewas, for exact comparison. */
export function cedisToPesewas(cedis: number): number {
  if (typeof cedis !== 'number' || !Number.isFinite(cedis) || cedis < 0) {
    throw new TypeError(`cedisToPesewas expects a non-negative number, got ${cedis}`);
  }
  return Math.round(cedis * 100);
}

/** True when real credentials exist. Without them the app runs mocked. */
export function isLive(): boolean {
  return Boolean(process.env.FLUTTERWAVE_SECRET_KEY);
}

function secretKey(): string {
  const key = process.env.FLUTTERWAVE_SECRET_KEY;
  if (!key) throw new Error('FLUTTERWAVE_SECRET_KEY is not set');
  return key;
}

/**
 * Payment methods offered on the hosted page. Ghana mobile money and cards
 * (ADR-010 enabled cards). Order matters — it is the order Flutterwave shows.
 */
export type PaymentOption = 'mobilemoneyghana' | 'card';

export interface InitiateInput {
  /** Our own reference. Must be unique per attempt. */
  txRef: string;
  amountPesewas: number;
  customer: { email: string; name: string; phone: string };
  /** Where Flutterwave returns the customer after payment. */
  redirectUrl: string;
  options: PaymentOption[];
  /** Echoed back on verify/webhook — our order id lives here. */
  meta?: Record<string, string>;
}

export interface InitiateResult {
  /** Hosted checkout URL to send the customer to. */
  paymentLink: string;
}

export async function initiatePayment(input: InitiateInput): Promise<InitiateResult> {
  const body = {
    tx_ref: input.txRef,
    // MAJOR units. See the units note at the top of this file.
    amount: pesewasToCedis(input.amountPesewas),
    currency: 'GHS',
    redirect_url: input.redirectUrl,
    payment_options: input.options.join(','),
    customer: {
      email: input.customer.email,
      name: input.customer.name,
      phonenumber: input.customer.phone,
    },
    customizations: {
      title: 'Avalanche Pizza',
      description: 'Premium tasty pizza in the heart of Bechem',
    },
    meta: input.meta ?? {},
  };

  const res = await fetch(`${API}/payments`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${secretKey()}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
    cache: 'no-store',
  });

  const json = (await res.json()) as {
    status?: string;
    message?: string;
    data?: { link?: string };
  };

  if (!res.ok || json.status !== 'success' || !json.data?.link) {
    throw new Error(`Flutterwave initiate failed: ${json.message ?? res.status}`);
  }
  return { paymentLink: json.data.link };
}

export interface VerifiedTransaction {
  id: number;
  txRef: string;
  status: string;
  amountPesewas: number;
  currency: string;
}

/**
 * Server-side verification. The ONLY thing that may mark an order paid is a
 * verified transaction whose amount and currency match what we asked for —
 * never the browser's return from the redirect, which the customer controls.
 */
export async function verifyTransaction(transactionId: string | number): Promise<VerifiedTransaction> {
  const res = await fetch(`${API}/transactions/${transactionId}/verify`, {
    headers: { Authorization: `Bearer ${secretKey()}` },
    cache: 'no-store',
  });

  const json = (await res.json()) as {
    status?: string;
    message?: string;
    data?: { id: number; tx_ref: string; status: string; amount: number; currency: string };
  };

  if (!res.ok || json.status !== 'success' || !json.data) {
    throw new Error(`Flutterwave verify failed: ${json.message ?? res.status}`);
  }

  return {
    id: json.data.id,
    txRef: json.data.tx_ref,
    status: json.data.status,
    amountPesewas: cedisToPesewas(json.data.amount),
    currency: json.data.currency,
  };
}

/**
 * Decides whether a verified transaction may fulfil an order.
 *
 * Checks the amount and currency against what WE computed, not what the
 * client claimed — the classic attack is paying GH₵ 1 for a GH₵ 98 order.
 */
export function isFulfillable(
  tx: VerifiedTransaction,
  expected: { txRef: string; amountPesewas: number },
): boolean {
  return (
    tx.status === 'successful' &&
    tx.currency === 'GHS' &&
    tx.txRef === expected.txRef &&
    tx.amountPesewas === expected.amountPesewas
  );
}

/**
 * Webhook authenticity.
 *
 * Flutterwave signs with HMAC-SHA256 over the RAW request body using the
 * secret hash set in the dashboard, base64-encoded, in `flutterwave-signature`.
 * The body must be read as raw text BEFORE any JSON parsing — re-serialised
 * JSON has different bytes and will never match.
 *
 * Older integrations used a `verif-hash` header holding the secret in plain
 * text. That is a bearer secret, not a signature: it cannot detect a tampered
 * payload. We do not accept it.
 */
export const SIGNATURE_HEADER = 'flutterwave-signature';

export function verifyWebhookSignature(rawBody: string, signature: string | null): boolean {
  const secretHash = process.env.FLUTTERWAVE_SECRET_HASH;
  if (!secretHash || !signature) return false;

  const expected = crypto.createHmac('sha256', secretHash).update(rawBody).digest('base64');

  const a = Buffer.from(expected);
  const b = Buffer.from(signature);
  // Length check first: timingSafeEqual throws on a length mismatch.
  return a.length === b.length && crypto.timingSafeEqual(a, b);
}
