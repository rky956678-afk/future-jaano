# Future Jaano - Astro Solutions Hub

Future Jaano is an astrology and spiritual solutions platform built to provide users with guidance, consultations, remedies, and astro-based services.

## Features
- Astrology consultation
- Spiritual guidance
- Responsive frontend
- Modern UI
- Replit to GitHub migrated project

## Tech Stack
- TypeScript
- Node.js
- PNPM
- Replit-based architecture

## Project Status
Recovered and migrated successfully from Replit to GitHub.

## Repository
https://github.com/rky956678-afk/future-jaano

## ✅ Fully Working — Zero-Config Dev Mode

All features now work end-to-end out of the box (only Postgres needed):
- **No Clerk keys?** → auto sign-in as Demo User (dev only)
- **No OpenAI key?** → every AI feature serves built-in bilingual (EN/HI) fallback content
- **No Razorpay keys?** → mock payment flow (initiate → verify → subscription activated)
- Subscription plans + blog posts auto-seeded on first boot
- Vite dev proxy added: frontend `/api` → API server

See **LOCAL_SETUP.md** for the 5-step quick start.

## 🚀 High-Tech Upgrade — Real Vedic Astronomy Engine

The platform now includes a **built-in Jyotish computation engine** (`artifacts/api-server/src/lib/jyotish.ts`) — no external astrology API needed. India-grade accuracy, verified against standard panchang sources:

- **Real planetary positions** — Sun→Saturn + Rahu/Ketu, sidereal (Lahiri ayanamsa), with retrograde detection
- **Real Panchang** — tithi, paksha, nakshatra+pada, yoga, karana computed from actual Sun–Moon angles; location-aware sunrise/sunset; Rahu Kaal, Yamaganda, Gulika, Abhijit muhurat
- **Real Lagna (ascendant)** from birth date/time/place (~90 Indian cities built-in geocoder)
- **Real Vimshottari Dasha** — mahadasha balance + antardashas from Moon's birth nakshatra
- **Real Ashtakoot Guna Milan** — all 8 kootas (Varna/Vashya/Tara/Yoni/Maitri/Gana/Bhakoota/Nadi) from actual Moon positions, with dosha flags
- **Real Ashtakavarga** — classical BPHS bindu tables (SAV total = 337 ✓)
- **Real Muhurat finder** — scans the panchang day-by-day, scores nakshatra/tithi/yoga/karana, returns Abhijit windows with per-day Rahu Kaal warnings
- **Manglik detection** — Mars in houses 1/4/7/8/12 from lagna

AI (when `OPENAI_API_KEY` is set) now receives the **exact computed chart** and only writes interpretations — so predictions are anchored to correct astronomy, never hallucinated positions.
