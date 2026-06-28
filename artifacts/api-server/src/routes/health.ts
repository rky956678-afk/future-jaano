import { Router } from "express";
import { pool } from "@workspace/db";

const router = Router();

// GET /api/health
router.get("/health", (_req, res) => {
  res.json({
    success:   true,
    status:    "ok",
    timestamp: new Date().toISOString(),
    uptime:    Math.floor(process.uptime()),
  });
});

// GET /api/status — enriched status with service checks
router.get("/status", (_req, res) => {
  res.json({
    success:  true,
    api:      "Future Jaano API",
    version:  "1.1.0",
    status:   "operational",
    env:      process.env.NODE_ENV ?? "unknown",
    services: {
      database: !!process.env.DATABASE_URL,
      openai:   !!process.env.OPENAI_API_KEY,
      clerk:    !!(process.env.CLERK_SECRET_KEY && process.env.CLERK_PUBLISHABLE_KEY),
      razorpay: !!(process.env.RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_SECRET),
      push:     !!(process.env.VAPID_PUBLIC_KEY && process.env.VAPID_PRIVATE_KEY),
    },
    timestamp: new Date().toISOString(),
  });
});

// GET /api/healthz — alias required by the generated API client (/api/healthz)
router.get("/healthz", async (_req, res) => {
  try {
    await pool.query("SELECT 1");
    res.json({ status: "ok", database: true, timestamp: new Date().toISOString() });
  } catch {
    res.status(503).json({ status: "degraded", database: false, timestamp: new Date().toISOString() });
  }
});

export default router;
