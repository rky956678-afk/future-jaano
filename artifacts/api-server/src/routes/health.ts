import { Router } from "express";

const router = Router();

// GET /api/health
router.get("/health", (_req, res) => {
  res.json({
    success: true,
    status: "ok",
    timestamp: new Date().toISOString(),
  });
});

// GET /api/status
router.get("/status", (_req, res) => {
  res.json({
    success: true,
    api: "Future Jaano API",
    version: "1.0.0",
    status: "operational",
    timestamp: new Date().toISOString(),
  });
});

export default router;
