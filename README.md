# Avalanche Pizza

> Premium tasty pizza in the heart of Bechem.

Marketing and menu site for Avalanche Pizza (Bechem, Ahafo Region, Ghana). Hosted in the UK, built for Ghanaian mobile networks. Customers browse the menu and signature deals, then order by **WhatsApp** or **phone** — the shop confirms price and delivery directly in the conversation.

## Stack

- **Frontend:** Next.js (App Router, TypeScript strict), Tailwind CSS — pages converted faithfully from Google Stitch designs
- **Content:** typed menu/deal files committed in the repo, validated at build time — no database
- **Hosting:** Vercel, project region London, global CDN serving Ghana
- **Ordering:** `wa.me` deep links with pre-filled messages, plus `tel:` fallback

No cart, no checkout, no payments, no accounts — see [ADR-007](docs/DECISIONS.md#adr-007-menu-site-with-ordering-by-whatsapp-and-phone).

## Documentation

| Doc | Purpose |
| --- | --- |
| [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) | Site map, content model, WhatsApp ordering mechanism, performance and discoverability strategy |
| [docs/SECURITY.md](docs/SECURITY.md) | Threat model, controls, privacy position, launch gate |
| [docs/DECISIONS.md](docs/DECISIONS.md) | Architecture decision records, including what was descoped and why |
| [design/design-system.md](design/design-system.md) | Avalanche Elite tokens — colours, type scale, spacing, components |
| [design/](design/) | Stitch exports, page previews, and all brand imagery (self-hosted) |

## Design source

Google Stitch project *Gourmet Pizza Ordering Platform*. Four designed pages: Home, Core Menu, Special Deals, Login. Designs are used **exactly as they exist** — no invented pages, no generated imagery ([ADR-006](docs/DECISIONS.md#adr-006-design-fidelity--stitch-designs-are-used-as-is)).

## Build stages

Work proceeds in gated stages; each ends with a report the owner approves before the next begins.

1. ~~Architecture & security foundation~~ — complete, then rescoped under ADR-007
2. **Design inventory** — Stitch exports, imagery and design tokens archived *(current)*
3. **Frontend build** — the four designs → responsive, accessible Next.js pages
4. **Content & discoverability** — real menu and prices, WhatsApp links, local search, link previews
5. **Hardening & launch** — security gate, tests, performance budgets, deploy
