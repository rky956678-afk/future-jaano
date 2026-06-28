import { Router } from "express";
import swaggerUi from "swagger-ui-express";
import { readFileSync, existsSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { parse } from "yaml";

const router = Router();

// ─── Load OpenAPI spec ────────────────────────────────────────────────────────

// Try to locate openapi.yaml relative to the monorepo root
// At build time esbuild bundles everything; at runtime __dirname is dist/
const candidates = [
  // Monorepo dev layout: <root>/lib/api-spec/openapi.yaml
  resolve(dirname(fileURLToPath(import.meta.url)), "../../../../lib/api-spec/openapi.yaml"),
  // Fallback: same directory as this file
  resolve(dirname(fileURLToPath(import.meta.url)), "openapi.yaml"),
];

let swaggerDoc: Record<string, unknown> | null = null;
for (const p of candidates) {
  if (existsSync(p)) {
    try {
      swaggerDoc = parse(readFileSync(p, "utf-8")) as Record<string, unknown>;
      break;
    } catch {
      // try next
    }
  }
}

// If no YAML found, produce a minimal inline spec so /docs still works
if (!swaggerDoc) {
  swaggerDoc = {
    openapi: "3.1.0",
    info: {
      title:       "Future Jaano API",
      version:     "1.1.0",
      description: "AI-powered spiritual guidance platform API — full spec at /lib/api-spec/openapi.yaml",
    },
    servers: [{ url: "/api", description: "Base API path" }],
    paths:   {},
  };
}

// ─── Routes ───────────────────────────────────────────────────────────────────

// GET /docs — Swagger UI
router.use("/docs", swaggerUi.serve);
router.get("/docs", swaggerUi.setup(swaggerDoc, {
  customSiteTitle: "Future Jaano API Docs",
  customfavIcon:   "/favicon.ico",
  swaggerOptions:  {
    docExpansion:    "list",
    filter:          true,
    tryItOutEnabled: true,
  },
}));

// GET /docs/openapi.json — raw OpenAPI spec as JSON
router.get("/docs/openapi.json", (_req, res) => {
  res.json(swaggerDoc);
});

export default router;
