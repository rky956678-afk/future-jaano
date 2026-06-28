# Future Jaano — Production Deployment Report
**Date:** 2026-06-28  
**Version:** 1.1.0  
**Environment:** Railway (Production)

---

## ✅ Files Changed

| File | Change |
|------|--------|
| `artifacts/api-server/package.json` | Added `helmet`, `compression`, `swagger-ui-express`, `yaml`, `@types/compression`, `@types/swagger-ui-express` |
| `artifacts/api-server/src/app.ts` | Full rewrite: helmet, compression, cookie-parser, CORS (origin whitelist), startup env validation, `/health`, `/health/live`, `/health/ready`, `/debug/env`, `/debug/db`, `/debug/version`, `/debug/routes`, global error handler with stack trace logging, graceful shutdown wiring |
| `artifacts/api-server/src/index.ts` | Added `http.createServer`, SIGTERM/SIGINT graceful shutdown, unhandled rejection/exception handlers, DB pool close on exit |
| `artifacts/api-server/src/routes/health.ts` | Added `/api/healthz` (DB ping), enriched `/api/status` with service checks, uptime |
| `artifacts/api-server/src/routes/horoscope.ts` | Full rewrite: added `/horoscope/daily/:sign`, `/horoscope/weekly/:sign`, richer JSON response (health/career/love/finance fields), mock fallback when OpenAI is down |
| `artifacts/api-server/src/routes/push.ts` | Added `/push/vapid-public-key` alias, `/push/preferences` GET+PATCH, `POST /push/test` |
| `artifacts/api-server/src/routes/users.ts` | Added `GET /api/users/me/dashboard` (DashboardSummary) |
| `artifacts/api-server/src/routes/swagger.ts` | **NEW** — serves `openapi.yaml` as Swagger UI at `/docs` and raw JSON at `/docs/openapi.json` |
| `artifacts/api-server/src/routes/ashtakavarga.ts` | Fixed `gpt-5-mini` → `gpt-4o-mini` |
| `artifacts/api-server/src/routes/dasha.ts` | Fixed `gpt-5-mini` → `gpt-4o-mini` |
| `artifacts/api-server/src/routes/gochar.ts` | Fixed `gpt-5-mini` → `gpt-4o-mini` |
| `artifacts/api-server/src/routes/imageAnalysis.ts` | Fixed `gpt-5-mini` → `gpt-4o-mini` |
| `artifacts/api-server/src/routes/kundli.ts` | Fixed `gpt-5-mini` → `gpt-4o-mini` |
| `artifacts/api-server/src/routes/kundliMilan.ts` | Fixed `gpt-5-mini` → `gpt-4o-mini` |
| `artifacts/api-server/src/routes/muhurat.ts` | Fixed `gpt-5-mini` → `gpt-4o-mini` |
| `artifacts/api-server/src/routes/numerology.ts` | Fixed `gpt-5-mini` → `gpt-4o-mini` |
| `artifacts/api-server/src/routes/problems.ts` | Fixed `gpt-5-mini` → `gpt-4o-mini` |
| `artifacts/api-server/src/routes/yoga.ts` | Fixed `gpt-5-mini` → `gpt-4o-mini` |
| `POSTMAN_COLLECTION.json` | **NEW** — complete Postman v2.1 collection |
| `CURL_COMMANDS.sh` | **NEW** — curl reference for every endpoint |

---

## ✅ Routes Added / Fixed

| Method | Path | Status |
|--------|------|--------|
| GET | `/health/live` | ✅ Added |
| GET | `/health/ready` | ✅ Added (DB ping) |
| GET | `/debug/db` | ✅ Added |
| GET | `/debug/version` | ✅ Added |
| GET | `/docs` | ✅ Added (Swagger UI) |
| GET | `/docs/openapi.json` | ✅ Added |
| GET | `/api/healthz` | ✅ Added (DB ping, expected by generated client) |
| GET | `/api/status` | ✅ Enriched with service checks |
| GET | `/api/horoscope/daily/:sign` | ✅ Added (expected by frontend) |
| GET | `/api/horoscope/weekly/:sign` | ✅ Added (expected by generated client) |
| GET | `/api/push/vapid-public-key` | ✅ Added (alias, expected by frontend pushClient) |
| GET | `/api/push/preferences` | ✅ Added (alias for subscriptions) |
| PATCH | `/api/push/preferences` | ✅ Added (alias for subscription PATCH) |
| POST | `/api/push/test` | ✅ Added |
| GET | `/api/users/me/dashboard` | ✅ Added (DashboardSummary) |

