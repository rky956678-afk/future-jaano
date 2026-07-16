import express, { type Express, type Request, type Response, type NextFunction } from "express";
import cors from "cors";
import helmet from "helmet";
import compression from "compression";
import cookieParser from "cookie-parser";
const pinoHttp = require("pino-http");

import { clerkMiddleware } from "@clerk/express";
import { publishableKeyFromHost } from "@clerk/shared/keys";

import {
  CLERK_PROXY_PATH,
  clerkProxyMiddleware,
  getClerkProxyHost,
} from "./middlewares/clerkProxyMiddleware";

import router from "./routes";
import swaggerRouter from "./routes/swagger";
import { logger } from "./lib/logger";

// ─── Startup env validation ───────────────────────────────────────────────────

const REQUIRED_VARS: Record<string, string> = {
  DATABASE_URL:          "PostgreSQL connection string (add a Postgres service in Railway)",
  CLERK_SECRET_KEY:      "Clerk secret key from https://dashboard.clerk.com",
  CLERK_PUBLISHABLE_KEY: "Clerk publishable key from https://dashboard.clerk.com",
  OPENAI_API_KEY:        "OpenAI API key from https://platform.openai.com",
};

const missing = Object.entries(REQUIRED_VARS).filter(([k]) => !process.env[k]);
if (missing.length > 0) {
  const message =
    "\n╔══════════════════════════════════════════════════╗\n" +
    "║        Missing environment variables             ║\n" +
    "╚══════════════════════════════════════════════════╝\n" +
    missing.map(([k, hint]) => `  ✗ ${k}\n      → ${hint}`).join("\n");

  // DATABASE_URL is truly required — the app cannot function without it.
  if (!process.env.DATABASE_URL) {
    logger.error(message + "\n\nDATABASE_URL is required. Set it before starting.\n");
    process.exit(1);
  }

  if (process.env.NODE_ENV === "production") {
    // Boot anyway with fallbacks so a missing optional key never takes the
    // whole site down. Set STRICT_ENV=true to restore hard-fail behaviour.
    if (process.env.STRICT_ENV === "true") {
      logger.error(message + "\n\nSet these in Railway → Variables before deploying.\n");
      process.exit(1);
    }
    logger.warn(
      message +
      "\n\nPRODUCTION with missing keys — running degraded:" +
      (missing.some(([k]) => k.startsWith("CLERK")) ? "\n  • Auth → sign-in disabled (set Clerk keys, or DEV_AUTH=true for demo login)" : "") +
      (missing.some(([k]) => k === "OPENAI_API_KEY") ? "\n  • AI features → built-in fallback content (real astronomy engine still active)" : "") +
      "\n"
    );
  } else {
  // Dev mode: warn and continue with graceful fallbacks
  logger.warn(
    message +
    "\n\nRunning in DEV mode with fallbacks:" +
    (missing.some(([k]) => k.startsWith("CLERK")) ? "\n  • Auth → local demo user (no Clerk)" : "") +
    (missing.some(([k]) => k === "OPENAI_API_KEY") ? "\n  • AI features → built-in fallback content" : "") +
    "\n"
  );
  }
}

// ─── App ──────────────────────────────────────────────────────────────────────

const app: Express = express();

app.set("trust proxy", 1);

// Security headers (CSP disabled — API only, no HTML served)
app.use(
  helmet({
    contentSecurityPolicy: false,
    crossOriginEmbedderPolicy: false,
  }),
);

// Gzip compression
app.use(compression());

// Request logging
app.use(
  pinoHttp({
    logger,
    serializers: {
      req(req: any) {
        return {
          id:     req.id,
          method: req.method,
          url:    req.url?.split("?")[0],
        };
      },
      res(res: any) {
        return { statusCode: res.statusCode };
      },
    },
  }),
);

// Clerk proxy (must be before CORS)
app.use(CLERK_PROXY_PATH, clerkProxyMiddleware());

// CORS
const ALLOWED_ORIGINS = [
  "https://futurejaano.com",
  "https://www.futurejaano.com",
  ...(process.env.CORS_EXTRA_ORIGINS
    ? process.env.CORS_EXTRA_ORIGINS.split(",").map((o) => o.trim())
    : []),
  // Allow all in dev
  ...(process.env.NODE_ENV !== "production" ? ["http://localhost:3001", "http://localhost:5173", "http://localhost:4173"] : []),
];

