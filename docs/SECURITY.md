# Avalanche Pizza — Security & Compliance Foundation

| | |
|---|---|
| **Status** | Draft v1.0 for owner approval (Stage 1 gate); enforced from first commit once approved |
| **Scope** | Avalanche Pizza web platform: Next.js App Router (TypeScript) on Vercel (functions pinned `lhr1`), Supabase (Postgres + Auth + RLS + Storage, AWS `eu-west-2` London), Paystack (cards + MTN MoMo / Telecel Cash / AT Money via hosted checkout), UK hosting, customers in Bechem & environs (Ghana), currency GHS |
| **Location** | `docs/SECURITY.md` — referenced by the launch gate (§4); PRs that touch auth, payments, schema, or headers must state which control IDs they affect |
| **Open question** | Corporate structure (UK entity, Ghana entity, or both) to be confirmed by the owner. §3 is written so one control set satisfies both UK GDPR and Ghana's Act 843 in any of those configurations. |
| **Non-scope** | Physical store security, rider/driver ops, corporate IT |

Design invariants this document enforces everywhere:

1. **The database is the perimeter.** Every table has RLS enabled and deny-by-default; the anon key is public *because* RLS is the gate.
2. **Money is computed once, server-side, in integer pesewas, from DB prices.** No client-supplied amount is ever trusted, including Paystack's redirect back to us.
3. **Identifiers are not capabilities.** Knowing an order ID grants nothing; access requires a session or a signed, expiring, single-order token.
4. **Secrets never enter the client bundle**, mechanically prevented (env naming + `server-only` + lint + post-build scan), not by convention.
5. **Ghana's network reality shapes anti-abuse**: carrier CGNAT means IP is a weak identity signal — compound keys and progressive challenges, never hard IP bans.

> Schema/code snippets in this document illustrate the control patterns; authoritative table and column definitions live in [ARCHITECTURE.md](ARCHITECTURE.md) §3. Where the two disagree on a name, ARCHITECTURE.md wins.

---

## 1. Threat model

### 1.1 Assets

| Asset | Where it lives | Sensitivity |
|---|---|---|
| Customer PII: names, phones (+233 MSISDNs), delivery addresses/landmarks | `orders`, `profiles`, `addresses` tables (Supabase London) | High — direct harm if leaked (harassment, targeted fraud in a market where phone number ≈ identity and MoMo wallet) |
| Order history & contents | `orders`, `order_items` | Medium — behavioral profile per person |
| Payment references, transaction metadata (amount, channel, MoMo network, card last4/bin) | `payments`, `payment_events` | High — enables refund fraud/social engineering; **no PAN/CVV ever** (Paystack-hosted) |
| Admin credentials & sessions | Supabase Auth (`auth.users`) + `sb-*` cookies | Critical — order manipulation, PII export |
| Supabase **service-role key** | Vercel env (server-only) | Critical — bypasses RLS entirely; full DB read/write |
| **Paystack secret key** | Vercel env (server-only) | Critical — can initiate/verify transactions, issue refunds; also the webhook HMAC key, so leak = forgeable "paid" events |
| Guest order-token signing secret (`ORDER_TOKEN_SECRET`) | Vercel env | High — forge tokens → read any order's PII |
| Supabase anon/publishable key, Turnstile site key | Client bundle (by design) | Public — safe **only while** RLS/deny-by-default holds |
| Source repo, CI config, deploy tokens | GitHub + Vercel Git integration | Critical — path to all of the above |
| Availability of ordering during peak (Friday/Saturday evenings, Ghana time) | Vercel + Supabase + Paystack | High — revenue is time-concentrated |

### 1.2 Actors

| Actor | Trust | Notes |
|---|---|---|
| Anonymous web visitor | None | Includes scrapers, scanners, card-testing bots |
| Guest purchaser | Phone + delivery details only; no account | Majority of traffic; identified per-order via token, not session |
| Account holder | Supabase Auth session (cookie) | `authenticated` Postgres role via anon key + JWT |
| Staff/admin | Supabase Auth + `user_role=admin` claim + MFA (AAL2) | Small set; highest-value session |
| Paystack webhook caller | Untrusted until HMAC verifies | Anyone can POST to the URL; the signature is the only identity |
| CI (GitHub Actions) | Holds least-privilege tokens | Attack path via malicious dependency or workflow injection |
| Insider / lost staff device | Partial | Mitigated by MFA, audit log, short sessions, offboarding runbook |

### 1.3 STRIDE by surface

**S** Spoofing · **T** Tampering · **R** Repudiation · **I** Info disclosure · **D** Denial of service · **E** Elevation of privilege. Controls referenced by ID (§2).

**Surface A — Browser app (Next.js pages/RSC, Stitch-derived components)**

| | Threat | Control |
|---|---|---|
| S | Phishing clone of the site harvesting phones/addresses | TH-1 (HSTS preload), user-visible domain discipline; report-only monitoring |
| T | DOM/devtools tampering of prices, hidden fields, promo state | IV-2 server recompute — client state is a *suggestion*, never an input to money |
| R | User denies placing order | LOG-2 audit trail + PAY-3 payment evidence + Act 772 e-records (§3.4) |
| I | Secrets or other users' data serialized into RSC payload/props | AZ-7/SEC-5 bundle & payload scan; no PII in client components beyond the viewer's own |
| D | Heavy pages scraped; image hotlinking | RL-1, CDN caching, next/image with allowlisted remote patterns |
| E | XSS via Stitch-export remnants (`dangerouslySetInnerHTML`, stray handlers) → session/token theft | TH-2 nonce CSP + strict-dynamic; frontend-stage sanitization tasks (§4.2) |

**Surface B — Route handlers & server actions**

| | Threat | Control |
|---|---|---|
| S | Forged/absent session; server action invoked cross-site | AU-1/AU-6 (`getUser()` validation), Next.js server-action origin checks kept default-on |
| T | Malformed bodies, mass assignment, oversized payloads, ID substitution | IV-1 zod strict schemas, IV-3 whitelisting, body size limits |
| R | Disputed admin/system state changes | LOG-2 append-only audit_log on every transition |
| I | Verbose errors/stack traces echoing PII or SQL | LOG-1; generic error envelopes; Sentry server-side only with scrubbing (LOG-3) |
| D | Expensive endpoints hammered (checkout init hits Paystack API) | RL-1 per-endpoint limits |
| E | Missing per-route authz (relying on UI hiding, or on middleware alone — cf. the Next.js middleware-bypass CVE class) | AZ-3/AZ-5/AZ-6: RLS is authoritative; every admin handler re-checks the claim itself |

**Surface C — Supabase (Postgres + RLS + service key + Storage)**

| | Threat | Control |
|---|---|---|
| S | Anon key used to impersonate roles | Anon key maps only to `anon`/`authenticated` Postgres roles; claims signed by Supabase JWT secret |
| T | Client writes to orders/prices via PostgREST | AZ-1/AZ-3: no insert/update policies on money tables for any client role |
| R | Untraceable data changes | LOG-2 audit_log; migrations in git (DR-4) |
| I | RLS gap on one table exposes it wholesale via auto-generated REST; Storage bucket public listing | AZ-1 deny-by-default + `force row level security` + automated RLS test suite (§4.1); buckets private by default, product images the only public bucket |
| D | Connection exhaustion from serverless bursts | Supavisor pooled connection string in all server code; statement timeouts |
| E | Service-role key exfiltration = God mode | AZ-7 server-only isolation, SEC-3 rotation, SEC-5 scans |

**Surface D — Paystack webhook endpoint (`/api/webhooks/paystack`)**

| | Threat | Control |
|---|---|---|
| S | Forged "charge.success" from arbitrary sender | PAY-2 HMAC-SHA512 of raw body vs `x-paystack-signature`, timing-safe compare |
| T | Amount/currency mismatch: pay GHS 1 for a GHS 300 order, or pay in test mode | PAY-4 re-verify amount+currency+reference+mode against the order row |
| R | "We never received the webhook" disputes | PAY-3 payment_events stores every received event verbatim |
| I | Webhook payload echoing into logs | LOG-1 redaction; payloads live only in RLS-locked `payment_events` (AZ-4) |
| D | Replay floods / retry storms | PAY-3 idempotent first-writer-wins; fast 200s; RL-1 burst cap + alert |
| E | Webhook handler using service role tricked into arbitrary writes | Handler does exactly one state transition (`pending_payment → paid`) — a state machine, not a generic mutator |

