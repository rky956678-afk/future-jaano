# Future Jaano — Local Setup (Zero-Config Dev Mode)

The project now runs **fully working end-to-end with only a Postgres database** — no Clerk, OpenAI, or Razorpay keys required. Every feature has a graceful fallback:

| Missing key | Fallback behaviour |
|---|---|
| `CLERK_SECRET_KEY` / `CLERK_PUBLISHABLE_KEY` | API auto-signs you in as **Demo User** (admin + premium). Frontend renders without Clerk. |
| `OPENAI_API_KEY` | Every AI feature (Kundli, Problem Solver, Vastu/Palm/Face, Numerology, Yoga, Milan, Dasha, Gochar, Ashtakavarga, Muhurat, Horoscope) returns **built-in bilingual (EN/HI) fallback content** instead of erroring. |
| `RAZORPAY_KEY_ID` / `RAZORPAY_KEY_SECRET` | Mock order IDs; the full initiate → verify → subscription-activation flow works. |

In **production** (`NODE_ENV=production`), missing Clerk/OpenAI keys still fail startup — fallbacks are a dev convenience, not a production mode. `DATABASE_URL` is always required.

## Quick start

```bash
# 1. Install deps
pnpm install

# 2. Start Postgres (any way you like), then:
export DATABASE_URL="postgres://app:app@localhost:5432/futurejaano"

# 3. Push schema
pnpm --filter @workspace/db run push

# 4. Run the API server (port 8080)
PORT=8080 pnpm --filter @workspace/api-server run dev

# 5. In another terminal, run the frontend (port 5173)
pnpm --filter @workspace/future-jaano run dev
```

Open http://localhost:5173 — the Vite dev server now proxies `/api`, `/health`, and `/docs` to `http://localhost:8080` (override with `API_PROXY_TARGET`).

## What got seeded automatically

On first boot with an empty database, the API server seeds:
- **3 subscription plans** — Basic ₹99/mo, Premium ₹299/mo, Annual ₹1999/yr (with Hindi names + feature lists)
- **6 published blog posts** — 3 English + 3 Hindi across astrology, vastu, remedies, palmistry, numerology

Seeding is idempotent (skipped when data exists), so it's safe in production too.

## Enabling real services

Set these env vars and everything upgrades automatically:

```bash
export CLERK_SECRET_KEY=sk_...
export CLERK_PUBLISHABLE_KEY=pk_...        # API server
export VITE_CLERK_PUBLISHABLE_KEY=pk_...   # frontend
export OPENAI_API_KEY=sk-...
export OPENAI_API_BASE_URL=...             # optional
export RAZORPAY_KEY_ID=rzp_...
export RAZORPAY_KEY_SECRET=...
```

## Astronomy engine (no keys needed)

Panchang, Gochar, Dasha, Kundli chart, Guna Milan scores, Ashtakavarga and Muhurat dates are all **computed locally** by the built-in jyotish engine — they are real astronomical values even with zero API keys. OpenAI (optional) only adds narrative interpretation on top.

## Useful endpoints

- `GET /health`, `/health/ready` — liveness/readiness (shows which services are configured)
- `GET /debug/env`, `/debug/db`, `/debug/routes` — diagnostics
- `GET /docs` — Swagger UI
