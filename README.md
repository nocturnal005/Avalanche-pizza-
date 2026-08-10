# Avalanche Pizza

Premium pizza ordering platform. Hosted in the UK, serving customers in Ghana (GHS).

Full online ordering: menu → cart → checkout (Paystack: cards + MTN MoMo, Telecel Cash, AT Money) → live order tracking. Guest checkout with optional accounts.

## Stack

- **Frontend:** Next.js (App Router, TypeScript strict), Tailwind CSS — pages converted from Google Stitch designs
- **Backend:** Next.js route handlers/server actions + Supabase (Postgres, Auth, RLS, Storage), London region `eu-west-2`
- **Payments:** Paystack (hosted/inline checkout, GHS, webhook-driven fulfilment)
- **Hosting:** Vercel, functions pinned to London `lhr1`, global CDN for Ghanaian users

## Documentation

| Doc | Purpose |
| --- | --- |
| [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) | System design, data model, API surface, payment flow, rendering strategy |
| [docs/SECURITY.md](docs/SECURITY.md) | Threat model, security controls, UK GDPR + Ghana DPA compliance, launch gate |
| [docs/DECISIONS.md](docs/DECISIONS.md) | Architecture decision records (locked with the owner) |

## Build stages

Work proceeds in gated stages; each ends with a report the owner approves before the next begins.

1. **Architecture & security foundation** — this repo's docs *(current)*
2. **Page designs completed in Stitch** — cart/checkout, confirmation, tracking, account
3. **Frontend build** — Stitch exports → responsive, accessible Next.js pages
4. **Backend** — schema, RLS, order/cart APIs, Paystack integration, thin admin
5. **Hardening & launch** — security gate, tests, deploy, production smoke tests
