# ClikPa

ClikPa is a non-custodial invoicing and digital-dollar payments web application built for small businesses in West Africa. Merchants create US-dollar invoices in plain business language, share payment links on WhatsApp or email, receive digital dollars (USDC) in full while customers cover payment charges, and withdraw to Nigerian bank accounts in naira.

## Frontend (`clikpa-frontend/`)

- **Stack**: React (JavaScript), Vite, React Router, Tailwind CSS v4 (`@tailwindcss/vite` + `@theme` tokens in `src/index.css`), GSAP
- **Quick start**:
  ```bash
  cd clikpa-frontend
  npm install
  npm run dev
  ```
- **Environment variables** (`clikpa-frontend/.env`):
  - `VITE_API_BASE_URL=/api` — Backend REST API base URL
  - `VITE_USE_MOCK=true` — Uses the stateful mock adapter (`src/api/mock.js`) covering all 4 screen states and payment/withdrawal edge states
  - `VITE_AUTH_MODE=code` — Sign-in mode (`code` or `password`)