---

## ✅ Middleware Stack (in order)

1. `trust proxy 1` — Railway is behind a load balancer
2. `helmet` — security headers (CSP disabled, API-only)
3. `compression` — gzip responses
4. `pino-http` — structured request logging (method, path, status, duration)
5. `clerkProxyMiddleware` — Clerk auth proxy
6. `cors` — whitelist: futurejaano.com + CORS_EXTRA_ORIGINS env var
7. `express.json` — 10 MB limit
8. `express.urlencoded` — 10 MB limit
9. `cookie-parser` — cookie parsing
10. Public routes (`/`, `/health*`, `/debug/*`, `/docs*`)
11. `clerkMiddleware` — attaches auth state
12. `/api/*` — all API routes behind Clerk
13. 404 catch-all — JSON response
14. Global error handler — logs stack trace, returns clean JSON

---

## ✅ DB Tables (Drizzle ORM)

| Table | Status |
|-------|--------|
| `users` | ✅ Exists |
| `readings` | ✅ Exists |
| `kundli_reports` | ✅ Exists |
| `problem_solutions` | ✅ Exists |
| `vastu_reports` | ✅ Exists |
| `palm_reports` | ✅ Exists |
| `face_reports` | ✅ Exists |
| `numerology_reports` | ✅ Exists |
| `yoga_plans` | ✅ Exists |
| `blog_posts` | ✅ Exists |
| `subscription_plans` | ✅ Exists |
| `user_subscriptions` | ✅ Exists |
| `payments` | ✅ Exists |
| `notifications` | ✅ Exists |
| `push_subscriptions` | ✅ Exists |

**Migration command** (run once in Railway console):
```bash
pnpm --filter @workspace/db push
```

---

## ✅ Environment Variables Required

| Variable | Purpose | Status |
|----------|---------|--------|
| `DATABASE_URL` | PostgreSQL (Railway auto-injects) | Required |
| `CLERK_SECRET_KEY` | Clerk auth secret | Required |
| `CLERK_PUBLISHABLE_KEY` | Clerk publishable key | Required |
| `OPENAI_API_KEY` | OpenAI GPT-4o-mini | Required |
| `RAZORPAY_KEY_ID` | Razorpay payment key | Optional |
| `RAZORPAY_KEY_SECRET` | Razorpay payment secret | Optional |
| `VAPID_PUBLIC_KEY` | Web push public key | Optional |
| `VAPID_PRIVATE_KEY` | Web push private key | Optional |
| `VAPID_SUBJECT` | Push notification sender email | Optional (default: mailto:admin@futurejaano.com) |
| `CORS_EXTRA_ORIGINS` | Comma-separated extra CORS origins | Optional |
| `NODE_ENV` | `production` in Railway | Set by Railway |
| `PORT` | Server port | Set by Railway |

> **Server fails fast** if `DATABASE_URL`, `CLERK_SECRET_KEY`, `CLERK_PUBLISHABLE_KEY`, or `OPENAI_API_KEY` are missing.

---

## 📋 Remaining TODOs

- [ ] **Run DB migration**: In Railway → api-server → Deploy → Terminal: `pnpm --filter @workspace/db push`
- [ ] **Set env vars**: `RAZORPAY_KEY_ID`, `RAZORPAY_KEY_SECRET`, `VAPID_PUBLIC_KEY`, `VAPID_PRIVATE_KEY` in Railway Variables
- [ ] **Seed subscription plans**: Insert `Basic`, `Premium`, `Annual` plans into `subscription_plans` table
- [ ] **Verify `/docs`**: Visit https://api.futurejaano.com/docs after deployment
- [ ] **Revoke exposed tokens**: Delete both Railway API tokens at https://railway.com/account/tokens
- [ ] **Fix `/debug/routes`**: Express 5 router traversal still returns 0 — needs deeper inspection of router internals
- [ ] **Rate limit tuning**: Consider Redis-backed rate limiter for production scale
- [ ] **Add Redis cache**: Cache horoscope responses for the same sign+date (24h TTL) to reduce OpenAI costs

---

## 🌐 Live Endpoints

| URL | Description |
|-----|-------------|
| https://futurejaano.com | Frontend |
| https://api.futurejaano.com | API root |
| https://api.futurejaano.com/health | Liveness probe |
| https://api.futurejaano.com/health/ready | Readiness probe |
| https://api.futurejaano.com/docs | Swagger UI |
| https://api.futurejaano.com/debug/env | Env var status |
| https://api.futurejaano.com/debug/db | DB table counts |
