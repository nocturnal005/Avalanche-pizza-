# Avalanche Pizza — agent instructions

Marketing and menu site for a pizza restaurant in **Bechem, Ahafo Region, Ghana**. UK-hosted (Vercel, London region), prices in GHS. Next.js App Router + TypeScript strict + Tailwind. **No database, no payments, no accounts** — ordering happens off-site via WhatsApp and phone (ADR-007).

## Non-negotiables

- **Read `docs/ARCHITECTURE.md` and `docs/SECURITY.md` before building.** They are the executable spec; `docs/DECISIONS.md` records what is locked and what was deliberately descoped — do not silently reintroduce removed scope (cart, checkout, Paystack, Supabase, accounts, order tracking, admin).
- **Design fidelity (ADR-006, Frank's standing instruction):** use the Stitch designs exactly as they exist — pixel-faithful, Avalanche Elite tokens. **Never invent designs or generate images.** Only assets already in `design/assets/` (or Frank's own folders, e.g. `D:\avalanche logo ideas`) may be used. **Build no page that has no design** — there are exactly four: Home, Core Menu, Special Deals, Login (Login is on hold pending Frank's decision).
- **The shop's WhatsApp number is security-critical.** It lives in exactly one config value, is pinned by a CI assertion, and every rendered `wa.me` link must resolve to it. A wrong number sends customers' orders and money to someone else.
- **Prices are indicative until confirmed in chat** — the site must say so wherever prices appear.
- **Mobile-first, low-bandwidth-first.** Customers are mostly on Ghanaian mobile data: optimized self-hosted images, subset fonts, minimal JS, CI-enforced budgets. **Ordering links must work without JavaScript** — plain anchors.
- **Money as integer pesewas** with a formatting helper; never floats.

## Design system

Avalanche Elite — `#131313` background, primary `#ffb59e`, CTA `#ff571a`, gold `#ffdf9e`; Metrophobic (display, wide tracking, uppercase) / Manrope (body) / JetBrains Mono (labels and prices); dark, high-contrast, sharp corners, generous negative space. Full tokens: `design/design-system.md`. Deals: The Ascent, The Gathering, Party Feast, All 4 One, Free Choice.

## Stitch exports are untrusted input

The HTML in `design/stitch-exports/` is a conversion **reference**, never imported wholesale. Strip inline scripts and event handlers, drop external asset URLs (imagery is already local in `design/assets/`), no `dangerouslySetInnerHTML`.

## Workflow

Frank works in gated stages — finish the stage, deliver a report, wait for approval. Do not start the next stage without it. Commits happen when Frank asks.
