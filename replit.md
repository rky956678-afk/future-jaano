# Future Jaano

An AI-powered spiritual guidance platform that brings ancient Indian wisdom (Astrology, Vastu, Lal Kitab, Atharvaveda, Yog Pradeepam) to modern users with real-time AI analysis, multi-language support (Hindi/English), and Razorpay subscriptions.

## Run & Operate

- `pnpm --filter @workspace/api-server run dev` — run the API server (port 8080, served at `/api`)
- `pnpm --filter @workspace/future-jaano run dev` — run the frontend (served at `/`)
- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from the OpenAPI spec
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only)
- Required env: `DATABASE_URL` — Postgres connection string
- Required env: `OPENAI_API_KEY` + `OPENAI_API_BASE_URL` — set via Replit AI Integrations
- Optional env: `RAZORPAY_KEY_ID` + `RAZORPAY_KEY_SECRET` — for live payments (graceful fallback without)

## Stack

- pnpm workspaces, Node.js 24, TypeScript 5.9
- Frontend: React + Vite, Tailwind CSS, shadcn/ui, Framer Motion, TanStack Query
- Auth: Clerk (`@clerk/react` frontend, `@clerk/express` backend)
- API: Express 5
- DB: PostgreSQL + Drizzle ORM
- Validation: Zod (`zod/v4`), `drizzle-zod`
- AI: OpenAI via Replit AI Integrations (`gpt-5-mini`)
- Payments: Razorpay
- API codegen: Orval (from OpenAPI spec)
- Build: esbuild (CJS bundle)

## Where things live

- `lib/api-spec/openapi.yaml` — source of truth for all API contracts
- `lib/api-client-react/src/generated/` — auto-generated React Query hooks (don't edit directly)
- `lib/db/src/schema/` — Drizzle ORM schema files (users, readings, blog, subscriptions)
- `artifacts/api-server/src/routes/` — all Express route handlers
- `artifacts/api-server/src/middlewares/` — Clerk proxy + requireAuth middleware
- `artifacts/api-server/src/lib/openai.ts` — OpenAI client singleton
- `artifacts/future-jaano/src/pages/` — all frontend pages
- `artifacts/future-jaano/src/components/layout/` — Navbar, BottomNav, Layout
- `artifacts/future-jaano/src/lib/language.tsx` — EN/Hindi language context

## Architecture decisions

- Contract-first API: OpenAPI spec → codegen → Zod schemas + React Query hooks. Server validates with Zod, client uses generated hooks.
- Clerk proxy mounted at `/api/__clerk` on the API server — only active in production; dev uses direct Clerk JS loading.
- Image analysis (Vastu, Palm, Face) accepts base64-encoded images from the frontend and sends directly to OpenAI's vision API.
- All horoscope data is generated server-side from fixed sign tables (no AI cost per request). AI is only called for kundli, problems, yoga, numerology, and image analysis.
- Razorpay is optional: if `RAZORPAY_KEY_ID` is absent, a mock order ID is returned so the payment flow can be tested without real keys.

## Product

- **Horoscope**: Daily/weekly readings for all 12 zodiac signs in Hindi and English
- **Kundli**: AI-generated Vedic birth chart analysis with sun/moon sign, ascendant, doshas, remedies
- **Problem Solver**: AI remedies from Lal Kitab, Atharvaveda, Yog Pradeepam, and Vastu for life problems
- **Vastu Analysis**: Upload room photo → AI Vastu score and directional recommendations
- **Palm Reading**: Upload palm photo → life/heart/head line analysis
- **Face Reading**: Upload face photo → Samudrika Shastra personality and fortune analysis
- **Numerology**: Calculate life path number, destiny number, and full numerology report
- **Yoga**: Personalized yoga and pranayama plans based on health goals
- **Blog**: Articles on astrology, Vastu, remedies, palmistry, numerology
- **Subscriptions**: Basic (₹99/mo), Premium (₹299/mo), Annual (₹1999/yr) via Razorpay
- **Admin Dashboard**: User stats, revenue, recent readings

## User preferences

- Hindi/English toggle on all pages — users can switch language instantly
- Mobile-first design with bottom navigation bar

## Gotchas

- Run `pnpm --filter @workspace/db run push` after schema changes before restarting the API server
- Run `pnpm --filter @workspace/api-spec run codegen` after changing `openapi.yaml` to regenerate hooks
- The Clerk proxy (`/api/__clerk`) returns 404 in dev — this is expected. Clerk loads directly in dev mode.
- Image uploads must be converted to base64 on the frontend before sending to the API
- Express body limit is set to 10MB to accommodate base64 images

## Pointers

- See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details
- See the `clerk-auth` skill for Clerk configuration
- See the `ai-integrations-openai` skill for OpenAI setup
