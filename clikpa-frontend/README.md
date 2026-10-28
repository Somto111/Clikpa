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
