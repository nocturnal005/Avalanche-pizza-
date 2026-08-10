# Avalanche Elite — canonical design system

Archived verbatim from Stitch (`assets/80bf042990d347c4b895cbe5c911843f`, the design system attached to project `14597907360360833516`) on 2026-08-10. This is the token source of truth for Stage 3 (`globals.css` / Tailwind theme). Per ADR-005/ADR-006 it matches the four coded pages exactly.

## Brand voice

Power, rebirth, high-end culinary excellence — phoenix-inspired. Minimalist with a high-contrast/bold edge; dark-mode first, where fiery gradients act as the light source. "Density is the enemy of Luxury": generous negative space, wide-tracked typography, cinematic imagery with 60% black overlays.

## Colors

| Token | Value | Token | Value |
| --- | --- | --- | --- |
| background / surface / surface-dim | `#131313` | on-background / on-surface | `#e5e2e1` |
| surface-container-lowest | `#0e0e0e` | surface-container-low | `#1c1b1b` |
| surface-container | `#201f1f` | surface-container-high | `#2a2a2a` |
| surface-container-highest / surface-variant | `#353534` | surface-bright | `#393939` |
| **primary** | `#ffb59e` | on-primary | `#5e1700` |
| **primary-container** (CTA) | `#ff571a` | on-primary-container | `#521300` |
| **secondary** | `#ffdf9e` | secondary-container | `#fabd00` |
| tertiary | `#ffb4a8` | tertiary-container | `#fb5945` |
| outline | `#ad897e` | outline-variant | `#5c4037` |
| error | `#ffb4ab` | error-container | `#93000a` |
| on-surface-variant | `#e6beb2` | surface-tint | `#ffb59e` |

Seed/override intent: primary `#ff4d00`, secondary `#ffc107`, tertiary `#8b0000`, neutral `#121212`. Gradients sweep primary → secondary ("wood-fired oven glow").

## Typography

| Level | Family | Size | Weight | Tracking | Line height |
| --- | --- | --- | --- | --- | --- |
| display-lg | Metrophobic | 48px | 400 | 0.15em | 1.1 |
| headline-lg | Metrophobic | 32px | 400 | 0.1em | 1.2 |
| headline-lg-mobile | Metrophobic | 24px | 400 | 0.08em | 1.2 |
| body-lg | Manrope | 18px | 400 | 0.02em | 1.6 |
| body-md | Manrope | 16px | 400 | 0.01em | 1.6 |
| label-caps | JetBrains Mono | 12px | 500 | 0.2em | 1 |

Headlines always uppercase with generous tracking — never tight.

## Layout & spacing

8px unit; container max 1280px; gutter 24px; margins 16px mobile / 64px desktop; 64px+ vertical padding between major sections; 12-column fluid grid (4-column on mobile), asymmetric/editorial placement encouraged.

## Depth & shape

No traditional shadows: tonal layers (`#0e0e0e → #353534`), faint primary-tinted glows (10–15% opacity) on high-importance elements, 1px `#2a2a2a` outlines. Sharp corners (the system's stated intent is 0px; the coded pages ship Tailwind's 0.25rem default — treat 0–4px as the sanctioned range, matching the pages).

## Components (as specified by the system)

- **Buttons:** primary = solid primary-container fill, uppercase wide-tracked label, sharp corners; secondary = ghost with 1px primary border.
- **Cards:** `#121212`–`#1e1e1e` surfaces, optional 1px `#2a2a2a` stroke, full-bleed imagery.
- **Inputs:** dark fill, underline or 1px `#2a2a2a` border; focus = primary border + subtle glow.
- **Chips/tags:** rectangular, label-caps, dark background with primary text.
- **Navigation:** minimalist top bar; Metrophobic uppercase high-tracking links; active state = thin primary line *above* the text.

## Other design systems in the project (unused)

`Neon Tokyo` (stale project-level metadata), `Alexandria`, `Bauhaus`, `Corporate Modern` — all hidden on the canvas; not part of the shipped design. Do not use.
