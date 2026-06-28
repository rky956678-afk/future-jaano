import http from "node:http";
import app from "./app";
import { logger } from "./lib/logger";
import { startPushCron } from "./lib/cron";

const port = Number(process.env.PORT || "3000");

if (Number.isNaN(port) || port <= 0) {
  logger.error(`Invalid PORT value: "${process.env.PORT}"`);
  process.exit(1);
}

const server = http.createServer(app);

server.listen(port, () => {
  logger.info({ port, env: process.env.NODE_ENV ?? "development" }, "🚀 Future Jaano API started");

  if (process.env.DATABASE_URL) {
    startPushCron();
    logger.info("Push notification cron started");
  } else {
    logger.warn("DATABASE_URL not set — skipping push cron");
  }
});

server.on("error", (err: NodeJS.ErrnoException) => {
  if (err.code === "EADDRINUSE") {
    logger.error({ port }, "Port already in use");
  } else {
    logger.error({ err }, "Server error");
  }
  process.exit(1);
});

// ─── Graceful shutdown ────────────────────────────────────────────────────────

async function shutdown(signal: string) {
  logger.info({ signal }, "Received shutdown signal — starting graceful shutdown");

  // Stop accepting new connections
  server.close(async (err) => {
    if (err) {
      logger.error({ err }, "Error closing server");
      process.exit(1);
    }

    // Close DB pool
    try {
      const { pool } = await import("@workspace/db");
      await pool.end();
      logger.info("Database pool closed");
    } catch (dbErr) {
      logger.error({ err: dbErr }, "Error closing DB pool");
    }

    logger.info("Graceful shutdown complete");
    process.exit(0);
  });

  // Force exit after 10 s if graceful shutdown hangs
  setTimeout(() => {
    logger.error("Graceful shutdown timed out — forcing exit");
    process.exit(1);
  }, 10_000).unref();
}

process.on("SIGTERM", () => shutdown("SIGTERM"));
process.on("SIGINT",  () => shutdown("SIGINT"));

// ─── Unhandled rejections / exceptions ───────────────────────────────────────

process.on("unhandledRejection", (reason) => {
  logger.error({ reason }, "Unhandled promise rejection");
});

process.on("uncaughtException", (err) => {
  logger.error({ err }, "Uncaught exception — shutting down");
  shutdown("uncaughtException");
});
