import app from "./app";
import { logger } from "./lib/logger";
import { startPushCron } from "./lib/cron";

const port = Number(process.env.PORT || "3000");

if (Number.isNaN(port) || port <= 0) {
  throw new Error(`Invalid PORT value: "${process.env.PORT}"`);
}

app.listen(port, (err) => {
  if (err) {
    logger.error({ err }, "Error listening on port");
    process.exit(1);
  }

  logger.info({ port }, "Server listening");

  if (process.env.DATABASE_URL) {
    startPushCron();
  } else {
    logger.warn("DATABASE_URL not set — skipping push cron. Add PostgreSQL in Railway Variables.");
  }
});
