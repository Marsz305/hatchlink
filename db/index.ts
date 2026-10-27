import "server-only";
import postgres from "postgres";
import { drizzle } from "drizzle-orm/postgres-js";
import * as schema from "./schema";

const globalForDb = globalThis as typeof globalThis & {
  hatchLinkSql?: ReturnType<typeof postgres>;
};

function getSql() {
  const connectionString = process.env.DATABASE_URL;

  if (!connectionString) {
    throw new Error("DATABASE_URL is not configured");
  }

  // Reuse one connection pool within a serverless instance.
  const sql =
    globalForDb.hatchLinkSql ??
    postgres(connectionString, {
      max: 1,
      prepare: false,
      connect_timeout: 10,
    });

  if (process.env.NODE_ENV !== "production") {
    globalForDb.hatchLinkSql = sql;
  }

  return sql;
}

export function getDb() {
  return drizzle(getSql(), { schema });
}
