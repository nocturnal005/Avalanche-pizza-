# Avalanche Pizza — Security & Privacy Foundation

| | |
|---|---|
| **Status** | Draft v2.0 for owner approval. **Supersedes v1.0** (the payments-era document) in full. |
| **Scope** | Static marketing and menu site: Next.js App Router (TypeScript) built to static/ISR output on Vercel (`lhr1`, London), content committed as typed files in the repo, imagery self-hosted from the repo/Vercel CDN, frontend converted from Google Stitch HTML/Tailwind exports. Customers in Bechem & environs, Ghana. Prices in GHS. |
| **Out of scope** | Payments of any kind, customer accounts, databases, admin surfaces, in-shop/physical security, rider operations, the content of WhatsApp conversations after handoff (covered only for privacy duties, §4). |
| **Location** | `docs/SECURITY.md`. Any PR touching headers, DNS, the shop contact config, CI workflows, or dependencies must name the control IDs it affects. |
| **Companion decisions** | Recorded in [`DECISIONS.md`](DECISIONS.md): **ADR-007** (descope to menu + WhatsApp ordering) and **ADR-008** (no database) supersede ADR-001, ADR-002 and ADR-004. ADR-003 (Next/Vercel, UK region), ADR-005 and ADR-006 (Stitch fidelity) still stand. |
| **Open question carried forward** | Corporate structure (UK entity, Ghana entity, or both). §4 resolves what to do under each. |

The descope is not a trim of the old document — it inverts the risk picture. The old model was built around a database holding customer PII and a payment flow where money moved on our infrastructure. Neither exists now. **The site takes no input, stores nothing, and authenticates nobody.** What remains worth defending is the integrity of what we *publish* — above all, the phone number customers are told to trust.

Three invariants follow, and everything below is an expression of one of them:

1. **The build output is the product.** Security is about controlling what ends up in the deployed HTML, and proving nothing else did.
2. **The shop's WhatsApp number is the single highest-value byte string in this repo.** Changing it silently redirects revenue to a stranger. It must be tamper-evident, not merely correct.
3. **Control of the domain and the deploy accounts is control of the business's online identity.** There is no data to steal; the theft available is of trust.

---

## 1. What we hold and what we do not

### 1.1 Assets, current

| Asset | Where it lives | Why it matters | Loss looks like |
|---|---|---|---|
| **Domain registration + DNS** | Registrar account; DNS at registrar or Vercel | The entire identity. Whoever controls DNS controls what "Avalanche Pizza" resolves to. | Customers reach an attacker's site with an attacker's number |
| **Shop WhatsApp / phone number** | `src/config/shop.ts` in the repo; rendered into every page | This *is* the ordering channel. It is the only thing on the site that moves money. | Orders and payments go to a fraudster; we never find out |
| **Vercel account / project** | Vercel (team or personal) | Deploy authority. Can replace the live site in seconds. | Defacement, silent content swap |
| **GitHub account / repo** | `nocturnal005/Avalanche-pizza-` | The source of every deploy. | Same as above, plus persistence |
| **Repo contents** — menu, prices, hours, imagery, Stitch conversions | Committed files | Business-accurate published information | Wrong prices, wrong hours, brand damage |
| **Google Business Profile, Facebook/Instagram** | Google/Meta | Off-site copies of the same number and address. Google accepts *public* suggested edits. | The number changes somewhere we don't control and don't monitor |
| **Brand reputation** | Everywhere | For a single-location shop in a town, reputation is the whole asset. | Phishing clone, defacement, or a scam traced back to "your website" |

### 1.2 What we deliberately do not hold

No customer names, phone numbers, or addresses. No order records. No accounts, passwords, sessions, or identity cookies. No database, no Supabase project, no service-role key. No payment credentials, card data, or mobile-money tokens. No webhooks, no admin panel, no server-side write path of any kind. No secrets in the runtime environment beyond what Vercel needs to build.

### 1.3 Contrast with the payment-taking design

The superseded document defended: a Postgres database of Ghanaian MSISDNs and delivery addresses; a Supabase service-role key that bypassed RLS; a Paystack secret key that doubled as the webhook HMAC key; a guest-order token signing secret; admin sessions; and a server-side price computation path that had to be untrusting of every client byte. **Every one of those is gone.** A breach then meant customer harm at scale — harassment, targeted MoMo fraud, refund fraud. A breach now means the wrong content is published. That is a serious but categorically smaller and more recoverable event, and the control budget should follow.

---

## 2. Threat model, proportionate

Ranked by expected loss to this business, not by CVSS.

| # | Threat | Realism | Answered by |
|---|---|---|---|
| **T1** | Domain/DNS hijack, domain expiry, or takeover of the Vercel/GitHub account | Low likelihood, catastrophic and total. Expiry is the most common real-world cause. | C1, C2 |
| **T2** | **WhatsApp/phone number tampering** — by an attacker with repo or dashboard access, a compromised dependency, or an honest bad merge | The single most business-specific risk. Highest expected loss per unit of likelihood. | C3 |
| **T3** | Script injection via the Stitch conversion — the exports are untrusted third-party HTML containing remote and inline scripts | Certain to be attempted by accident; the raw exports *already* fail the policy | C4, C5 |
| **T4** | Supply-chain compromise of an npm package or a GitHub Action, injecting a skimmer, beacon, or link rewriter | Low-moderate; the industry's most active injection vector | C6, C7, C5 |
| **T5** | Brand impersonation — a phishing clone or typosquat presenting a different number | Moderate and cheap for an attacker; small local businesses are soft targets | C8 |
| **T6** | Defacement via a leaked deploy credential | Low, if we never create a deploy credential | C2, C7, C9 |
| **T7** | Availability during Friday/Saturday peak | Low impact — see below | C9, C10 |

