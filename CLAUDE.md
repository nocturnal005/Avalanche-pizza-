# Avalanche Pizza — agent instructions

Pizza ordering platform: UK-hosted (Vercel `lhr1` + Supabase `eu-west-2`), customers in Ghana, currency GHS (store money as integer pesewas). Next.js App Router + TypeScript strict + Tailwind; Supabase Postgres/Auth/RLS; Paystack payments.

## Non-negotiables

- **Read `docs/ARCHITECTURE.md` and `docs/SECURITY.md` before building.** They are the executable spec; `docs/DECISIONS.md` records what is locked and must not be silently revisited.
- **Prices are computed server-side from the database.** Client-submitted totals are never trusted. Validate every boundary with zod.
- **Fulfilment is webhook-driven.** Orders are marked paid only after the Paystack webhook signature (HMAC-SHA512 of the raw body vs `x-paystack-signature`) verifies AND amount/currency/reference match the order. Never fulfil from the return redirect.
- **RLS is deny-by-default on every table.** The service-role key lives only in server-only modules; nothing secret under `NEXT_PUBLIC_`.
- **Guest orders are reached only via signed, short-lived, single-order tokens** — never by raw order ID.
- **Mobile-first, low-bandwidth-first.** Customers are mostly on Ghanaian mobile data: optimized images, subset fonts, small bundles.

## Design source

Google Stitch project `14597907360360833516` ("Gourmet Pizza Ordering Platform"). Convert its HTML/Tailwind exports into components; self-host all imagery (Stitch's Google-CDN URLs are temporary). Deal names: The Ascent, The Gathering, Party Feast, All 4 One, Free Choice.

**Design fidelity (ADR-006, Frank's standing instruction):** use the Stitch designs exactly as they exist — pixel-faithful conversion, ember token set of the coded pages. Never invent designs or generate images; only assets already in the Stitch project (or Frank's own folders, e.g. `D:\avalanche logo ideas`) may be used. Pages with no Stitch design are built only via the path Frank has explicitly chosen.

## Workflow

Owner (Frank) works in gated stages — finish the stage, deliver a report, wait for approval. Do not start the next stage without it. Commits happen when Frank asks.