app.use(
  cors({
    credentials: true,
    origin: (origin, cb) => {
      // Allow no-origin (curl, Postman, same-origin)
      if (!origin || ALLOWED_ORIGINS.includes(origin)) return cb(null, true);
      return cb(null, false);
    },
  }),
);

// Body parsers
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));
app.use(cookieParser());

// ─── Public routes — registered BEFORE clerkMiddleware ───────────────────────

// GET / — API root
app.get("/", (_req, res, next) => {
  // When the built frontend is being served (single-service deploy), let the
  // static/SPA handlers below return index.html instead of API info JSON.
  if (process.env.__FRONTEND_SERVED === "1") return next();
  res.json({
    success:  true,
    message:  "Future Jaano API is running",
    version:  "1.1.0",
    docs:     "/docs",
    health:   "/health",
    status:   "/api/status",
  });
});

// GET /health — Railway/K8s liveness probe
app.get("/health", (_req, res) => {
  res.json({
    status:    "ok",
    timestamp: new Date().toISOString(),
    uptime:    Math.floor(process.uptime()),
  });
});

// GET /health/live — explicit liveness probe
app.get("/health/live", (_req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

// GET /health/ready — readiness probe (checks DB + OpenAI config)
app.get("/health/ready", async (_req, res) => {
  const checks: Record<string, boolean> = {
    server:   true,
    database: false,
    openai:   !!process.env.OPENAI_API_KEY,
    clerk:    !!(process.env.CLERK_SECRET_KEY && process.env.CLERK_PUBLISHABLE_KEY),
  };

  try {
    const { pool } = await import("@workspace/db");
    const client = await pool.connect();
    await client.query("SELECT 1");
    client.release();
    checks.database = true;
  } catch {
    checks.database = false;
  }

  const allReady = Object.values(checks).every(Boolean);
  res.status(allReady ? 200 : 503).json({
    status: allReady ? "ready" : "degraded",
    checks,
    timestamp: new Date().toISOString(),
  });
});

// GET /debug/env — which env vars are present (no secrets exposed)
app.get("/debug/env", (_req, res) => {
  res.json({
    node_env:  process.env.NODE_ENV ?? "unknown",
    database:  !!process.env.DATABASE_URL,
    clerk:     !!(process.env.CLERK_SECRET_KEY && process.env.CLERK_PUBLISHABLE_KEY),
    openai:    !!process.env.OPENAI_API_KEY,
    razorpay:  !!(process.env.RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_SECRET),
    vapid:     !!(process.env.VAPID_PUBLIC_KEY && process.env.VAPID_PRIVATE_KEY),
    port:      process.env.PORT ?? "3000",
    uptime:    Math.floor(process.uptime()),
    memory_mb: Math.round(process.memoryUsage().heapUsed / 1024 / 1024),
  });
});

// GET /debug/version — version + build info
app.get("/debug/version", (_req, res) => {
  res.json({
    name:      "Future Jaano API",
    version:   "1.1.0",
    node:      process.version,
    env:       process.env.NODE_ENV ?? "unknown",
    startedAt: new Date(Date.now() - process.uptime() * 1000).toISOString(),
    uptime_s:  Math.floor(process.uptime()),
  });
});

// GET /debug/db — check DB connectivity + table counts
app.get("/debug/db", async (_req, res) => {
  if (!process.env.DATABASE_URL) {
    res.status(503).json({ error: "DATABASE_URL not set" });
    return;
  }
  try {
    const { pool } = await import("@workspace/db");
    const client = await pool.connect();
    const tables = [
      "users", "readings", "kundli_reports", "numerology_reports",
      "blog_posts", "payments", "user_subscriptions", "subscription_plans",
      "notifications", "push_subscriptions",
    ];
    const counts: Record<string, number> = {};
    for (const t of tables) {
      try {
        const r = await client.query(`SELECT COUNT(*) FROM ${t}`);
        counts[t] = Number(r.rows[0].count);
      } catch {
        counts[t] = -1; // table doesn't exist yet
      }
    }
    client.release();
    res.json({ status: "connected", tables: counts, timestamp: new Date().toISOString() });
  } catch (err: any) {
    res.status(503).json({ status: "error", error: err.message, timestamp: new Date().toISOString() });
  }
});

// GET /debug/routes — list every registered Express route
app.get("/debug/routes", (req, res) => {
  const routes: Array<{ method: string; path: string }> = [];

  function extractRoutes(stack: any[], prefix = "") {
    for (const layer of stack) {
      if (layer.route) {
        const routePath = prefix + (layer.route.path ?? "");
        const methods = layer.route.methods ?? {};
        for (const method of Object.keys(methods)) {
          if (methods[method]) {
            routes.push({ method: method.toUpperCase(), path: routePath });
          }
        }
      }
      const subStack = layer.handle?.stack ?? layer.handle?.router?.stack ?? null;
      if (subStack) {
        let mountPath = prefix;
        const src: string = layer.regexp?.source ?? "";
        if (src && src !== "^\\/?" && src !== "^\\/?(?=\\/|$)" && !src.startsWith("^(?=")) {
          const m = src.match(/^\^\\\/([^\\(?]+)/);
          if (m) {
            mountPath = prefix + "/" + m[1].replace(/\\\//g, "/").replace(/\/$/, "");
          }
        }
        extractRoutes(subStack, mountPath);
      }
    }
  }

  const appRouter = (req.app as any).router ?? (req.app as any)._router;
  if (appRouter?.stack) {
    extractRoutes(appRouter.stack);
  }

  routes.sort((a, b) => a.path.localeCompare(b.path) || a.method.localeCompare(b.method));
  res.json({ count: routes.length, routes });
});

// ─── Swagger / API docs (public, no auth) ────────────────────────────────────

app.use(swaggerRouter);

// ─── Clerk middleware ─────────────────────────────────────────────────────────

// Only mount Clerk when configured — in dev without keys, requireAuth
// falls back to a local demo user instead.
if (process.env.CLERK_SECRET_KEY && process.env.CLERK_PUBLISHABLE_KEY) {
  app.use(
    clerkMiddleware((req) => ({
      publishableKey: publishableKeyFromHost(
        getClerkProxyHost(req) ?? "",
        process.env.CLERK_PUBLISHABLE_KEY,
      ),
    })),
  );
}

// ─── API routes ───────────────────────────────────────────────────────────────

app.use("/api", router);

// ─── Frontend static serving (single-service deploy, e.g. Railway) ───────────
// Serves the built React app from artifacts/future-jaano/dist when present,
// with an SPA fallback so client-side routes like /kundli work on refresh.
{
  const path = require("node:path") as typeof import("node:path");
  const fs = require("node:fs") as typeof import("node:fs");
  const candidates = [
    process.env.FRONTEND_DIST,
    path.resolve(__dirname, "../../future-jaano/dist"),
    path.resolve(process.cwd(), "artifacts/future-jaano/dist"),
    path.resolve(process.cwd(), "../future-jaano/dist"),
  ].filter(Boolean) as string[];
  const frontendDist = candidates.find(
    (p) => fs.existsSync(path.join(p, "index.html")),
  );
  if (frontendDist) {
    process.env.__FRONTEND_SERVED = "1";
    logger.info({ frontendDist }, "Serving frontend static files");
    app.use(express.static(frontendDist, { index: "index.html", maxAge: "1h" }));
    // SPA fallback: any non-API GET that accepts HTML → index.html
    app.get(/^\/(?!api\/|docs|health|debug).*/, (req: Request, res: Response, next: NextFunction) => {
      if (req.method !== "GET" || !req.accepts("html")) return next();
      res.sendFile(path.join(frontendDist, "index.html"));
    });
  } else {
    logger.warn("Frontend dist not found — running API-only (set FRONTEND_DIST to override)");
  }
}

// ─── 404 catch-all ────────────────────────────────────────────────────────────

app.use((req: Request, res: Response) => {
  res.status(404).json({
    error:   "Not Found",
    message: `Cannot ${req.method} ${req.path}`,
    hint:    "Visit /debug/routes to see all available routes, or /docs for API documentation",
  });
});

// ─── Global error handler ─────────────────────────────────────────────────────

// eslint-disable-next-line @typescript-eslint/no-unused-vars
app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
  // Pino already logs via pinoHttp; this is for errors that bypass it
  logger.error({ err, stack: err?.stack }, "Unhandled error");

  const status  = typeof err?.status === "number"  ? err.status  :
                  typeof err?.statusCode === "number" ? err.statusCode : 500;
  const message = process.env.NODE_ENV === "production" && status === 500
    ? "Internal server error"
    : (err?.message ?? "Unknown error");

  res.status(status).json({
    error:   status === 500 ? "Internal Server Error" : err?.name ?? "Error",
    message,
    ...(process.env.NODE_ENV !== "production" && { stack: err?.stack }),
  });
});

export default app;