### T1 — Domain, DNS, and account takeover *(now the top risk)*

With no database to steal, an attacker's cheapest path to profit is to become us. Repointing DNS, or logging into Vercel, gives a complete, instant, believable replacement of the site with an identical one carrying the attacker's WhatsApp number. Customers would have no signal. **The most likely variant is not an attack at all: an unpaid renewal notice to an unmonitored inbox, the domain lapses, and a drop-catcher registers it.** Controls: C1 (DNS hygiene), C2 (account security).

### T2 — WhatsApp number tampering *(the risk this business actually has)*

This deserves depth because it is the only attack that converts directly into stolen cash, and because it is *quiet*. The site keeps working. Analytics look normal. Uptime is green. Revenue simply falls, and the shop discovers it days later from a customer who paid a stranger.

Attack paths, all of which must be closed:

- **Repo write access** — an attacker with a stolen GitHub token, or a malicious contributor, edits the number in one file. Reviewers skim a one-character diff.
- **Bad merge / honest error** — the number is duplicated across a header, a footer, a floating button, a contact page and a JSON-LD block; someone updates four of five.
- **Compromised dependency** — a build-time package or a Babel/PostCSS/SWC plugin rewrites `wa.me` hrefs in the output. **The source is clean; the deployed HTML is not.** This is why source-level review is insufficient on its own.
- **Vercel-side change** — a rewrite, redirect, or environment variable altered in the dashboard, bypassing git entirely.
- **Off-site copies** — Google Business Profile accepts public "suggest an edit" to a phone number, and Meta profiles carry the number too. The site can be perfect while Google shows a fraudster's line.
- **Takeover of the number itself** — a SIM swap on the shop's line lets an attacker re-register WhatsApp on their own device. The link on our site would be correct and still deliver customers to the attacker.

The design principle is that **no single compromised thing can move the number without something loud failing.** Realised in C3.

### T3 — XSS via the Stitch conversion

The site renders no user input, so classic reflected/stored XSS has no source. The genuine risk is that the *conversion input is untrusted*: each export in `design/stitch-exports/` currently contains `<script src="https://cdn.tailwindcss.com">` (a remote runtime script), an inline `<script id="tailwind-config">`, inline `<style>` blocks, and — in `login.html` — an `onsubmit=` handler. Across the four files there are **58 inline `style="…"` attributes, 9 `background-image: url(…)` declarations, 45 `lh3.googleusercontent.com` image URLs and `fonts.googleapis.com` references.** Copy-pasting any of that into a component ships a third-party script execution context and third-party network calls into production. Controls: C4 (sanitization rules), C5 (CSP + build-output assertions).

### T4 — Supply chain

The realistic payload against a site like this is not data theft — there is nothing to steal — it is a **link rewriter** (T2 by another route) or an **exfiltration beacon** to make the site's traffic monetisable. Both are visible in build output. C5's origin allowlist and C3's link assertion catch both; C6 and C7 reduce the chance of getting there.

### T5 — Brand impersonation and typosquatting

Cheap, common against local businesses, and outside our technical control: a cloned site on a near-miss domain, or a Facebook page using our photos, both listing a different number. We cannot prevent it; we can make the real thing verifiable and shrink the obvious squat space. Control: C8.

### T6 — Defacement via leaked deploy credential

Best answered by **not having one**: Vercel's GitHub integration deploys without any token stored in the repo or in Actions secrets. If no `VERCEL_TOKEN` exists, it cannot leak. Detection and recovery in C9.

### T7 — Availability at peak

Honestly rated **low impact**, and saying so is the point of a proportionate model: **ordering does not depend on this site being up.** If the site is unreachable on a Saturday evening, customers who already have the number still order. A static site on Vercel's CDN is close to the most available thing we could build. The realistic availability risks are (a) Ghanaian mobile network conditions, which we address by keeping the page small — a performance budget, not a firewall; (b) a bandwidth-drain attack that costs money rather than uptime. Control: C10.

### 2.1 Explicitly not applicable

Stated so nobody re-imports a control from the old document without a reason.

| Classic risk | Status | Why |
|---|---|---|
| SQL injection | **N/A** | No database, no query layer, no Supabase project. Content is typed TypeScript compiled into the build. |
| IDOR / broken object-level authorization | **N/A** | No objects, no identifiers, no per-record access decisions. Every URL serves the same public page to everyone. |
| Price / cart tampering | **N/A** | Prices are *display text*, not a transaction input. Nothing computes a total; the real total is agreed in chat. Editing the page in DevTools changes nothing a customer can spend. |
| Webhook forgery (HMAC verification) | **N/A** | No webhooks, no inbound endpoints, no payment provider. |
| Session theft / CSRF / cookie security | **N/A** | No sessions, no cookies, no state-changing requests. There is no authenticated action to forge. |
| Credential stuffing / account takeover (customer) | **N/A** | No customer accounts. `login.html` from Stitch **must not be converted** (see C4). |
| PII breach at scale | **N/A** | We store no personal data. Server logs (§4.1) are the only personal data touching our stack. |
| Rate limiting / bot abuse / CAPTCHA | **N/A** | No expensive or state-changing endpoint to abuse. Scraping a public menu is not a threat. |
| **PCI DSS** | **Entirely out of scope** | See §2.2. |

