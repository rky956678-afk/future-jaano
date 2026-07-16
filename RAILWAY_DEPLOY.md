# Deploy Future Jaano on Railway (Single Service)

## ⚠️ FIRST: Clean up the broken multi-service setup

If your Railway project currently shows multiple crashed services
(`@workspace/api-zod`, `@workspace/api-spec`, `@workspace/db`,
`@workspace/api-client-react`, `@workspace/mockup-sandbox`, etc.) — those are
**libraries, not servers**. They have nothing to run, so they crash. Delete them:

1. Click each extra service → **Settings** → scroll to bottom → **Delete Service**
2. Keep only **ONE** service (e.g. the `future-jaano` / `api-server` one)
3. On the kept service → Settings → **Root Directory** must be **empty / `/`**
   (repo root — NOT `artifacts/api-server`)
4. The per-package `railway.toml` / `nixpacks.toml` files that caused this have
   been removed from the repo — only the root ones remain.


The repo is pre-configured for Railway via `railway.toml` + `nixpacks.toml`:
- **One service** builds both the API server and the React frontend
- The API server serves the frontend statically with SPA fallback (so `/kundli` etc. work on refresh)
- On start it runs `drizzle-kit push` to sync the DB schema, then boots the server
- `/health` is set as the healthcheck path

## Steps

1. **Push this repo to GitHub** (patch applied):
   ```bash
   git add -A && git commit -m "railway single-service + engine + fixes" && git push origin main
   ```

2. **Railway dashboard** → New Project → **Deploy from GitHub repo** → select `future-jaano`
   (If the project already exists, it will redeploy automatically on push.)

3. **Add Postgres**: In the project → `+ New` → `Database` → `PostgreSQL`

4. **Set Variables** on the app service (Service → Variables):

   | Variable | Value | Required? |
   |---|---|---|
   | `DATABASE_URL` | `${{Postgres.DATABASE_URL}}` (reference the plugin) | ✅ YES |
   | `NODE_ENV` | `production` | ✅ YES |
   | `VITE_CLERK_PUBLISHABLE_KEY` | `pk_live_...` | for real sign-in (build-time!) |
   | `CLERK_PUBLISHABLE_KEY` | `pk_live_...` | for real sign-in |
   | `CLERK_SECRET_KEY` | `sk_live_...` | for real sign-in |
   | `OPENAI_API_KEY` | `sk-...` | for AI text (engine works without it) |
   | `RAZORPAY_KEY_ID` / `RAZORPAY_KEY_SECRET` | from Razorpay dashboard | for real payments |
   | `DEV_AUTH` | `true` | ⚠️ optional: demo login without Clerk (remove once Clerk is set) |

   Missing optional keys no longer crash the server — features degrade gracefully
   (set `STRICT_ENV=true` if you prefer hard failure).

5. **Custom domain**: Service → Settings → Networking → add `futurejaano.com`
   and point your DNS CNAME to the Railway domain it shows.

6. **Clerk production setup** (for real sign-in):
   - dashboard.clerk.com → create **Production** instance
   - Add domain `futurejaano.com`
   - Copy `pk_live_...` / `sk_live_...` into the variables above
   - **Important:** `VITE_CLERK_PUBLISHABLE_KEY` is baked in at build time — after
     changing it, trigger a redeploy so the frontend rebuilds.

## Verify after deploy

- `https://<your-domain>/health` → `{"status":"ok"}`
- `https://<your-domain>/` → app loads
- `https://<your-domain>/kundli` → page renders (no blank screen — AuthGate now
  shows a loader and falls back to the sign-in card if Clerk fails)
- `https://<your-domain>/api/panchang?place=Delhi` → real panchang JSON

## Notes

- Frontend and API are same-origin, so no CORS or proxy config is needed.
- Logs: Railway → service → Deployments → View Logs. Startup prints exactly
  which keys are missing and what fallback is active.
