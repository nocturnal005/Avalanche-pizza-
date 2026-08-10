# Architecture Decision Records — Avalanche Pizza

Decisions locked with Frank on 2026-08-10. Revisiting any of these requires his sign-off.

## ADR-001: Full online ordering at launch

**Decision.** The site launches as a complete ordering platform: menu → cart → checkout → online payment → order status tracking.

**Context.** The Stitch design project is titled "Gourmet Pizza Ordering Platform" and includes ordering UI. Alternatives (menu-only with WhatsApp ordering, or pay-on-delivery without a gateway) were offered and declined.

**Consequences.** The backend must handle carts, orders, payments, and order-state transitions from day one. Stage 4 is the largest build stage.

## ADR-002: Paystack as the payment provider

**Decision.** Paystack anchors checkout, charging in GHS via hosted/inline checkout.

**Context.** Customers are in Ghana, where mobile money (MTN MoMo, Telecel Cash, AT Money) dominates online payments; Paystack covers all three plus cards and settles in GHS. Stripe was rejected (no Ghanaian mobile money); Flutterwave and Hubtel were considered and declined.

**Consequences.** Card data never touches our servers → PCI DSS scope is SAQ-A. Fulfilment is driven by the Paystack webhook (HMAC-SHA512 verified), never by the browser redirect alone. A Paystack business account (with GHS settlement) is a launch prerequisite.

## ADR-003: Next.js + Supabase + Vercel, pinned to UK regions

**Decision.** Next.js App Router (TypeScript, strict) deployed on Vercel with serverless functions pinned to London (`lhr1`); Supabase (Postgres, Auth, RLS, Storage) in London (`eu-west-2`).

**Context.** The business requirement is UK hosting with customers served in Ghana. Region pinning satisfies UK residency for compute and data; Vercel's global CDN carries static assets close to Ghanaian users. Cloudflare Workers (better Accra edge latency, leaner e-commerce ecosystem) and a self-managed UK VPS were considered and declined.

**Consequences.** Dynamic requests pay a UK round-trip from Ghana, so the architecture leans hard on static generation/ISR for browsing surfaces and reserves dynamic work for cart/checkout/tracking.

## ADR-004: Guest checkout plus optional accounts

**Decision.** Customers can order with just a phone number and delivery details. Creating an account (Supabase Auth) is optional and unlocks history, saved addresses, and faster reorder.

**Context.** Guest flows convert better for first-time food ordering; the designed Login page is still used for the optional-account path.

**Consequences.** Guest orders need their own access control (signed, short-lived, single-order tokens — an order ID must never grant access by itself) and a merge path into an account created later with the same phone/email.

## ADR-005: Google Stitch is the design source of truth

**Decision.** All page designs originate in Stitch project `14597907360360833516` ("Gourmet Pizza Ordering Platform") and are converted from its HTML/Tailwind exports into Next.js components.

**Context.** Four coded desktop pages exist (Home, Core Menu, Special Deals, Login) plus brand/food photography assets and named deals (The Ascent, The Gathering, Party Feast, All 4 One, Free Choice). Screens not present in the project (cart/checkout, order confirmation, order tracking, account/orders — and likely About Us, which the nav references) are resolved in Stage 2 by whichever path Frank chooses under ADR-006.

**Theme (resolved 2026-08-10).** The project's design-system metadata describes a "Neon Tokyo" pink/cyan neon theme, but all four coded pages consistently use a warm ember palette (`#131313` background; peach `#ffb59e`, gold `#ffdf9e`, flame orange `#ff571a`; Metrophobic/Manrope/JetBrains Mono). Frank directed "use the stitch designs as you see them" — the ember token set of the coded pages is canonical; the metadata is stale.

**Consequences.** Stitch's Google-CDN image URLs are temporary — all imagery is downloaded and self-hosted (Supabase Storage/`public/`) during conversion. Desktop-only exports mean responsive/mobile layouts are our responsibility during Stage 3 conversion — critical, since the customer base is mobile-heavy.

## ADR-006: Design fidelity — Stitch designs are used as-is

**Decision.** (Frank, 2026-08-10, on approving Stage 1.) The Stitch designs are converted faithfully, exactly as they exist. No redesigns, no aesthetic liberties, and **no AI-generated designs or imagery** beyond the assets already in the Stitch project (or Frank's own asset folders, e.g. `D:\avalanche logo ideas`) — unless Frank explicitly instructs otherwise.

**Context.** Frank: "make sure to use the stitch designs as you see them. do not create your own designs or generate your own images unless i tell you to do so."

**Consequences.** Stage 3 conversion is pixel-faithful to the exports (responsiveness adapts layout, not look). Pages that have no Stitch design cannot be invented unilaterally — Frank chooses per gap: he designs them in Stitch himself, he authorizes generation in Stitch under the existing design system, or he authorizes composing them in code strictly from the existing pages' components and tokens. Existing project imagery is archived and reused; nothing new is generated.