### 2.2 PCI DSS is out of scope — plainly

**PCI DSS does not apply to Avalanche Pizza's website.** PCI DSS applies to entities that **store, process, or transmit cardholder data**, or that can affect its security. This site does none of those things: there is no payment page, no payment form, no hosted-checkout redirect, no iframe, no payment JavaScript SDK, no card fields, and no payment provider integration at all. The site is a menu. It cannot even reach a Self-Assessment Questionnaire, because SAQ A — the lightest tier, which the superseded design targeted — presupposes an e-commerce channel that outsources card handling. **We have no e-commerce channel.** Mobile money is likewise absent, and in any case MoMo is not card data and sits under Bank of Ghana rules rather than PCI.

**What would drag PCI back into scope** — treat each of these as requiring a new security review before it ships:

1. Adding any **payment button or link** on the site that sends a customer to a hosted checkout (Paystack, or a "pay now" link) — this creates an e-commerce payment channel; **SAQ A** applies.
2. **Embedding** any payment iframe, inline checkout, or payment-provider JavaScript into our pages — our page then influences the payment form; **SAQ A-EP** applies, and our CSP and script integrity become PCI controls.
3. Collecting card details in **any** form field we control — **SAQ D**, and a materially different document.
4. Taking a card number **over the phone or in WhatsApp chat** and typing it into anything — MOTO acceptance, which pulls the shop's phone/chat channel and the staff device into scope.
5. Storing card numbers, expiry dates, or CVV in **any** form — including a photo of a card in a WhatsApp thread, a note on the shop phone, or a spreadsheet.

Item 5 is the realistic one and it is an operational rule, not a technical one: **staff must never accept card details by chat or phone.** Cash and MoMo on delivery/collection, arranged in chat, keep this permanently out of scope.

---

## 3. Controls

Each names its mechanism and where it lives.

### C1 — DNS and domain hygiene *(answers T1)*

At the registrar, before launch:

