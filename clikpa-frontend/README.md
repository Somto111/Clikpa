# ClikPa Frontend

Mobile-first React (JavaScript) + Vite + Tailwind CSS v4 + GSAP frontend for ClikPa.

## Scripts

```bash
npm run dev      # Start Vite dev server (0.0.0.0:5173)
npm run build    # Production bundle
npm run lint     # Lint with oxlint
npm run preview  # Preview production build
```

## Routes

### Public
- `/` — Landing
- `/signin` — Sign-in (`VITE_AUTH_MODE="code"` or `"password"`)
- `/pay/:invoiceId` — Customer Pay Page (mobile-first, 3G-friendly, 9 edge-state components)
- `/receipt/:invoiceId` — Printable Receipt Page (supports per-instalment receipts & black-and-white A4/Letter print)

### Merchant (Protected)
- `/dashboard` — Invoices Dashboard & Digital Dollar Balance
- `/invoices/new` — Create Invoice & Edit Draft (`?draft=:id`)
- `/invoices/:id/share` — WhatsApp / Email / Link Share (never marks "Sent")
- `/invoices/:id` — Invoice Detail & Cancel-and-Replace
- `/wallet` — Self-Custody Wallet, Activity Ledger & Passkey Placeholder
- `/withdraw` — Partner-Driven Withdrawals to Naira

## Design system — “Architectural Midnight”

All visual tokens live in `src/index.css` (`@theme` + `@layer components`). Components consume the
tokens through Tailwind utilities only; do not hard-code colours in pages.

### Surfaces & structure
| Layer | Token / class | Notes |
| --- | --- | --- |
| Page canvas | `--color-surface-muted` (`#050A16`) | Body carries the `#0040A8` radial glows and the faint blueprint grid |
| Raised card | `.glass-panel` | Glass bento panel, 1px `rgba(255,255,255,0.10)` hairline, inner light catch |
| Docked panel | `.glass-panel-strong` | Header/tab bar/status dock — more opaque for legibility |
| Feature panel | `.glass-brand` | Brand-tinted glass for trust/feature bento tiles |
| Amber highlight | `.glass-amber` | Amber-tinted glass; body copy stays `--color-ink`, never amber |
| Floating header | `.pill-header` | Pill-shaped, blurred, sticky — used by `PillHeader` on every route |
| Blueprint decoration | `.arch-grid`, `.glow-blob`, `.edge-light` | Decorative only, `aria-hidden`, removed in print |

### Brand rules (unchanged)
- `#0040A8` (`bg-brand`) is the **primary fill** with white label (`text-on-brand`). Brand *text* on
  midnight uses `text-link` / `--color-brand-300` (`#7AA7FF`, ~8:1) because raw `#0040A8` is only
  ~2:1 on the dark canvas.
- `#FFA800` (`bg-amber`) is a **highlight fill** and always pairs with `text-on-amber` (`#0B1020`,
  ~9.8:1). Never render amber text on a light or neutral surface.
- Buttons: primary = brand fill, amber = highlight, secondary = 1px translucent outline.

### Typography
- Poppins (`font-heading`) for headings and numerals; Inter (`font-body`) for UI and body copy.
- Body copy is `text-base` (16px minimum on mobile, prevents iOS input zoom) with `text-ink-muted`
  (`#A6B6D0`, ~9.5:1 on midnight) for secondary text.
- Interactive targets keep `min-h-11` (44px) or larger; focus states use a `brand-300` ring with a
  midnight offset so the halo never renders white on the dark canvas.

### Print
`/receipt/:invoiceId` must stay a black-and-white document. `src/index.css` contains an unlayered
`@media print` block that flips every theme token to black-on-white, drops the glows, grids, glass
blur and shadows, and neutralises gradient text — so any component (including banners, status pills
and buttons) prints monochrome even if it has no explicit `print:` utility.
