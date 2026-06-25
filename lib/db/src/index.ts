import { drizzle } from "drizzle-orm/node-postgres";
import pg from "pg";
import * as schema from "./schema";

const { Pool } = pg;

// Lazy initialization - don't crash at import time if DATABASE_URL is missing.
// The error will surface when the first DB query is made.
const DATABASE_URL = process.env.DATABASE_URL;

if (!DATABASE_URL) {
  console.warn(
    "[db] WARNING: DATABASE_URL is not set. Database operations will fail. " +
    "Add a PostgreSQL database in Railway Variables."
  );
}

export const pool = new Pool({
  connectionString: DATABASE_URL || "postgresql://noop:noop@localhost:5432/noop",
});
export const db = drizzle(pool, { schema });

export * from "./schema";