- **Registrar lock on**: `clientTransferProhibited` and `clientUpdateProhibited`.
- **Auto-renew on**, with a valid payment method, **plus** a calendar reminder at 60/30/7 days. Auto-renew fails silently when a card expires.
- **Registrant email must not be on this domain** (no circular lockout) and must itself be MFA-protected.
- **WHOIS privacy on**, but registrant contact details kept accurate — a mismatch complicates recovery.
- **DNSSEC enabled** where the registrar and DNS host both support it. If the DNS host does not, that alone justifies moving DNS to one that does.
- **CAA records** restricting issuance to the CA Vercel currently uses for custom domains (Let's Encrypt). Verify the current CA list in Vercel's docs before publishing — **a wrong CAA record silently breaks certificate renewal**, which is a self-inflicted outage.
- **Mail records, even though we send and receive no mail** — this stops anyone spoofing `orders@` or `info@` at our domain to phish our customers:

```dns
@                 MX    0 .                                    ; RFC 7505 null MX: this domain receives no mail
@                 TXT   "v=spf1 -all"                           ; and sends none
*._domainkey      TXT   "v=DKIM1; p="                           ; no valid DKIM keys exist
_dmarc            TXT   "v=DMARC1; p=reject; adkim=s; aspf=s; rua=mailto:<monitored-inbox>"
```

If the shop later starts sending mail, all four change together — that is a reviewed change, not an incidental one.

- **Canonical host**: pick apex or `www`, 308-redirect the other. Two live hostnames is two things to keep correct.

### C2 — Accounts and MFA *(answers T1, T6)*

MFA on **every** account that can change what customers see: **domain registrar, Vercel, GitHub, Google Business Profile, and the Meta/Facebook business account.**

- **Prefer a hardware security key or a TOTP app. Do not use SMS 2FA.** SIM swap is a live risk on Ghanaian mobile networks, and SMS 2FA makes every one of these accounts only as strong as the shop's SIM.
- **WhatsApp two-step verification PIN enabled** on the shop's WhatsApp Business account. This is the control that stops a SIM swap becoming a WhatsApp takeover — without it, an attacker who swaps the SIM receives customers' orders directly, and our correct `wa.me` link delivers them.
- Recovery codes for each account printed and stored physically at the shop, off any device.
- GitHub: **branch protection on `main`** — require a pull request, require the CI checks in C3/C5 to pass, require code-owner review, block force-push and deletion.
- Vercel: production deploys only from `main` via the GitHub integration; every human member on their own account with 2FA; enforce team-level 2FA where the plan allows.
- Named owner accounts only. No shared logins; a shared password cannot be revoked when a member leaves.

### C3 — WhatsApp number integrity *(answers T2 — the centrepiece)*

Five layers, each independent. A single compromise breaks at most one.

**(a) One source of truth.** The number exists in exactly one file:

```ts
// src/config/shop.ts — the ONLY place the shop's contact numbers exist.
export const SHOP = {
  /** wa.me form: country code, digits only — no '+', no leading zero */
  whatsappE164: "233XXXXXXXXX",
  /** tel: form */
  telE164: "+233XXXXXXXXX",
  /** what customers see, so a human can eyeball it against the link */
  displayPhone: "0XX XXX XXXX",
} as const;
```

No other file may contain a `wa.me`, `tel:`, or `+233` literal. Enforced by an ESLint `no-restricted-syntax` rule plus a CI grep over `src/`. Every link — header, footer, floating button, contact page, JSON-LD — derives from this object. The rendered link must sit **next to the visible number** (`displayPhone`), so a customer or staff member can see a mismatch without tooling.

**(b) A pinned assertion that a config edit alone cannot satisfy.**

```ts
// tests/shop-number.pin.test.ts — CODEOWNERS-protected
it("the shop number has not moved", () => {
  expect(SHOP.whatsappE164).toBe("233XXXXXXXXX");
  expect(SHOP.telE164).toBe("+233XXXXXXXXX");
  expect(SHOP.displayPhone.replace(/\D/g, "")).toBe("0" + SHOP.whatsappE164.slice(3));
});
```

Changing the number now requires editing **two** files, both code-owned. A legitimate change is a deliberate, reviewed act.

**(c) Code-owner review.** In `.github/CODEOWNERS`:

```
/src/config/shop.ts            @nocturnal005
/tests/shop-number.pin.test.ts @nocturnal005
/.github/workflows/            @nocturnal005
/package-lock.json             @nocturnal005
```

with "require review from Code Owners" enabled in branch protection.

**(d) Build-output assertion — catches what source review cannot.** Runs in CI after `next build`, over the generated HTML. This is the layer that catches a compromised dependency rewriting links:

```bash
# .github/workflows/ci.yml — assert every contact link in the OUTPUT is ours
FOUND=$(grep -rhoE 'https://wa\.me/[0-9]+|tel:\+?[0-9]+' "$BUILD_DIR" | sort -u)
echo "$FOUND"
[ -n "$FOUND" ] || { echo "FAIL: no contact links in build output"; exit 1; }
echo "$FOUND" | grep -qvE "^(https://wa\.me/233XXXXXXXXX|tel:\+233XXXXXXXXX)$" \
  && { echo "FAIL: unexpected contact link above"; exit 1; }
exit 0
```

Note it fails both ways: on a wrong number **and** on zero links (a conversion that quietly dropped the ordering button).

**(e) Post-deploy smoke check, with the oracle held outside the repo.** A workflow step after production deploy — and the same job on a daily `schedule:` cron — fetches the live homepage and contact page and asserts the rendered links. **The expected number comes from a GitHub Actions secret (`EXPECTED_WA_NUMBER`), not from the repo**, so an attacker with repo write access cannot move the number and the check that guards it in one pass. The daily run also catches a change made entirely outside git — a Vercel dashboard rewrite, or a rogue deploy.

```bash
for PATH_ in / /contact; do
  HTML=$(curl -fsSL "https://$PROD_DOMAIN$PATH_")
  echo "$HTML" | grep -q "https://wa.me/$EXPECTED_WA_NUMBER" || { echo "FAIL $PATH_: expected link absent"; exit 1; }
  echo "$HTML" | grep -oE 'https://wa\.me/[0-9]+' | sort -u \
    | grep -qv "^https://wa.me/$EXPECTED_WA_NUMBER$" && { echo "FAIL $PATH_: foreign wa.me link"; exit 1; }
done
```

**(f) The off-site copies.** Monthly, the owner checks the number shown on **Google Business Profile** (which accepts public suggested edits), Facebook, and Instagram. Turn on Google Business Profile edit notifications. This is a calendar task, not a technical control, and it closes the gap that all of (a)–(e) leave open.

**Link hygiene**: any `?text=` prefill must be URL-encoded and must contain no customer-supplied content; external links carry `rel="noopener noreferrer"`.

### C4 — Stitch export sanitization *(answers T3)*

Rules for the Stage 3 conversion. The exports in `design/stitch-exports/` are **reference material, never source.** Nothing is copy-pasted; markup is retyped as components while preserving the ember token set per ADR-006.

| Found in the exports | Rule |
|---|---|
| `<script src="https://cdn.tailwindcss.com">` | **Delete.** Tailwind is a build-time dependency; the Play CDN is a remote script that compiles at runtime. |
| `<script id="tailwind-config">` (inline) | **Delete.** Move the theme tokens into `tailwind.config.ts`. |
| `onsubmit=`, and any `on*=` handler | **Delete.** No inline handlers reach production. |
| `https://fonts.googleapis.com` (11 refs across the four pages) | **Delete.** Load Metrophobic / Manrope / JetBrains Mono via `next/font/google`, which downloads and self-hosts at build time — zero runtime requests to Google. Both a CSP and a privacy fix (§4.4). |
| `lh3.googleusercontent.com` image URLs (45 total) | **Delete.** These are temporary Google CDN URLs. Serve the archived files already in `design/assets/` from `public/`. Keep `images.remotePatterns` **empty** in `next.config.ts` so no remote image can be introduced later without an explicit, reviewed config change. |
| 58 × inline `style="…"` attributes | Convert to Tailwind utilities. They are static values from Stitch. |
| 9 × `background-image: url(…)` | Convert to `next/image` or a Tailwind class over a local asset. |
| Inline `<style>` blocks (keyframes, scrollbar, `@layer base`) | Move into the global stylesheet or `@layer` in Tailwind's entry CSS. |
| `login.html` | **Do not convert.** There are no accounts. Converting it would create a credential-collecting form with nothing behind it — a phishing surface we built ourselves. |
| Any form element | None ship. `form-action 'none'` in C5 enforces this. |

A CI grep over `src/` fails the build on `cdn.tailwindcss.com`, `googleusercontent.com`, `fonts.googleapis.com`, or an `on[a-z]+=` attribute in JSX.

### C5 — Security headers and CSP *(answers T3, T4)*

In `next.config.ts` under `headers()`, applied to all routes, with `poweredByHeader: false`:

```
Content-Security-Policy:
  default-src 'none';
  base-uri 'none';
  script-src 'self' <pinned sha256-… for framework inline bootstrap>;
  style-src 'self' 'unsafe-inline';
  img-src 'self' data:;
  font-src 'self';
  connect-src 'self';
  manifest-src 'self';
  form-action 'none';
  frame-ancestors 'none';
  object-src 'none';
  upgrade-insecure-requests

Strict-Transport-Security: max-age=63072000; includeSubDomains; preload
X-Content-Type-Options: nosniff
Referrer-Policy: no-referrer
X-Frame-Options: DENY
Permissions-Policy: camera=(), microphone=(), geolocation=(), payment=(), usb=()
Cross-Origin-Opener-Policy: same-origin
Cross-Origin-Resource-Policy: same-origin
```

Notes that matter for this stack:

- **`headers()` only works because we build to Vercel's standard static/ISR output.** If the build ever switches to `output: 'export'`, `headers()` is silently ignored and the whole policy must move to `vercel.json`. Treat that as a reviewed change.
- **`Referrer-Policy: no-referrer`** rather than the usual `strict-origin-when-cross-origin`: we have no analytics that need referrers, and it means tapping the WhatsApp button does not tell Meta which page the customer came from.
- **The Tailwind/Stitch inline-style tension, resolved honestly.** C4 removes all 58 inline `style` attributes from our own markup, but `style-src 'self'` alone is still not achievable: `next/image` sets inline `style` on the elements it renders, and CSP hashes do not apply cleanly to style *attributes* (`style-src-attr` would need `'unsafe-hashes'`). So we accept `style-src 'self' 'unsafe-inline'` — **and it is acceptable here for a specific reason, not by resignation.** The danger of inline CSS is exfiltration via attribute selectors that trigger a network fetch; with `img-src 'self' data:`, `font-src 'self'`, `connect-src 'self'` and `default-src 'none'`, **there is nowhere for CSS to send anything.** The exfiltration channel is closed at the destination rather than at the source. We do not extend the same tolerance to `script-src`.
- **`script-src 'self'` and the framework's inline bootstrap.** Next's App Router emits inline scripts (the streamed RSC payload) into prerendered HTML, so bare `script-src 'self'` will block hydration. A per-request nonce is not an option — a nonce forces dynamic rendering and defeats CDN caching, which is exactly what a Ghana-to-London site cannot afford. The resolution is a **committed hash allowlist with a CI drift check**: a post-build script extracts the SHA-256 of every inline script in the output, and CI diffs it against a committed `csp-hashes.txt`. Drift fails the build. This does double duty — **a dependency injecting a skimmer changes the hash set, so the CSP pin is also a supply-chain canary.** If a route needs no interactivity at all, ship it with no client component and it contributes no hashes.
- **Origin allowlist over build output** (the T4 catch-all). CI extracts every absolute URL from the built HTML/CSS/JS and fails on anything outside `{ https://wa.me, https://<our-domain> }`. This catches leftover Stitch URLs, an injected beacon, and a link rewriter in one check.
- **HSTS preload**: set the header at launch, but **submit to hstspreload.org only after confirming every subdomain serves HTTPS.** Preload removal takes months.
- Ship the CSP in `Content-Security-Policy-Report-Only` for the first preview deployment, read the violations, then enforce. Do not launch in report-only mode.

### C6 — Dependencies *(answers T4)*

- **Keep the dependency count small and justify additions in the PR.** A menu site needs almost nothing; every package is attack surface with no offsetting benefit.
- `package-lock.json` committed; CI uses `npm ci` only. Lockfile is code-owned (C3c) — a lockfile-only diff is exactly what a supply-chain attack looks like.
- Renovate or Dependabot with grouped, scheduled PRs; security updates applied promptly, feature bumps batched.
- `npm audit --omit=dev` runs in CI as a **reported signal**, not a hard gate — a transitive dev-only advisory should not block a menu correction on a Friday evening.
- Prefer packages without install scripts; run CI installs with `--ignore-scripts` where the build tolerates it.
- Enable GitHub secret scanning and **push protection** on the repo.

### C7 — GitHub Actions discipline *(answers T4, T6)*

- **Pin every action to a full commit SHA**, not a tag — tags are mutable and are the standard action-compromise vector: `uses: actions/checkout@<40-char-sha>  # v4.2.2`.
- Default `permissions: contents: read` at workflow level; widen per job only where needed.
- **Never use `pull_request_target`.** It runs with a writable token and access to secrets in the context of untrusted PR code.
- No secrets exposed to workflows triggered by fork PRs. `EXPECTED_WA_NUMBER` (C3e) is scoped to the post-deploy and scheduled jobs only.
- Third-party actions minimised; prefer a five-line `run:` step over an action for anything trivial.

### C8 — Brand and impersonation *(answers T5)*

- **Claim and verify** the Google Business Profile, Facebook page, and Instagram handle; MFA on each (C2); edit notifications on.
- **Register the two or three most obvious near-miss domains** (common misspellings, and the `.com` / `.com.gh` pair) and 308-redirect them to the canonical host. A few cedis a year removes the cheapest impersonation.
- A short **"How to know it's really us"** block on the contact page: the exact domain, the exact number, and a plain statement that *we never ask for card details, PINs, or MoMo approval codes, on the site or in chat.* This is the one line that protects customers against a clone we never find.
- If a clone appears: report to Google Safe Browsing, the clone's host and registrar, and Meta if it is a page; post the correct details on the real profiles.
- Verified WhatsApp Business profile carrying the business name and Bechem address, so the customer sees a matching identity the moment they land in chat.

### C9 — Least-privilege deploys, detection, and recovery *(answers T6)*

- **Create no deploy credential.** Vercel's GitHub integration deploys with no token stored anywhere. If `VERCEL_TOKEN` never exists, it cannot leak. Any future need for one requires justification in a PR.
- Production deploys only from `main`. Preview deployments carry Deployment Protection where the plan allows, and must be `noindex` regardless — verify, don't assume.
- **Deployment notifications on** (email/Slack) so an unexpected production deploy is noticed within minutes. An unannounced deploy is the earliest signal of T6.
- **Recovery, rehearsed once before launch**: promote the last known-good Vercel deployment (deployments are immutable, rollback is near-instant), then rotate GitHub and Vercel credentials, then re-run the C3d/C3e checks before declaring it clean. Rollback first, investigate second.

### C10 — Monitoring and availability *(answers T7)*

- **Uptime check every 5 minutes** (UptimeRobot / Better Stack free tier) against the homepage, configured with a **keyword assertion on the shop's phone number** — so the same monitor that catches downtime also catches a silent content swap. This is the cheapest overlap between C3 and C10 and should be set up as one thing.
- Subscribe to Vercel's status page.
- **Set a spend limit and usage alerts** where the plan offers them. For a small business the realistic denial-of-service is a bandwidth bill, not an outage.
- Keep the performance budget tight — self-hosted subset fonts, compressed images, minimal client JS. On Ghanaian mobile data this is the difference between a usable menu and an abandoned one, and it is also why the site has no third-party scripts to compromise.
- Optional and cheap: `/.well-known/security.txt` with a contact address, so someone who notices a defacement has somewhere to report it.

---

## 4. Privacy and compliance, right-sized

### 4.1 What we actually process

Three things, and only three:

1. **Server and CDN access logs** — IP address, user agent, URL, timestamp, generated by Vercel. **IP addresses are personal data**, so this is processing, however minimal. Vercel is our **processor**; its DPA governs it. Purpose: operating and securing the site. Lawful basis: legitimate interests. Retention: Vercel's platform defaults — we neither export nor extend them.
2. **Analytics**, if enabled — see §4.4.
3. **The WhatsApp / telephone handoff** — see §4.3.

Nothing else. No forms, no accounts, no cookies, no local storage of customer data, no server-side records.

### 4.2 Which law leads, and do we need a privacy notice

**UK GDPR applies if — and largely because — there is a UK establishment.** Hosting in London does not by itself make UK GDPR apply; the tests are establishment in the UK, or offering goods and services to people in the UK. Customers are in Bechem. So:

- **If a UK entity exists** (the open question carried from `DECISIONS.md`): UK GDPR applies to processing in the context of that establishment, and it leads.
- **If the business is Ghanaian only**: **Ghana's Data Protection Act 2012 (Act 843) is the primary regime**, and UK GDPR is not directly engaged — but we align to UK GDPR anyway, because it is the stricter of the two and because our processor contracts (Vercel) are UK/EU-shaped. Nothing in this section changes if the answer changes; that is deliberate.

**A privacy notice is still required.** Two independent reasons: the transparency duty attaches to *any* processing of personal data, and server logs are processing; and Act 843 and Act 772 impose their own disclosure duties (§4.5, §4.6). A site that stores nothing still needs a page that says so.

It should be short — a page, not a policy library — and must state: **who the controller is** (legal name, Bechem address, a contact route); **that the site collects no personal data directly** — no forms, no accounts, no cookies; **that server logs including IP addresses are processed by Vercel for operating and securing the site**, under legitimate interests, retained per Vercel's defaults; **what analytics is in use, or that none is**; **the WhatsApp handoff** (§4.3); **that data is hosted in the United Kingdom**; and **how to contact us about your data**. Written plainly, in English, and honest about how little there is.

### 4.3 The WhatsApp handoff — the key disclosure

This is the most important sentence in the privacy notice, because it is the moment the customer's data starts existing.

When a customer taps the WhatsApp button or the phone link, **they leave our site.** From that point:

- **Meta processes the conversation** under its own terms as an independent controller for the messaging service — message delivery, metadata, its own retention. We have no visibility into it and no control over it. The customer should know this *before* they tap, not after.
- **The shop becomes a controller for the order data it receives in chat** — name, phone number, delivery address and landmark, order contents, and any special instructions. That is real personal data, held on the shop's phone, and the fact that our website never touched it does not remove the duty. The site should say so in one clear line.
- The prefilled message text contains **no personal data** — only a generic opener. Verify this at conversion time.

Practical duties that follow, and belong in the shop's operating routine rather than in code: a **screen lock** on the shop phone; **WhatsApp two-step verification PIN** (also a C2 security control); **chats deleted after a defined period** — 90 days is a defensible default for a food business, long enough for disputes; **no forwarding of customer details** to anyone outside the shop; and **never accepting card numbers or MoMo PINs in chat** (§2.2 item 5). If the shop later adopts WhatsApp Business API through a provider, that provider becomes a processor and needs a contract — a change that reopens this section.

### 4.4 Analytics and whether a cookie banner is needed

**Recommendation: a cookieless analytics product, or none at all.**

The best fit for this stack is **Vercel Web Analytics** — cookieless, storing no identifier on the device, and, uniquely relevant here, **same-origin**: its script and beacon are served from `/_vercel/insights/…`, so it works under the strict `script-src 'self'` / `connect-src 'self'` CSP in C5 without a single exception. Google Analytics would require punching two holes in the CSP, adding a third-party controller, and adding a cookie banner. Plausible, Fathom or Umami are acceptable cookieless alternatives but need a `connect-src` exception.

**Consequence for PECR and consent.** PECR requires consent before storing information on, or reading information from, a user's device — regardless of whether that information is personal data. **A cookieless analytics that stores nothing on the device and reads nothing from it falls outside that requirement, so no cookie banner is needed.** It still processes an IP address in transit, which is why it must be named in the privacy notice under legitimate interests, with an opt-out route on request.

**The rule that reverses this** — write it into the notice as a maintenance trigger, because it will be tested the first time someone wants a map or a video: adding **Google Analytics, a Meta Pixel, an embedded YouTube or Google Maps frame, a chat widget, or Google-hosted fonts** changes the answer. The first four set cookies or read device state and require a compliant consent banner; Google-hosted fonts do not set a cookie but do disclose every visitor's IP to Google, which is a disclosure the notice would have to make. **C4 already removes the Google Fonts references from the Stitch exports** — that fix is a privacy control as much as a CSP one.

### 4.5 Ghana — Data Protection Act 2012 (Act 843)

Act 843 requires a **data controller to register with the Data Protection Commission**, and registration is renewable. The instinct is that a site storing nothing needs no registration. **That instinct is wrong, and the reason is §4.3:** the website is not the controller — **the business is**, and the business processes customers' names, phone numbers and delivery addresses every day, in WhatsApp chats and on paper. Act 843 attaches to that processing, not to the website's architecture.

**Registration with the DPC therefore remains advisable and should be treated as a launch-adjacent task** (owner action, not a build task): register the business as a data controller, keep the registration current, and name a person responsible for data protection queries. The obligations that follow are proportionate and mostly already met — process lawfully and for a stated purpose, keep it accurate, keep it no longer than needed (the 90-day chat rule), keep it secure (phone lock, two-step PIN), and honour access or deletion requests from customers. The privacy notice should name the DPC as the supervisory authority for complaints.

### 4.6 Ghana — Electronic Transactions Act 2008 (Act 772)

Act 772's consumer-protection provisions impose supplier-disclosure duties on anyone offering goods or services electronically, and **a menu site is squarely within them** even with no checkout. These are Stage 4 content requirements with legal force, not marketing copy:

- **Business identity** — the full legal or registered trading name of the business, not just "Avalanche Pizza".
- **Physical location** — the street address / locatable description in Bechem, Ahafo Region.
- **Contact details** — the phone number and WhatsApp line, and an email or equivalent written contact route.
- **Clear description of the goods** — menu items with meaningful descriptions, and allergen or ingredient information where the shop can state it accurately.
- **Prices stated clearly in GHS** — the currency named explicitly as Ghana Cedi (₵ / GHS), not an ambiguous symbol; and a plain statement of **whether prices include VAT and applicable levies, or that the business is not VAT-registered.**
- **Prices are indicative until confirmed in chat** — this is the disclosure that makes the whole model honest. State plainly that the menu is a price guide; that availability varies; that **delivery fees depend on the area and are quoted in the WhatsApp conversation**; and that **the final total is the one confirmed in chat before the order is accepted.** Put it next to the prices, not buried in a terms page.

A short **Terms / Ordering Information** page carrying these, plus how to cancel or complain, satisfies this and doubles as a customer-service asset.

---

## 5. Launch gate

Binary. Every line is pass/fail, and the site does not go live with a fail.

| # | Gate | Control |
|---|---|---|
| 1 | Domain: registrar lock on, auto-renew on with a valid card, renewal reminders set, registrant email off-domain and MFA-protected | C1 |
| 2 | DNS: DNSSEC on (or documented why not), CAA published and certificate issuance verified working, null-MX + SPF `-all` + DMARC `p=reject` + null DKIM live | C1 |
| 3 | MFA (not SMS) on registrar, Vercel, GitHub, Google Business Profile, Meta; WhatsApp two-step PIN on the shop account; recovery codes printed and stored at the shop | C2 |
| 4 | GitHub branch protection on `main`: PR required, CI checks required, code-owner review required, force-push blocked | C2 |
| 5 | Shop number appears in exactly one source file; pin test present and passing; CODEOWNERS covers both files | C3a–c |
| 6 | Build-output link assertion passing — every `wa.me` and `tel:` link in the output is the pinned number, and there is at least one | C3d |
| 7 | Post-deploy + daily smoke check live, with `EXPECTED_WA_NUMBER` held as an Actions secret outside the repo | C3e |
| 8 | Google Business Profile / Facebook / Instagram numbers verified against the pin by the owner | C3f |
| 9 | Zero third-party origins in the build output — no `cdn.tailwindcss.com`, no `fonts.googleapis.com`, no `googleusercontent.com`; fonts self-hosted via `next/font`; `images.remotePatterns` empty | C4, C5 |
| 10 | `login.html` not converted; no form element anywhere in the build | C4 |
| 11 | CSP enforced (not report-only) and verified in a browser with zero console violations; inline-script hash list committed and drift check passing | C5 |
| 12 | HSTS, `nosniff`, `Referrer-Policy: no-referrer`, `frame-ancestors 'none'`, `Permissions-Policy` all present on the production response — verified with `curl -I`, not assumed | C5 |
| 13 | No `VERCEL_TOKEN` or any deploy credential exists; all GitHub Actions pinned to commit SHAs; no `pull_request_target` in any workflow | C7, C9 |
| 14 | Rollback rehearsed once: a previous deployment promoted and reverted successfully | C9 |
| 15 | Uptime monitor live with a phone-number keyword assertion; deployment notifications on; spend limit / usage alert set | C10 |
| 16 | Privacy notice published, covering logs, analytics, and the WhatsApp handoff; **no cookie banner because no cookies** — verified with an empty cookie jar in DevTools | §4.2–4.4 |
| 17 | Act 772 disclosures published: legal name, Bechem address, contact routes, GHS pricing with VAT position, and the "prices indicative until confirmed in chat" statement | §4.6 |
| 18 | Owner has actioned DPC registration (or recorded a dated decision not to, with reasons) | §4.5 |

### Per-stage security tasks

**Stage 3 — Frontend conversion**
- Apply the C4 sanitization table to all four exports; **do not convert `login.html`.**
- Create `src/config/shop.ts`, the pin test, and CODEOWNERS **first**, before any component renders a link (gate items 5, 6).
- Wire the CI checks: source grep (no contact literals outside config, no `on*=`, no third-party origins), build-output link assertion, build-output origin allowlist.
- Self-host fonts via `next/font/google`; move all imagery to `public/` from `design/assets/`; keep `images.remotePatterns` empty.
- Add headers and CSP to `next.config.ts` in **report-only** mode; generate the first inline-script hash list and commit it.
- Confirm the build target is standard Vercel static/ISR output — if anyone proposes `output: 'export'`, the header strategy must move to `vercel.json` first.

**Stage 4 — Content and discoverability**
- Publish the Act 772 disclosures and the "prices indicative until confirmed in chat" statement alongside the menu (gate 17).
- Publish the privacy notice (gate 16), including the WhatsApp handoff paragraph.
- Add the "How to know it's really us" block with the exact domain and number and the no-card-details warning (C8).
- JSON-LD / structured data must draw its `telephone` from `SHOP`, never a literal — structured data is a link the C3d assertion must also cover.
- `robots.txt` and `sitemap.xml` for the canonical host only; confirm preview deployments are `noindex`.
- Decide analytics: cookieless or none. If cookieless, confirm the CSP needs no new exception.
- Register the near-miss domains and set up the redirects.

**Stage 5 — Hardening and deploy**
- Flip the CSP from report-only to enforcing after reviewing violations; re-verify all headers on the production response with `curl -I` (gates 11, 12).
- Enable HSTS; submit to preload **only after** confirming every subdomain is HTTPS.
- Complete all DNS records and verify certificate renewal works with CAA in place (gate 2).
- Stand up the post-deploy and daily smoke checks with the out-of-repo secret (gate 7).
- Stand up uptime monitoring with the phone-number keyword; enable deployment notifications; set the spend limit (gate 15).
- Rehearse rollback (gate 14).
- Owner completes the account MFA sweep, WhatsApp two-step PIN, off-site number verification, and DPC registration (gates 3, 8, 18).

### What reopens this document

Any one of these invalidates the risk picture above and requires a review before it ships: **adding a payment link, button, or embed of any kind** (§2.2 — PCI returns); **adding any form** that collects a name, phone number, or address; **adding customer accounts or any cookie**; **adding a database or any server-side write path**; **adding a third-party script, embed, map, or chat widget**; **adding an admin surface or a CMS**; **moving to WhatsApp Business API through a provider**; or **the business starting to send email from the domain**.

---

*Placeholders are deliberate: the real number belongs in `src/config/shop.ts` and in the `EXPECTED_WA_NUMBER` Actions secret, supplied by the owner. The CAA record contents and DNSSEC availability must be checked against Vercel's current documentation before publishing — a wrong CAA record breaks certificate renewal silently.*