**Surface E — Admin surface (`/admin`)**

| | Threat | Control |
|---|---|---|
| S | Credential stuffing / phished staff | AU-2 strong passwords + leaked-password check, AU-5 mandatory TOTP MFA (AAL2), RL-1 auth limits |
| T | Order/price manipulation by compromised staff account | LOG-2 audit per action; admin mutations only via server routes (no direct table grants); least-role separation (`staff` vs `admin`) |
| R | Staff denies a refund/status change | LOG-2 actor-attributed audit rows |
| I | Admin pages leaking full customer list to lower-role staff | AZ-5 role claim in RLS, not just UI |
| D | — low | — |
| E | `user_metadata`-based role escalation (user-editable!) | AZ-5: role lives in a service-managed table injected via Custom Access Token hook — **never** `user_metadata` |

**Surface F — CI/CD & secret storage (GitHub Actions, Vercel envs)**

| | Threat | Control |
|---|---|---|
| S | PR from fork triggering privileged workflow | `pull_request` (not `pull_request_target`) for untrusted code; environment protection rules |
| T | Malicious dependency/postinstall exfiltrating env at build | SC-1/SC-2/SC-5; build env gets only build-needed vars |
| R | Untraceable deploys | Vercel Git integration: every deploy maps to a commit |
| I | Secrets in git history / CI logs | SEC-4 gitleaks (PR + full history), secret masking, SEC-1 sensitive-flagged envs |
| D | — low | — |
| E | Overprivileged deploy token stolen | SC-4 least-privilege, Git-integration-first (no long-lived PATs) |

**Surface G — Third-party scripts & assets (Turnstile, fonts, Stitch asset refs)**

| | Threat | Control |
|---|---|---|
| S | Typosquatted CDN host left in a Stitch export | Frontend-stage sanitization (§4.2): self-host everything; CSP blocks stragglers |
| T | Compromised third-party script skimming the checkout page (Magecart class) | TH-2 CSP allows exactly the Turnstile host (and `js.paystack.co` only if Inline is ever adopted), nonce-gated; PCI 6.4.3/11.6.1 posture (§3.3) |
| I | Fonts/analytics beaconing user IPs to extra processors | Self-hosted fonts via `next/font`; no analytics at launch without DPA + consent |
| D/E | Supply-chain script swap | SC-* controls; the **redirect (hosted) checkout** default needs zero third-party payment JS — see PAY-1 |

### 1.4 Ranked attack scenarios (likelihood × impact, 1–5 each; inherent risk pre-controls)

| # | Scenario | L | I | Score | Why here | Primary controls |
|---|---|---|---|---|---|---|
| 1 | **Price/total tampering at checkout** — edited cart payloads, negative quantities, promo stacking, currency games | 5 | 4 | **20** | Trivial (devtools); direct margin loss; every e-commerce site gets probed | IV-1..5, PAY-1, PAY-4 |
| 2 | **Card-testing bursts through checkout** — bots validating stolen cards against our Paystack integration | 4 | 4 | **16** | Endemic against African PSP merchants; consequences: fees, chargebacks, **Paystack account suspension** | RL-1/2/4, RL-3 Turnstile, PAY-1 |
| 3 | **Webhook forgery/replay** — fake or replayed `charge.success` marks orders paid; free pizza at scale | 3 | 5 | **15** | URL is discoverable; only crypto stands in the way | PAY-2, PAY-3, PAY-4 |
| 4 | **Secrets leaking into the client bundle** — service-role key or Paystack secret shipped in JS/RSC payload | 3 | 5 | **15** | Classic Next.js footgun (`NEXT_PUBLIC_`, client import of server module); one mistake = full DB | AZ-7, SEC-2, SEC-5 |
| 5 | **IDOR on guest order lookup** — enumerating/guessing order URLs to harvest names+phones+addresses | 4 | 3 | **12** | Guest links get shared/forwarded; PII harvest fuels MoMo social-engineering fraud | AU-4, AZ-3, RL-1 |
| 6 | **Account takeover** — credential stuffing, reset abuse, session theft via XSS | 3 | 4 | **12** | Password reuse is universal; admin ATO is scenario-E fuel | AU-2/3/5/6, RL-1, TH-2 |
| 7 | **Dependency supply-chain compromise** — malicious npm package or Action exfiltrates envs or injects skimmer | 2 | 5 | **10** | Low frequency, catastrophic blast radius | SC-1..5, SEC-4 |
| 8 | **Admin surface compromise via missing per-route authz** (middleware-only gating) | 2 | 5 | **10** | Known Next.js middleware-bypass bug class | AZ-5/6, AU-5 |
| 9 | **Promo-code abuse** — brute-forced codes, multi-redemption via guest checkout, referral farming | 4 | 2 | **8** | Certain to happen once promos exist; bounded by code value if capped | IV-5, RL-1/2 |
| 10 | **Scraping/bot load** — menu scraping, inventory probing, junk orders degrading peak service | 4 | 2 | **8** | Cheap to attempt; mostly cost/availability harm | RL-1/2/3, CDN caching |

Residual-risk review of this table is a standing Stage 5 task (§4.2).

---

## 2. Control set (mapped to the stack)

### 2.1 Authentication (AU)

**AU-1 — Sessions: Supabase Auth via `@supabase/ssr` cookie sessions.**
One `middleware.ts` refresh path + `createServerClient` in Server Components/route handlers, `createBrowserClient` in client components. Cookies are `HttpOnly`, `Secure`, `SameSite=Lax` (the `@supabase/ssr` defaults — do not loosen). No tokens in `localStorage`, ever.

**AU-2 — Password policy** (Supabase Dashboard → Auth → Policies): minimum length 12; enable **leaked-password protection** (HaveIBeenPwned k-anonymity check). No composition rules beyond length + breach check (NIST-aligned).

**AU-3 — Email confirmation** required for account signup (Auth → Email → confirm ON). Unconfirmed users can browse but not attach orders to the account. Guest checkout is unaffected (no account). Auth emails sent via a configured SMTP provider with SPF/DKIM/DMARC (`p=reject`) on our domain — default Supabase SMTP is not for production.

**AU-4 — Guest order-access tokens: signed, short-lived, single-order scope.**
Order **IDs must never grant access**: an ID is an identifier, not a secret — it leaks through forwarded links, shared screenshots, support tickets, logs, analytics URLs, and browser history; if ever sequential it is enumerable; and it can't expire or be revoked. Capability = separate signed token:

```ts
// src/lib/tokens.ts (server-only import graph)
import 'server-only';
import { SignJWT, jwtVerify } from 'jose';

const key = new TextEncoder().encode(process.env.ORDER_TOKEN_SECRET!); // 256-bit, dedicated

export function mintOrderToken(orderId: string) {
  return new SignJWT({ scope: 'order:read', oid: orderId })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('72h')          // covers the delivery + complaint window
    .sign(key);
}

export async function orderIdFromToken(token: string): Promise<string> {
  const { payload } = await jwtVerify(token, key);   // throws on bad sig / expired
  if (payload.scope !== 'order:read' || typeof payload.oid !== 'string')
    throw new Error('wrong scope');
  return payload.oid;                  // single-order scope: token names exactly one order
}
```

Delivery: embedded in the confirmation/tracking URL shown after checkout. After expiry, re-access is via the **`/track` lookup** — order number **plus** phone, both matching, rate-limited (RL-1), uniform errors — which issues a fresh token (ARCHITECTURE.md §6.2). Phone-OTP re-access via SMS is a post-launch upgrade alongside the SMS gateway. The tracking route handler resolves the order **server-side with the service client after token verification** — guests never query Postgres directly. Rotating `ORDER_TOKEN_SECRET` revokes all outstanding tokens (documented in SEC-3).

