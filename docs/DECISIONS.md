# Architecture Decision Records — Avalanche Pizza

Decisions are recorded, not erased. When one is reversed the original stays with a **Superseded** marker so the reasoning trail survives. Revisiting any *Accepted* decision requires Frank's sign-off.

| ADR | Decision | Status |
| --- | --- | --- |
| [001](#adr-001-full-online-ordering-at-launch) | Full online ordering at launch | **Superseded by ADR-007** (2026-08-10) |
| [002](#adr-002-paystack-as-the-payment-provider) | Paystack as the payment provider | **Superseded by ADR-007** (2026-08-10) |
| [003](#adr-003-nextjs-on-vercel-pinned-to-uk-regions) | Next.js on Vercel, pinned to UK regions | **Amended** by ADR-007 (Supabase dropped) |
| [004](#adr-004-guest-checkout-plus-optional-accounts) | Guest checkout plus optional accounts | **Superseded by ADR-007** (2026-08-10) |
| [005](#adr-005-google-stitch-is-the-design-source-of-truth) | Google Stitch is the design source of truth | Accepted |
| [006](#adr-006-design-fidelity--stitch-designs-are-used-as-is) | Design fidelity — Stitch designs used as-is | Accepted |
| [007](#adr-007-menu-site-with-ordering-by-whatsapp-and-phone) | Menu site with ordering by WhatsApp and phone | **Accepted** (2026-08-10) |
| [008](#adr-008-no-database--menu-content-lives-in-the-repository) | No database — menu content lives in the repository | **Accepted** (2026-08-10) |

---

## ADR-001: Full online ordering at launch

**Status: Superseded by ADR-007 on 2026-08-10.**

**Decision.** The site launches as a complete ordering platform: menu → cart → checkout → online payment → order status tracking.

**Context.** The Stitch design project is titled "Gourmet Pizza Ordering Platform" and its title implied ordering UI. Alternatives (menu-only with WhatsApp ordering, or pay-on-delivery without a gateway) were offered and declined.

**Why it was superseded.** The premise was wrong. The Stitch project contains exactly four designed pages — Home, Core Menu, Special Deals, Login — and none of the ordering flow (cart, checkout, confirmation, tracking). Building the ordering platform would have required designs that do not exist, which collides with ADR-006. Frank chose to match the scope to the designs he actually has.

## ADR-002: Paystack as the payment provider

**Status: Superseded by ADR-007 on 2026-08-10.** No payments are taken on the site.

**Decision.** Paystack anchors checkout, charging in GHS via hosted checkout.

**Context.** Customers are in Ghana, where mobile money (MTN MoMo, Telecel Cash, AT Money) dominates online payments; Paystack covers all three plus cards and settles in GHS. Stripe was rejected (no Ghanaian mobile money); Flutterwave and Hubtel were considered and declined.

**Why it was superseded.** With no checkout there is nothing to charge. Payment is arranged directly between the shop and the customer in WhatsApp or by phone. The analysis stands and remains valid should ADR-007 ever be revisited — Paystack would still be the right provider for this market.

## ADR-003: Next.js on Vercel, pinned to UK regions

**Status: Accepted, amended by ADR-007** — the Supabase half is dropped; the Next.js/Vercel/London half stands.

**Decision.** Next.js App Router (TypeScript, strict) deployed on Vercel with the project region set to London (`lhr1`). ~~Supabase (Postgres, Auth, RLS, Storage) in London (`eu-west-2`).~~

**Context.** The business requirement is UK hosting with customers served in Ghana. Region pinning satisfies UK residency; Vercel's global CDN carries the site close to Ghanaian users. Cloudflare Workers and a self-managed UK VPS were considered and declined.

**Consequences.** Under ADR-007 the site is overwhelmingly static, so nearly every request is served from a CDN edge rather than London — the region pin now matters mainly for the small amount of build/server work and for stating a clear hosting jurisdiction. Supabase is not provisioned; there is no database (ADR-008).

## ADR-004: Guest checkout plus optional accounts

**Status: Superseded by ADR-007 on 2026-08-10.** There are no accounts and no authentication.

**Decision.** Customers can order with just a phone number and delivery details; creating an account (Supabase Auth) is optional and unlocks history, saved addresses, and faster reorder.

**Why it was superseded.** Accounts existed to serve ordering, order history, and saved addresses — all removed by ADR-007. The signed guest-order-token design and the account-merge path go with them.

**Open item.** The **Login page design still exists** in the Stitch project and now has no function. Frank decides whether to shelve it or build it as a static page against a future phase. Until he does, it is not built and not linked from the navigation.

## ADR-005: Google Stitch is the design source of truth

**Status: Accepted.**

**Decision.** All page designs originate in Stitch project `14597907360360833516` ("Gourmet Pizza Ordering Platform") and are converted from its HTML/Tailwind exports into Next.js components.

**Context.** Four coded desktop pages exist (Home, Core Menu, Special Deals, Login) plus brand and food photography. Under ADR-007 the site's scope is exactly these designs — no page is built that has no design.

**Correction (2026-08-10).** An earlier version of this ADR listed the five deals as *The Ascent, The Gathering, Party Feast, All 4 One, Free Choice*. That list was inferred from the names of image assets and is **wrong**. Verified against the rendered text of the exports, the Special Deals page carries **Party Feast (Ghc 89, was 120), The Summit (Ghc 55), Basecamp (Ghc 42), The Ascent (Ghc 33), The Gathering (Ghc 65)**, while **All 4 One (Ghc 25) and Free Choice (Ghc 23) are Core Menu products**. Full transcription in [ARCHITECTURE.md §3.5](ARCHITECTURE.md#35-the-content-as-it-stands-today), where the naming question is flagged for Frank.

**Theme (resolved 2026-08-10).** The project's design-system metadata describes a "Neon Tokyo" pink/cyan theme, but all four coded pages use the **Avalanche Elite** ember system (`#131313` background; peach `#ffb59e`, gold `#ffdf9e`, flame `#ff571a`; Metrophobic / Manrope / JetBrains Mono). Frank directed "use the stitch designs as you see them" — Avalanche Elite is canonical and the Neon Tokyo metadata is stale. Tokens archived at [`design/design-system.md`](../design/design-system.md).

**Consequences.** Stitch's Google-CDN image URLs are temporary — all imagery has been downloaded to `design/assets/` and is self-hosted. The exports are desktop-only, so responsive/mobile layouts are our responsibility during conversion — critical, since the customer base is mobile-heavy.

## ADR-006: Design fidelity — Stitch designs are used as-is

**Status: Accepted.**

**Decision.** (Frank, 2026-08-10.) The Stitch designs are converted faithfully, exactly as they exist. No redesigns, no aesthetic liberties, and **no AI-generated designs or imagery** beyond the assets already in the Stitch project (or Frank's own asset folders) — unless Frank explicitly instructs otherwise.

**Context.** Frank: "make sure to use the stitch designs as you see them. do not create your own designs or generate your own images unless i tell you to do so."

**History.** This ADR was breached in spirit on the day it was written: seven ordering-flow screens were queued for AI generation in Stitch after a question that offered generation as the recommended option. All seven generations failed at the Stitch API and **nothing was created** — the project was verified byte-for-byte unchanged and the draft prompts were deleted. The episode is recorded here because it produced ADR-007: rather than generate the missing designs, the scope was matched to the designs that exist.

**Consequences.** Conversion is pixel-faithful (responsiveness adapts layout, not look). A page with no Stitch design is not built. If a future phase needs a new page, Frank designs it or explicitly authorizes how it is produced.

## ADR-007: Menu site with ordering by WhatsApp and phone

**Status: Accepted (Frank, 2026-08-10).** Supersedes ADR-001, ADR-002 and ADR-004; amends ADR-003.

**Decision.** Avalanche Pizza launches as a **marketing and menu site**. Every ordering call-to-action opens **WhatsApp** with a pre-filled message naming the item or deal, with a **phone call** link as a co-equal fallback. The shop confirms price, delivery, and payment directly with the customer in that conversation. The site itself takes no orders and no money.

**Context.** Frank's designs cover four pages and stop short of the ordering flow. Rather than invent the missing screens (forbidden by ADR-006) or stall the project waiting for them, the product is scoped to what is designed. This also matches how food ordering already works in Bechem — WhatsApp and phone are the established channels, and the shop keeps direct contact with its customers.

**Consequences.**
- Removed: cart, checkout, payments, accounts, order records, order tracking, admin order management, and the entire server-side backend that supported them.
- The shop's WhatsApp number becomes a **security-critical value** — if it is ever changed maliciously or by mistake, customers' orders and money go elsewhere. It is pinned in configuration and verified in CI (see `docs/SECURITY.md`).
- Prices shown on the site are **indicative until confirmed in chat**; this must be stated on the site.
- PCI DSS leaves scope entirely; the site stores no personal data, which collapses the privacy surface.
- Success is measured in WhatsApp conversations started, not checkouts completed — so discoverability (local search, link previews when the site is shared in WhatsApp) matters more than conversion plumbing.
- The growth path to real online ordering is preserved in the component and content boundaries, but is explicitly a future phase requiring new designs from Frank.

## ADR-008: No database — menu content lives in the repository

**Status: Accepted (2026-08-10).** Consequence of ADR-007.

**Decision.** The menu, deals, and shop details are typed content files committed to the repository, validated at build time. No database, no CMS, no Supabase at launch.

**Context.** With no orders and no accounts, the only data the site needs is content the shop controls. A database for a menu that changes occasionally is cost and operational burden without benefit; static content also makes the whole site cacheable, which directly serves the Ghana bandwidth constraint.

**Consequences.** A price change is a file edit that auto-deploys — fast and fully version-controlled, but it does route content edits through a developer or through GitHub's web editor. If that friction proves real, the documented upgrade path is a lightweight git-backed CMS, which requires no change to the site's architecture.
