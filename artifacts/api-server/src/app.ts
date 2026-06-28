import express, { type Express, type Request, type Response, type NextFunction } from "express";
import cors from "cors";
const pinoHttp = require("pino-http");

import { clerkMiddleware } from "@clerk/express";
import { publishableKeyFromHost } from "@clerk/shared/keys";

import {
  CLERK_PROXY_PATH,
  clerkProxyMiddleware,
  getClerkProxyHost,
} from "./middlewares/clerkProxyMiddleware";

import router from "./routes";
import { logger } from "./lib/logger";

const app: Express = express();

app.set("trust proxy", 1);

app.use(
  pinoHttp({
    logger,
    serializers: {
      req(req: any) {
        return {
          id: req.id,
          method: req.method,
          url: req.url?.split("?")[0],
        };
      },
      res(res: any) {
        return {
          statusCode: res.statusCode,
        };
      },
    },
  }),
);

app.use(CLERK_PROXY_PATH, clerkProxyMiddleware());

app.use(cors({ credentials: true, origin: true }));

app.use(express.json({ limit: "10mb" }));

app.use(
  express.urlencoded({
    extended: true,
    limit: "10mb",
  }),
);

// ─── Public routes — registered BEFORE clerkMiddleware ───────────────────────

// GET / — API root
app.get("/", (_req, res) => {
  res.json({ success: true, message: "Future Jaano API is running" });
});

// GET /health — Railway liveness probe
app.get("/health", (_req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

// GET /debug/env — show which env vars are present (no secrets exposed)
app.get("/debug/env", (_req, res) => {
  res.json({
    node_env: process.env.NODE_ENV ?? "unknown",
    database: !!process.env.DATABASE_URL,
    clerk: !!(process.env.CLERK_SECRET_KEY && process.env.CLERK_PUBLISHABLE_KEY),
    openai: !!process.env.OPENAI_API_KEY,
    razorpay: !!(process.env.RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_SECRET),
    vapid: !!(process.env.VAPID_PUBLIC_KEY && process.env.VAPID_PRIVATE_KEY),
  });
});

// GET /debug/routes — list every registered Express route
app.get("/debug/routes", (req, res) => {
  const routes: Array<{ method: string; path: string }> = [];

  function extractRoutes(stack: any[], prefix = "") {
    for (const layer of stack) {
      // Express 5: route is on layer.route
      if (layer.route) {
        const routePath = prefix + (layer.route.path ?? "");
        const methods = layer.route.methods ?? {};
        for (const method of Object.keys(methods)) {
          if (methods[method]) {
            routes.push({ method: method.toUpperCase(), path: routePath });
          }
        }
      }
      // Sub-router: handle is a function with a .stack property
      const subStack =
        layer.handle?.stack ??
        layer.handle?.router?.stack ??
        null;
      if (subStack) {
        // Try to extract mount prefix from regexp source
        let mountPath = prefix;
        const src: string = layer.regexp?.source ?? "";
        // Skip pass-through regexps
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

  // Express 5 stores the router at app.router (not app._router)
  const appRouter = (req.app as any).router ?? (req.app as any)._router;
  if (appRouter?.stack) {
    extractRoutes(appRouter.stack);
  }

  res.json({ count: routes.length, routes });
});

// ─── Clerk middleware ─────────────────────────────────────────────────────────

app.use(
  clerkMiddleware((req) => ({
    publishableKey: publishableKeyFromHost(
      getClerkProxyHost(req) ?? "",
      process.env.CLERK_PUBLISHABLE_KEY,
    ),
  })),
);

// ─── API routes ───────────────────────────────────────────────────────────────

app.use("/api", router);

// ─── 404 catch-all ────────────────────────────────────────────────────────────

app.use((req: Request, res: Response) => {
  res.status(404).json({
    error: "Not Found",
    message: `Cannot ${req.method} ${req.path}`,
    hint: "Visit /debug/routes to see all available routes",
  });
});

// ─── Global error handler ─────────────────────────────────────────────────────

// eslint-disable-next-line @typescript-eslint/no-unused-vars
app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
  logger.error({ err }, "Unhandled error");
  res.status(500).json({ error: "Internal server error", message: err.message });
});

export default app;