**AU-5 — Staff/admin MFA mandatory.** Supabase Auth TOTP MFA enrolled at first admin login; admin access requires `aal2` (checked in AZ-5's `is_admin()` and AZ-6 middleware). Supabase/Vercel/Paystack/GitHub **dashboard** accounts also require MFA (launch-gate item).

**AU-6 — Server code authenticates with `supabase.auth.getUser()`, never `getSession()` alone.** `getSession()` trusts the cookie contents; `getUser()` revalidates the JWT with Supabase. All authorization decisions in route handlers/server actions start from `getUser()`.

### 2.2 Authorization (AZ)

**AZ-1 — Deny-by-default RLS on EVERY table.** Migration template: every `create table` is immediately followed by `enable row level security` + `force row level security` (forced so even table owners in triggers don't skirt it). A table with RLS enabled and **no policies denies everything** to `anon`/`authenticated` — that is the default posture; policies are added per documented need. Also revoke the schema-wide defaults PostgREST inherits:

```sql
-- baseline migration
revoke all on all tables in schema public from anon, authenticated;
alter default privileges in schema public revoke all on tables from anon, authenticated;
-- then grant back per-table only what a policy actually permits, e.g.:
grant select on public.products, public.product_sizes, public.modifiers to anon, authenticated;
grant select on public.profiles, public.orders, public.order_items to authenticated;
grant select, update (full_name, phone, default_address_id) on public.profiles to authenticated;
```

**AZ-2 — `profiles`: self-only.**

```sql
alter table public.profiles enable row level security;
alter table public.profiles force row level security;

create policy profiles_select_self on public.profiles
  for select to authenticated using (id = (select auth.uid()));

create policy profiles_update_self on public.profiles
  for update to authenticated
  using (id = (select auth.uid()))
  with check (id = (select auth.uid()));

-- No INSERT policy: rows are created by a SECURITY DEFINER trigger on auth.users.
-- No DELETE policy: account deletion runs through the DSR server flow (§3.1).
```

(`(select auth.uid())` is the initplan form — evaluated once per statement, not per row.)

**AZ-3 — `orders`: owner-or-admin SELECT; zero client mutation.**

```sql
create policy orders_select_owner_or_admin on public.orders
  for select to authenticated
  using (user_id = (select auth.uid()) or public.is_admin());

-- Deliberately absent: any INSERT/UPDATE/DELETE policy for anon or authenticated,
-- and any policy at all for anon. Orders are created and transitioned ONLY by
-- server code holding the service-role key (checkout, webhook, admin server routes),
-- each transition writing audit_log (LOG-2).
-- Guest orders have user_id NULL: no client role can ever select them; guests read
-- their order exclusively through the AU-4 token flow, server-side.
```

Same pattern for `order_items` (selectable via join predicate on the parent order).

**AZ-4 — `payment_events`: service-only.**

```sql
alter table public.payment_events enable row level security;
alter table public.payment_events force row level security;
-- No policies whatsoever. anon/authenticated see nothing; only the service role
-- (which bypasses RLS) reads/writes, and only from the webhook/verify code paths.
-- unique (provider, dedupe_key) is the idempotency anchor (PAY-3); columns per ARCHITECTURE.md §3.5.
```

**AZ-5 — Admin via JWT role claim, service-managed, checked in RLS *and* middleware.**
Role lives in a table only server code writes, injected into the JWT by the **Custom Access Token hook** — never in `user_metadata` (user-writable → instant privilege escalation):

```sql
create table public.user_roles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  role text not null check (role in ('admin','staff'))
);
alter table public.user_roles enable row level security;  -- no policies: service-only

-- Dashboard → Auth → Hooks → Custom Access Token
create or replace function public.custom_access_token(event jsonb)
returns jsonb language plpgsql stable security definer set search_path = public as $$
declare claims jsonb := event->'claims'; r text;
begin
  select role into r from public.user_roles where user_id = (event->>'user_id')::uuid;
  claims := jsonb_set(claims, '{user_role}', coalesce(to_jsonb(r), '"customer"'::jsonb));
  return jsonb_set(event, '{claims}', claims);
end $$;

create or replace function public.is_admin() returns boolean
language sql stable as $$
  select coalesce(auth.jwt()->>'user_role','') = 'admin'
     and coalesce(auth.jwt()->>'aal','aal1') = 'aal2'   -- MFA-completed sessions only (AU-5)
$$;
```

(The `profiles.role` column in ARCHITECTURE.md §3.3 is a display mirror; `user_roles` + the JWT claim are authoritative.)

**AZ-6 — Middleware is an advisory gate, not the gate.** `middleware.ts` redirects non-admins away from `/admin/*` for UX, but every admin server action/route handler independently re-checks `getUser()` + role claim, and RLS enforces it regardless. Rationale: the Next.js middleware-bypass bug class (e.g. the `x-middleware-subrequest` CVE) makes middleware-only auth a known foot-gun; keeping Next.js patched is a Dependabot priority (SC-2).

**AZ-7 — Service-role key can never reach the client bundle.** Four stacked mechanisms:

1. **`server-only` package**: the only module that instantiates the admin client imports it — any client-graph import becomes a build error:

```ts
// src/lib/supabase/admin.ts — the ONLY place the service key is read
import 'server-only';
import { createClient } from '@supabase/supabase-js';

export const supabaseAdmin = createClient(
  process.env.SUPABASE_URL!,                 // note: NOT the NEXT_PUBLIC_ variant
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { persistSession: false, autoRefreshToken: false } },
);
```

2. **Env naming**: Next.js inlines only `NEXT_PUBLIC_*` into client JS. Allowed public vars are a checked-in allowlist of exactly four: `NEXT_PUBLIC_SITE_URL`, `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `NEXT_PUBLIC_TURNSTILE_SITE_KEY`. CI fails if any other `NEXT_PUBLIC_` name appears in `.env*` or source.
3. **Lint rule**: secrets readable only under the server-only modules:

```jsonc
// eslint.config: applies to everything OUTSIDE src/lib/supabase/admin.ts, src/lib/paystack/**, src/lib/tokens.ts
"no-restricted-syntax": ["error", {
  "selector": "MemberExpression[object.property.name='env'][property.name=/SERVICE_ROLE|PAYSTACK_SECRET|ORDER_TOKEN_SECRET/]",
  "message": "Server secrets may only be read inside the designated server-only modules (see docs/SECURITY.md AZ-7)."
}]
```

4. **Post-build scan (SEC-5)**: after `next build`, a script greps `.next/static/**` for the literal values of every non-public env secret present in the build environment (and for marker substrings like `service_role`); any hit fails the build.

### 2.3 Input validation (IV)

**IV-1 — zod at every boundary**: every route handler, server action, and webhook parses with `.strict()` schemas before any logic; unknown keys are errors (kills mass assignment). Schemas live in `src/lib/schemas/` and are shared with client forms (client validation is UX; server validation is security).

**IV-2 — Server recomputes all money.** The checkout payload carries **only identities and quantities — no prices, no totals, no discount amounts** (deal slots follow the same pattern; see ARCHITECTURE.md §5.1):

```ts
export const CheckoutInput = z.object({
  customerName: z.string().min(2).max(80),
  phone: z.string().regex(/^\+233\d{9}$/),          // normalized Ghana MSISDN (0XXXXXXXXX accepted client-side, normalized before this)
  address: z.object({
    zoneId: z.string().uuid(),
    area: z.string().min(2).max(80),
    addressLine: z.string().min(3).max(240),
    landmark: z.string().max(240).optional(),       // landmark-style directions
  }).strict(),
  items: z.array(z.object({
    productId: z.string().uuid(),
    sizeId: z.string().uuid(),
    modifierIds: z.array(z.string().uuid()).max(8).default([]),
    qty: z.number().int().min(1).max(15),           // IV-4 quantity caps
  }).strict()).min(1).max(25),
  promoCode: z.string().trim().toUpperCase().max(24).optional(),
  turnstileToken: z.string().min(10),               // RL-3
  expectedTotalPesewas: z.number().int().nonnegative(), // display echo → 409-refresh flow, never an input to pricing
}).strict();
```

The server then prices the cart against `products`/`product_sizes`/`modifiers`/`deals` `where active/available`, computes `total_pesewas` as an integer, and stores it on the order. Any client-displayed total is decoration.

**IV-3 — Whitelist validation of IDs**: pricing requires every `productId`/`sizeId`/`modifierId` to resolve to an *active, available* row with valid relations (size belongs to product, modifier attached to product, deal slot constraints satisfied); any miss aborts the checkout (no partial acceptance). Inactive/hidden products are unpurchasable even with a known UUID.

**IV-4 — Quantity caps** (schema above: ≤15 per line, ≤25 lines) plus a server-side order value ceiling (e.g. GHS 5,000) that routes to manual confirmation — bounds both fraud and mistake blast radius.

**IV-5 — Promo integrity**: codes are rows in `promo_codes` (server-validated: active window, min order value, per-code max redemptions, per-phone/per-user redemption cap). Redemption is recorded atomically when the order reaches `paid` (ARCHITECTURE.md §3.6), with `uses < max_uses` checked under the same transaction — no race-based over-redemption. Discount amount is computed server-side from the code definition; guest redemptions are keyed on normalized phone + device cookie (RL-2). Code entry is rate-limited (brute-force of short codes).

### 2.4 Payment integrity (PAY)

**PAY-1 — Initialize server-side, amount in pesewas, server-generated reference.** Paystack **redirect (hosted) checkout** (locked in ARCHITECTURE.md §5) — it removes all third-party JS from our pages (simplest CSP, cleanest PCI SAQ-A story).

```ts
// src/lib/paystack/client.ts (server-only)
import 'server-only';

export async function initializePayment(order: Order, reference: string) {
  const res = await fetch('https://api.paystack.co/transaction/initialize', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY!}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      email: order.email ?? `orders+${order.order_number}@<final-domain-TBC>`, // Paystack requires an email
      amount: order.total_pesewas,            // integer pesewas, from the DB (IV-2)
      currency: 'GHS',
      reference,                              // server-generated: {order_number}-{attempt}, stored on payments row
      channels: ['card', 'mobile_money'],     // MTN MoMo / Telecel Cash / AT Money + cards
      callback_url: `${process.env.NEXT_PUBLIC_SITE_URL}/orders/${order.id}?t=${orderToken}`,
      metadata: { order_id: order.id, order_number: order.order_number },
    }),
  });
  // persist authorization_url; redirect the customer to it
}
```

**PAY-2 — Webhook signature: HMAC-SHA512 of the RAW body.** Next.js App Router gives the raw body via `req.text()` — but only if nothing parses it first: the route is excluded from `middleware.ts` matchers and from any WAF challenge.

```ts
// app/api/webhooks/paystack/route.ts
import crypto from 'node:crypto';
import { supabaseAdmin } from '@/lib/supabase/admin';

export const runtime = 'nodejs';            // node:crypto; predictable raw-body semantics

export async function POST(req: Request) {
  const raw = await req.text();             // RAW body FIRST — never req.json() before verifying;
                                            // re-serialized JSON breaks the HMAC (key order, whitespace)
  const sigHeader = req.headers.get('x-paystack-signature') ?? '';
  const expected = crypto
    .createHmac('sha512', process.env.PAYSTACK_SECRET_KEY!)   // the secret key IS the HMAC key
    .update(raw)
    .digest('hex');

  const a = Buffer.from(sigHeader, 'hex');
  const b = Buffer.from(expected, 'hex');
  if (a.length !== b.length || !crypto.timingSafeEqual(a, b)) {
    return new Response('invalid signature', { status: 401 });
  }

  const evt = JSON.parse(raw);
  const dedupeKey = `${evt.event}:${evt.data?.id ?? evt.data?.reference}`;  // PAY-3 key

  // PAY-3: idempotency — first writer wins; Paystack retries and replays no-op here
  const { data: fresh } = await supabaseAdmin
    .from('payment_events')
    .upsert(
      { dedupe_key: dedupeKey, event_type: evt.event, reference: evt.data?.reference ?? '',
        signature_valid: true, raw_body: evt, status: 'received' },
      { onConflict: 'dedupe_key', ignoreDuplicates: true },
    )
    .select('id')
    .maybeSingle();
  if (!fresh) return new Response('duplicate', { status: 200 });   // already seen

  if (evt.event === 'charge.success') {
    await applyVerifiedPayment(evt.data, dedupeKey);   // PAY-4, shared with the verify path
  }
  return new Response('ok', { status: 200 });          // always 200 once recorded — stop retries
}
```

**PAY-3 — Idempotency via `payment_events`** (schema in ARCHITECTURE.md §3.5): unique `dedupe_key`; Paystack has no global event UUID so we derive `event:data.id`. Replays, retry storms, and double-delivery all collapse into one processed row. `processed_at` set when the state transition commits.

**PAY-4 — Re-verify against the order before marking paid, inside a state machine:**

```ts
async function applyVerifiedPayment(data: PaystackCharge, dedupeKey: string) {
  const order = await getOrderByReference(data.reference);   // service client
  const ok =
    !!order &&
    data.status === 'success' &&
    data.amount === order.total_pesewas &&     // exact integer match — no epsilon, no client echo
    data.currency === 'GHS';
  if (!ok) {
    await flagPaymentMismatch(order?.id, dedupeKey, data);   // needs_review + audit_log + alert (LOG-4); NEVER mark paid
    return;
  }
  // Sole legal transition: pending_payment -> paid. Anything else is a no-op + audit entry.
  await transitionOrder(order.id, ['pending_payment'], 'paid', { dedupeKey }); // writes audit_log
  // Side effects (confirmation page state; email; SMS post-launch) only after the committed transition.
}
```

Live-mode check: the handler runs with the live secret key, so test-mode events fail the HMAC by construction; the mismatch flag catches everything else (partial amounts, wrong currency, unknown references).

**PAY-5 — Belt-and-braces verify on customer return — never fulfil from the redirect alone.** The `callback_url` query string is attacker-visible and attacker-craftable; treat it as a hint. The return page's verify call hits `GET https://api.paystack.co/transaction/verify/{reference}` server-side and funnels a successful result into **the same** `applyVerifiedPayment` path (idempotent via PAY-3 — whichever of webhook/verify lands first wins, the other no-ops). If verify is pending, show "confirming payment…" and poll; kitchen fulfilment keys off order state = `paid`, nothing else.

**PAY-6 — No PAN, ever.** Card fields render only inside Paystack's hosted page. We store at most `last4`, `bin`, channel, MoMo network from webhook payloads. Support staff are trained (and the runbook states) never to accept card numbers or MoMo PINs via phone/WhatsApp — this preserves SAQ-A (§3.3).

### 2.5 Transport & headers (TH)

**TH-1 — HSTS with preload**, set in `next.config.ts` headers for all routes: `Strict-Transport-Security: max-age=63072000; includeSubDomains; preload`. Submit the apex to hstspreload.org after two stable weeks. Vercel enforces TLS and redirects HTTP→HTTPS; no cleartext listener exists.

**TH-2 — CSP with nonces via `middleware.ts`:**

```ts
// middleware.ts (extract)
const nonce = Buffer.from(crypto.getRandomValues(new Uint8Array(16))).toString('base64');
const csp = [
  "default-src 'self'",
  `script-src 'self' 'nonce-${nonce}' 'strict-dynamic'`,   // Turnstile loads nonce-gated; js.paystack.co only if Inline is ever adopted
  "style-src 'self' 'unsafe-inline'",                      // see TH-4 — tracked for tightening
  "img-src 'self' data: blob: https://<project-ref>.supabase.co",
  "font-src 'self'",
  `connect-src 'self' https://<project-ref>.supabase.co wss://<project-ref>.supabase.co https://challenges.cloudflare.com`,
  "frame-src https://checkout.paystack.com https://challenges.cloudflare.com",
  "frame-ancestors 'none'",
  "base-uri 'self'", "form-action 'self'", "object-src 'none'",
  "upgrade-insecure-requests",
].join('; ');
const reqHeaders = new Headers(req.headers);
reqHeaders.set('x-nonce', nonce);                          // Next applies it to its own inline scripts
const res = NextResponse.next({ request: { headers: reqHeaders } });
res.headers.set('Content-Security-Policy', csp);
```

Ship one release with `Content-Security-Policy-Report-Only` + a report endpoint to shake out violations, then enforce. The webhook route is excluded from the middleware matcher (PAY-2).

**TH-3 — Companion headers** (in `next.config.ts`): `X-Content-Type-Options: nosniff`; `Referrer-Policy: strict-origin-when-cross-origin`; `Permissions-Policy: camera=(), microphone=(), geolocation=(), payment=(), usb=()`; `X-Frame-Options: DENY` (legacy fallback for `frame-ancestors 'none'`); `Cross-Origin-Opener-Policy: same-origin-allow-popups` (safe with Paystack's flows).

**TH-4 — The Tailwind/Stitch inline-style tension, resolved honestly.** Tailwind itself is CSP-clean: utilities compile into a static stylesheet served under `style-src 'self'`. The friction is (a) Stitch HTML exports arrive littered with `style=""` **attributes**, which nonces cannot cover (nonces apply to `<style>`/`<script>` elements, not attributes), and (b) some libraries inject inline `<style>`. Resolution: keep `script-src` maximally strict (nonce + `strict-dynamic` — scripts are where XSS lives) and accept `style-src 'self' 'unsafe-inline'` at launch as a documented, time-boxed risk. Stage 3 (§4.2) converts every Stitch inline style to Tailwind classes, with an ESLint rule (`react/forbid-dom-props` on `style`) and a counter in CI trending to zero; once zero, drop `'unsafe-inline'` from `style-src`. **Never** compensate the other way — `'unsafe-inline'` in `script-src` is a launch-gate hard fail.

### 2.6 Rate limiting & anti-abuse (RL)

**RL-1 — Per-endpoint limits, Postgres-backed at launch.** Implementation: the `check_rate_limit(key, max, window_seconds)` fixed-window function over the `rate_limits` table (ARCHITECTURE.md §3.6) — no extra service, no extra processor, entirely adequate at pizza-shop volumes. Vercel Firewall/WAF is the coarse outer layer (managed rulesets, obvious-bot blocking). If volumes outgrow Postgres windows, `@upstash/ratelimit` (EU region) is the documented drop-in upgrade — adopting it adds a processor to §3.1's inventory first.

| Endpoint | Primary key (identity) | Secondary key (IP, deliberately loose) | On exceed |
|---|---|---|---|
| Auth: login/signup/reset | normalized email/phone hash: 5/15m | IP: 100/15m | Turnstile challenge, then temp lock the *identifier* |
| Checkout initialize | device cookie + phone hash: 10/h | IP: 60/10m | Turnstile interstitial; never a silent drop |
| Guest order lookup (`/track`) | order_number+phone key: 5/15m | IP: 300/h | 429 + retry-after; uniform "not found" errors (no oracle) |
| Promo code entry | device+phone: 10/h | IP: 100/h | Turnstile challenge |
| Paystack webhook | signature is the gate (PAY-2) | burst cap 120/min → alert only (never 429 valid Paystack retries into the void) | LOG-4 alert |

**RL-2 — CGNAT reality (IMPORTANT): design around shared IPs.** MTN Ghana, Telecel, and AT run carrier-grade NAT — thousands of legitimate customers surface from one IP, and most of our traffic is mobile. Therefore: (a) **no control ever hard-bans an IP alone**; (b) identity-ish keys lead (phone hash, auth identifier, signed device cookie set at first visit), IP keys are 10–20× looser and act as circuit breakers; (c) breaching an IP threshold triggers a **progressive challenge** (Turnstile) — real customers pass in one tap, bots don't; (d) monitoring tracks 429/challenge rates per ASN (MTN AS30986 etc.) as a false-positive canary; (e) WAF custom rules use JA4/UA + path patterns rather than raw IP reputation where possible.

**RL-3 — Cloudflare Turnstile on guest checkout and signup** (managed/invisible mode): widget on the client, token verified server-side inside the checkout/signup handler (`https://challenges.cloudflare.com/turnstile/v0/siteverify` with `TURNSTILE_SECRET_KEY`) **before** any Paystack call. Tokens are single-use; verification failure = 403 with a human-readable retry. Also armed on promo entry when its limiter trips.

**RL-4 — Card-testing playbook** (scenario #2): Turnstile before every transaction initialize; velocity caps per phone/device (RL-1); minimum order value (no GHS 1 probes); alert when checkout-initialize→success ratio drops below threshold or failed-charge webhooks spike (LOG-4); enable Paystack's dashboard fraud controls; kill switch = require Turnstile interactive mode + halve limits via env flag, no deploy needed.

### 2.7 Secrets management (SEC)

**SEC-1 — Vercel env vars per environment**, marked *Sensitive* (write-only): Production and Preview are **separate values** — Preview uses a separate Supabase project and Paystack **test** keys, so a leaked preview URL or PR build can never touch production data or money. Local dev: `.env.local` (gitignored) via `vercel env pull`; `.env.example` holds names only.

Server-only inventory: `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, `SUPABASE_DB_URL` (CI only), `PAYSTACK_SECRET_KEY`, `ORDER_TOKEN_SECRET`, `TURNSTILE_SECRET_KEY`, `CRON_SECRET`, `SENTRY_AUTH_TOKEN` (CI only). Public allowlist: the four `NEXT_PUBLIC_*` vars in AZ-7.

**SEC-2 — No `NEXT_PUBLIC_` leakage**: enforced by the AZ-7 allowlist check + lint rule + SEC-5 bundle scan. The anon key is public **by design and safe only because AZ-1 holds** — this pairing is asserted together in the launch gate.

**SEC-3 — Rotation runbook** (quarterly, plus on any staff departure or suspected exposure; owner + last-rotated date tracked in `docs/SECRETS-INVENTORY.md` — names and dates only, never values):
1. Generate the new credential (Paystack dashboard rotate; Supabase API-keys rotate; `openssl rand -base64 32` for `ORDER_TOKEN_SECRET` — note: invalidates outstanding guest links, rotate off-peak).
2. `vercel env rm` / `vercel env add` per environment → redeploy.
3. Verify: test transaction end-to-end, webhook signature passes, admin login works.
4. Revoke the old credential; confirm the old value now fails.
5. Audit-log the rotation (LOG-2, actor = the operator).

**SEC-4 — gitleaks in CI**: pinned-SHA GitHub Action on every PR + a scheduled full-history scan; custom rules for `sb_secret_`/service-role JWT shape, `sk_live_`/`sk_test_` (Paystack). Any hit blocks merge; a *historical* hit triggers SEC-3 immediately (rotate — never just rewrite history and hope).

### 2.8 Logging & audit (LOG)

**LOG-1 — Structured logs with PII minimization**: `pino` JSON logs in all server code; `redact` paths `['phone','*.phone','address','*.address','email','*.email']`; customers referenced by `order_id`/`user_id` (UUIDs), never by name/phone; request logs record route + status + duration + hashed rate-limit key, never bodies. Vercel runtime log retention is short by default — anything needed longer flows into `audit_log` or Sentry, both PII-scrubbed.

**LOG-2 — Append-only `audit_log`** for every order/payment/admin state change (columns per ARCHITECTURE.md §3.6), hardened against rewrites even by service-role code bugs:

```sql
alter table public.audit_log enable row level security;   -- no policies: service-role writes, admin reads via server code
create or replace function public.audit_block() returns trigger
language plpgsql as $$ begin raise exception 'audit_log is append-only'; end $$;
create trigger audit_log_no_rewrite
  before update or delete on public.audit_log
  for each row execute function public.audit_block();
```

Every `transition_order()` call (PAY-4) and every admin server action writes here in the same transaction as the change.

**LOG-3 — Sentry with scrubbing**: server + client SDKs; `sendDefaultPii: false`; `beforeSend` strips cookies/headers/query strings and regex-scrubs Ghana MSISDNs (`\+?233\d{9}` and `0\d{9}`); EU data residency selected; source maps uploaded via CI token (never public).

**LOG-4 — Alerting**: email/Slack alerts on — webhook signature failures > 5/min; any `payment.mismatch` / `needs_review` audit row (instant); checkout failure-rate spike (RL-4); admin login from a new device; RLS test-suite failure in CI; 429/challenge rate per ASN anomaly (RL-2d).

### 2.9 Supply chain & CI (SC)

**SC-1 — Lockfile discipline**: pnpm with `pnpm-lock.yaml` committed; CI and Vercel install with `--frozen-lockfile`; `packageManager` field + Corepack pins the pnpm version itself. No `npm install` anywhere.

**SC-2 — Audit + Dependabot**: `pnpm audit --prod --audit-level high` as a CI gate (fail on high/critical); Dependabot — npm weekly (grouped minor/patch), **security updates daily**, `github-actions` ecosystem weekly. Next.js and `@supabase/*` security releases are same-week merges (see AZ-6 rationale).

**SC-3 — Pinned GitHub Actions**: every third-party action pinned to a **full commit SHA** (not tags — tags move; the `tj-actions` incident is the cautionary tale), with Dependabot bumping the SHAs. Workflows declare `permissions: contents: read` at top level and escalate per-job only as needed.

**SC-4 — Least-privilege deploy**: Vercel deploys via the **Git integration** (no deploy token exists to steal). If a token ever becomes necessary, it is project-scoped, stored in a GitHub *environment* with required reviewers, and inventoried in SEC-3. Supabase migrations apply via CI using a scoped access token, production environment protected by review.

**SC-5 — Install-script containment**: `pnpm` blocks lifecycle scripts by default for unapproved packages — `onlyBuiltDependencies` allowlists the few that genuinely need postinstall (e.g. `sharp`). Untrusted-PR workflows run on `pull_request` (not `pull_request_target`) and never see secrets.

### 2.10 Backups & disaster recovery (DR)

**DR-1 — Posture**: Supabase Pro tier minimum; daily automated backups (7-day retention) **plus the PITR add-on** (WAL archiving, restore to any point) — for a business taking real money, PITR is in-scope from launch, not "later". Storage buckets hold only re-uploadable product imagery (also versioned in the repo), so Postgres is the sole crown jewel.

**DR-2 — Stated targets (small-business honest)**: **RPO ≤ 15 minutes** (PITR), **RTO ≤ 4 business hours** (time to restore to a fresh project/branch, repoint `SUPABASE_URL` + keys in Vercel, redeploy, smoke-test checkout). During RTO, the site degrades to a static "call us to order" page (pre-built, deployable via env flag) — the phone number keeps revenue alive, which is the actual DR goal for a pizza shop.

**DR-3 — Drills**: quarterly restore drill to a Supabase branch/staging project, timed and logged in `audit_log` (`action: 'dr.restore_drill'`); the launch gate requires one completed drill before go-live.

**DR-4 — Config as code**: all schema, RLS policies, triggers, and the auth hook live in `supabase/migrations/` in git — the database's security posture is reviewable in PRs and rebuildable from scratch; drift between migrations and production is a CI check (`supabase db diff` clean).

---

## 3. Compliance map

> Entity-structure note: written for the working assumption of a UK-established operator (UK hosting) with delivery operations in Ghana. If the business is instead solely a Ghana entity using UK infrastructure, Act 843 leads and UK GDPR recedes to the hosting providers' own obligations — the control set below stands either way. Confirm with the owner before launch.

### 3.1 UK GDPR

A UK-established business processing personal data in the context of that establishment (UK hosting: Vercel `lhr1`, Supabase London) — **UK GDPR applies to all processing, including that of Ghanaian data subjects** (Art. 3(1); protection follows the controller, not the data subject's location). ICO registration (data protection fee) is required for the UK entity.

**Lawful bases per processing activity:**

| Processing activity | Data | Lawful basis |
|---|---|---|
| Taking, preparing, delivering orders | Name, phone, address, order contents | Contract — Art. 6(1)(b) |
| Payment processing via Paystack | Phone/email, amount, reference | Contract — Art. 6(1)(b) |
| Account creation & login | Email, phone, password hash | Contract — Art. 6(1)(b) |
| Fraud prevention, rate limiting, security logging, Turnstile | IPs, device cookies, hashed identifiers | Legitimate interests — Art. 6(1)(f), LIA documented alongside this file |
| Tax & accounting records | Order financials | Legal obligation — Art. 6(1)(c) (UK 6-year records duty) |
| Marketing SMS/email | Phone/email, consent record | Consent — Art. 6(1)(a); PECR-aligned: unbundled opt-in at checkout, opt-out honored in every message (STOP), suppression list kept |
| Non-essential cookies/analytics | — | None at launch; adding any requires consent UI + processor DPA first |

**Privacy notice** (linked in footer + checkout, plain English, Art. 13 complete): who we are + UK contact; what we collect and why (table above); recipients (processor inventory below); international transfers + safeguards; retention (table below); rights — access, rectification, erasure, restriction, portability, objection, consent withdrawal; complaint route to the **ICO** (and to Ghana's DPC, offered voluntarily); no automated decision-making with legal effect.

**Data-subject requests**: intake via privacy@ + an in-app form; identity verification proportionate to risk — account holders via authenticated session, guests via verification against order details (order number + matching phone; phone-OTP once the SMS gateway lands post-launch — never "email us your details"); one calendar month, extendable +2 for complexity; free. Mechanics: access/portability = JSON export from `orders`/`profiles` via an admin server action (audit-logged); erasure = **pseudonymisation where legal retention conflicts** — name/phone/address nulled and replaced with `erased:<hash>`, financial skeleton (items, amounts, reference, timestamps) retained under Art. 6(1)(c); a DSR register (date, type, outcome) is maintained.

**Retention schedule:**

| Data | Retention | Basis / trigger |
|---|---|---|
| Order financial core (items, amounts, payment reference, timestamps) | 6 years + current FY | UK tax/accounting obligation |
| Delivery PII on orders (name, phone, address) | Pseudonymised **12 months** after delivery (fraud/chargeback/complaint window), automated monthly job | Contract → LI, then minimised |
| `payment_events` payloads | 24 months (dispute evidence), then payload stripped to reference+type | LI / dispute defence |
| Guest order tokens | Expire 72 h; `/track` lookup thereafter | Security (AU-4) |
| Accounts (`auth.users`, `profiles`) | Until deletion request; inactivity review at 24 months | Contract |
| Security/app logs (Vercel, pino) | ≤ 30 days | LI (security) |
| Sentry events | 90 days (project default) | LI (security), scrubbed |
| `audit_log` | 6 years (low-PII by design, LOG-2) | LI / legal defence |
| Marketing consent + contact | Until withdrawal; suppression-list hash kept indefinitely | Consent / LI (suppression) |
| DB backups/PITR | 7–35 day rolling window; erasures propagate on expiry (stated in the privacy notice) | LI (DR) |

**Processor inventory (Art. 28 DPAs on file for each):**

| Processor | Function | Processing location | Transfer safeguard |
|---|---|---|---|
| Vercel Inc. | Hosting, serverless functions (`lhr1`), CDN/TLS edge | UK compute; US entity/support; global edge for static assets | DPA + UK Addendum/IDTA; Vercel DPF-certified |
| Supabase Inc. | Postgres, Auth, Storage | AWS `eu-west-2` (London); US entity/support | DPA + SCCs with UK Addendum |
| Paystack (Stripe subsidiary; Ghana/Nigeria entities) | Payment processing | Ghana / Nigeria | Contract + UK IDTA/Addendum where acting as processor; largely an independent controller as regulated PSP — reflected in the notice; Art. 49(1)(b) contract-necessity as residual basis for payment execution |
| Cloudflare | Turnstile bot defence | Global (token verification) | DPA + UK Addendum |
| Sentry (Functional Software) | Error monitoring (scrubbed) | EU residency selected | DPA + UK Addendum |
| SMS gateway (e.g. Hubtel/Arkesel — **post-launch**) | Transactional SMS to +233 numbers | Ghana | DPA + IDTA required **before** integration |
| Upstash (**only if adopted** per RL-1 scale-up) | Rate-limit state (hashed keys only) | EU region | DPA + SCCs/UK Addendum before adoption |

**International transfers**: primary storage/processing stays in the UK, and a Ghanaian customer submitting their own data to a UK site is not a restricted transfer. Restricted transfers **do** exist and are papered: (1) order/payment metadata to **Paystack Ghana**; (2) transactional SMS via a Ghanaian gateway (post-launch); (3) **Ghana-based staff accessing the admin surface — remote access from Ghana is a transfer under UK GDPR**. Ghana holds no UK adequacy decision, so each uses the UK IDTA / UK Addendum with a documented Transfer Risk Assessment; the staff-access transfer is covered by an intra-group agreement with the Ghana operating side. Breach duty: ICO within **72 hours** where risky, data subjects without undue delay when high-risk — wired into the incident runbook (§4.2 Stage 5).

### 3.2 Ghana Data Protection Act 2012 (Act 843)

**Reach**: Act 843 applies beyond controllers established in Ghana — it extends to controllers **not established in Ghana who use equipment or a data processor carrying on business in Ghana**. Avalanche Pizza uses Paystack Ghana (processor in Ghana) and runs delivery operations in Bechem for exclusively Ghanaian data subjects: the prudent legal position is that **Act 843 applies alongside UK GDPR**.

**DPC registration — advisable: yes.** Act 843 requires data controllers to register with the **Data Protection Commission** (renewable every two years), and the DPC actively enforces registration. Register the Ghana operating side as data controller (and disclose the UK processing/hosting arrangement in the application); cost is modest, non-registration is an offence, and registration materially de-risks local marketing and any DPC complaint. Owner: Frank, before first marketing campaign and no later than launch + 30 days.

**Eight principles → existing controls** (Act 843's principles map cleanly onto the GDPR machinery above — one control set satisfies both):

| Act 843 principle | Satisfied by |
|---|---|
| Accountability | This document; DPA/processor inventory; audit_log (LOG-2); named privacy owner |
| Lawfulness of processing | Lawful-bases table (§3.1); consent for marketing |
| Specification of purpose | Privacy notice purposes; data collected only at need (checkout collects nothing speculative) |
| Compatibility of further processing | No secondary use without new basis; analytics gated (§3.1) |
| Quality of information | Customer-editable profile/address; order confirmation screens; rectification via DSR |
| Openness | Privacy notice served to Ghanaian users in plain English; DPC complaint route mentioned |
| Data security safeguards | The whole of §2 — RLS, encryption in transit (TH-1) and at rest (Supabase/AES-256), secrets discipline, audit |
| Data subject participation | DSR process (§3.1) honoured identically for Ghanaian data subjects |

Act 843 also requires notifying the DPC and affected data subjects of security compromises — the incident runbook carries **both** clocks (ICO 72 h; DPC "as soon as reasonably practicable"). Direct marketing to Ghanaian numbers follows Act 843's consent/opt-out requirements — same consent record as §3.1.

### 3.3 PCI DSS

**Posture: SAQ-A.** Rationale, explicitly:
- All payment acceptance is **wholly outsourced to Paystack**, a PCI DSS Level 1 validated service provider; cards and MoMo run through Paystack's hosted checkout page (redirect).
- Cardholder data (PAN, CVV, expiry) is entered only into Paystack-controlled surfaces; **it never touches our servers, our JavaScript scope, our logs, or our database — not even transiently**. Webhooks carry at most bin/last4/channel.
- Our systems' role is limited to serving the page that redirects to the Paystack checkout.
- SAQ-A's e-commerce page-security expectations (the 6.4.3 script-management / 11.6.1 tamper-detection concern for payment pages) are addressed by TH-2's nonce CSP with an exact script allowlist, and the redirect-checkout default which removes third-party payment JS from our origin entirely; per the current SAQ-A (v4.x revision) we document CSP as the evidence that the site is not susceptible to script-injection attacks on the payment flow.

**What would break SAQ-A** (each is therefore prohibited and gate-checked):
1. Building **any** card input on our origin, even one that posts "directly" to Paystack from our page's JS scope (→ SAQ A-EP at best).
2. Proxying, logging, or even transiently receiving PAN/CVV server-side — including request-body logging on payment routes (→ SAQ-D).
3. Staff accepting card numbers over phone/WhatsApp and keying them in (creates a storage/handling risk; forbidden per PAY-6).
4. Storing anything beyond bin/last4/reference from webhook payloads.
5. Loading unvetted third-party scripts onto pages that host or launch the checkout (Magecart exposure; CSP violation = build failure once enforced).

MoMo (MTN/Telecel/AT) credentials are not cardholder data, but they get identical handling discipline: we never see wallet PINs; OTP prompts happen on Paystack/telco surfaces.

### 3.4 Ghana Electronic Transactions Act 2008 (Act 772) — awareness

Act 772 gives legal recognition to electronic records, contracts, and signatures — our checkout flow forms binding electronic contracts with Ghanaian consumers, and our records must stand up as evidence. Practical obligations wired into the build:
- **Durable receipts/records**: every order generates an electronic record (order row + `payment_events` + confirmation page, SMS when enabled) retained in retrievable form for the §3.1 retention period — satisfying e-record integrity/retention expectations and dispute defence (with LOG-2 providing tamper-evidence).
- **Vendor disclosure**: the site footer/terms display the operating entity's legal name(s), physical/contact details, full prices in GHS **including delivery fees and applicable Ghanaian levies before payment**, and the refund/cancellation policy — matching Act 772's consumer-protection disclosure expectations for e-commerce vendors.
- **Order correction opportunity**: the checkout review step lets customers fix errors before payment.
- **Unsolicited communications**: reinforced consent/opt-out for SMS marketing (aligned with §3.1/§3.2).
- Tax invoice/levy formatting on receipts is flagged to finance — outside this document's security scope, tracked in the launch checklist as an awareness item.

---

## 4. Launch security gate

### 4.1 Go-live pass/fail checklist

Every item is binary and names its verification. **Any fail blocks launch.**

**Access control**
- [ ] RLS enabled + forced on **every** table in `public`; zero tables without it — verified by CI SQL check (`select relname from pg_class where relrowsecurity = false ...` returns empty) *(AZ-1)*
- [ ] Automated RLS test suite green: anon client cannot read/write orders, payment_events, audit_log, user_roles; authenticated user A cannot read user B's profile/orders; client-role insert/update on orders fails *(AZ-2/3/4)*
- [ ] Admin claim comes from `user_roles` via Custom Access Token hook; test proves `user_metadata` edits do **not** grant admin *(AZ-5)*
- [ ] Admin routes deny without `aal2`; all staff accounts MFA-enrolled *(AU-5)*
- [ ] Direct-URL probe of `/admin/*` and admin server actions without/with non-admin session returns 401/redirect — tested with middleware deliberately bypassed (route-level check proven) *(AZ-6)*
- [ ] Guest order URL without token → 404-shaped error; expired token → `/track` re-issue flow works; token for order X cannot read order Y *(AU-4)*

**Payments**
- [ ] Webhook rejects: missing signature, wrong signature, and a byte-perfect **replayed** event (idempotent no-op) — three recorded test vectors run in CI *(PAY-2/3)*
- [ ] Amount-mismatch webhook (GHS 1 for a GHS 300 order) leaves order unpaid + writes `needs_review`/`payment.mismatch` + fires alert *(PAY-4, LOG-4)*
- [ ] Return-redirect with forged query params does **not** mark paid; verify-API path proven; fulfilment keyed solely on order state *(PAY-5)*
- [ ] Checkout with tampered client payload (edited price field → schema reject; unknown product UUID → whitelist reject; qty 999 → cap reject) *(IV-1..4)*
- [ ] End-to-end live-mode GHS test transaction (card + one MoMo channel) succeeds and reconciles: order paid, audit rows, confirmation shown
- [ ] Grep of repo + logs config proves no route logs request bodies on payment paths *(PAY-6 / SAQ-A)*

**Platform & headers**
- [ ] securityheaders.com / Mozilla Observatory: HSTS (preload-ready), CSP enforced (not report-only), nosniff, frame-ancestors 'none', Referrer-Policy, Permissions-Policy all present *(TH-1/2/3)*
- [ ] CSP `script-src` contains **no** `'unsafe-inline'`/`'unsafe-eval'`; violation reports quiet for 7 days pre-launch *(TH-2/4)*
- [ ] SEC-5 bundle scan wired into build and proven with a canary (planted fake secret fails the build) *(AZ-7/SEC-5)*
- [ ] `NEXT_PUBLIC_` allowlist check green; Vercel envs sensitive-flagged; Preview uses test keys + separate Supabase project *(SEC-1/2)*

**Abuse & availability**
- [ ] Rate limits verified per table in RL-1 (scripted burst tests), including the uniform-error behaviour on order lookup
- [ ] Turnstile live on guest checkout + signup; server-side siteverify enforced (client-only bypass attempt fails) *(RL-3)*
- [ ] Card-testing kill switch (env flag) toggles without deploy *(RL-4)*
- [ ] Webhook path excluded from middleware/WAF challenges (Paystack test event passes with WAF on) *(PAY-2)*

**Secrets & supply chain**
- [ ] gitleaks full-history scan clean (or historical hits rotated per SEC-3, with rotation audit entries) *(SEC-4)*
- [ ] `pnpm audit --prod` no high/critical; Dependabot live; all Actions SHA-pinned; workflows `permissions: contents: read` *(SC-2/3)*
- [ ] Secret rotation drill executed once end-to-end (all five runbook steps, timed) *(SEC-3)*
- [ ] MFA on Vercel, Supabase, Paystack, GitHub, registrar/DNS accounts; access list reviewed, ex-collaborators removed

**Data protection & compliance**
- [ ] Privacy notice live (footer + checkout), Art. 13-complete, retention table included *(§3.1)*
- [ ] DPAs/terms on file for every processor in the inventory *(§3.1)*
- [ ] IDTA/Addendum + TRA documented for Paystack Ghana and Ghana staff admin access *(§3.1)*
- [ ] ICO fee paid (if UK entity confirmed); Ghana DPC registration submitted (or dated ≤ launch + 30 days with owner named) *(§3.2)*
- [ ] DSR flow tested: one access export + one erasure (pseudonymisation) executed against staging data *(§3.1)*
- [ ] PII-trim job (12-month pseudonymisation) exists and runs in staging *(§3.1 retention)*
- [ ] SAQ-A completed and stored; the five SAQ-A breakers checked against the shipped code *(§3.3)*
- [ ] Act 772 disclosures on site: legal entity, contacts, GHS pricing incl. delivery/levies, refund policy *(§3.4)*

**Operational readiness**
- [ ] PITR enabled; one restore drill completed and timed within RTO *(DR-1/2/3)*
- [ ] Incident runbook committed under `docs/RUNBOOKS/`: severity ladder, ICO 72 h + DPC clocks, Paystack/Supabase/Vercel support contacts, kill switches, comms templates
- [ ] LOG-4 alerts firing to a monitored channel (test alert acknowledged)
- [ ] `audit_log` receiving rows for every order transition in staging soak; append-only trigger proven (UPDATE attempt errors) *(LOG-2)*

### 4.2 Per-stage security tasks

Stage numbers match the project task list (Stage 1 = this foundation, 2 = designs, 3 = frontend, 4 = backend, 5 = hardening/launch).

**Stage 1 — Foundation (this stage)**
- This document committed as `docs/SECURITY.md`; PR template gains a "control IDs affected" field.
- Paystack checkout mode decided: **redirect/hosted** (PAY-1, locked in ARCHITECTURE.md §5).

**Stage 2 — Designs (+ compliance groundwork, runs in parallel)**
- Data-flow diagram (browser → Vercel lhr1 → Supabase London → Paystack Ghana) committed; drives the ROPA and TRA.
- Record of processing activities + Legitimate Interests Assessment drafted; retention table (§3.1) signed off by the owner.
- Entity structure confirmed (UK/Ghana/both); ICO fee (if applicable) and Ghana DPC registration started.
- Checkout/confirmation designs include: unbundled marketing opt-in, privacy-notice link, order-review step (Act 772), Turnstile placement.
- Designs collect nothing speculative — checkout asks only for what §3.1's lawful-bases table needs.

**Stage 3 — Frontend (Stitch conversion)**
- Conversion rule for every Stitch HTML/Tailwind export, enforced by review checklist: strip all `<script>` tags, inline event handlers (`onclick=` etc.), `<meta http-equiv>`, and any external asset URL; download and self-host images/fonts (`next/font`); no `dangerouslySetInnerHTML` (lint-banned) — Stitch output is treated as **untrusted input**, not trusted code.
- Inline-style burn-down: CI counter for `style=` props (TH-4), trending to zero before Stage 5 ends.
- Ship CSP in **report-only** from the first deployed page; fix violations as they surface rather than at the end.
- Implement zod schemas (IV-1) as the shared contract while building forms; client forms never carry price fields (IV-2 shape locked in early).
- Turnstile widgets embedded on guest checkout + signup shells (even before backend verification lands, so layout/UX is settled).
- No real PII in preview environments; seed data is synthetic.

**Stage 4 — Backend**
- Migrations land RLS-first with the CI RLS test suite (§4.1 items) written **alongside each table**, red-green.
- Auth: `@supabase/ssr` wiring (AU-1/6), password policy + leaked-password protection + email confirmation configured (AU-2/3); Custom Access Token hook + `user_roles` + `is_admin()` (AZ-5); MFA enrollment flow for staff (AU-5).
- Supabase projects created (staging + prod) in `eu-west-2`; Vercel project pinned `lhr1`; Turnstile keys issued; separate test/live Paystack keys per environment (SEC-1).
- Checkout: server pricing (IV-2/3/4), promo atomics (IV-5), Turnstile siteverify (RL-3), Paystack initialize (PAY-1).
- Webhook + verify-on-return sharing `applyVerifiedPayment` (PAY-2..5); CI fixtures with real recorded test-mode payloads + signature vectors; middleware matcher excludes the webhook path.
- Guest token mint/verify + `/track` lookup (AU-4); order tracking route.
- Rate limits on the RL-1 table via `check_rate_limit` (compound keys + progressive challenge glue, RL-2).
- `audit_log` + `transition_order` state machine (LOG-2); pino redaction config (LOG-1); Sentry with scrubbing (LOG-3); LOG-4 alerts.
- SEC-5 bundle scan + `NEXT_PUBLIC_` allowlist check + gitleaks + pnpm audit wired into CI (SC-*, SEC-4).

**Stage 5 — Hardening & launch**
- Flip CSP report-only → enforced; drop `style-src 'unsafe-inline'` if the burn-down hit zero, else document the dated exception.
- Abuse simulation: scripted card-test burst against staging (test keys) — verify RL-4 detection + kill switch; token brute-force run against order lookup — verify uniform errors + limiter; replay the recorded webhook 100× — exactly one state transition.
- OWASP ZAP baseline scan + manual pass over auth, IDOR (guest/user/admin lattice), and the payment flow; fix or formally accept findings with owner + date.
- Restore drill (DR-3), secret rotation drill (SEC-3), gitleaks full-history scan — all logged.
- Load test checkout at expected Friday-peak ×5; confirm Supavisor pooling holds and rate limits don't throttle legitimate bursts (watch per-ASN 429s per RL-2).
- Finalize incident runbook (both regulators' clocks), DSR test run, PII-trim job verified, SAQ-A completed.
- Run the §4.1 gate top to bottom in a recorded session; unresolved fails block launch — no exceptions without a written, dated risk acceptance from the business owner.
- Post-launch standing cadence: weekly Dependabot merge window; monthly gate-subset re-run (RLS suite, headers, bundle scan are already every-CI); quarterly threat-model review of §1.4, rotation + restore drills.

---
*End of docs/SECURITY.md.*
