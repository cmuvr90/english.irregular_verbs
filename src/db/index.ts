import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";

import * as schema from "./schema";

if (!process.env.DATABASE_URL) {
  throw new Error("Не задан DATABASE_URL — скопируйте .env.example в .env.local");
}

const connectionString = process.env.DATABASE_URL;

/**
 * В dev Next.js перезагружает модули при каждом изменении файла, из-за чего
 * без кеша на globalThis плодились бы новые пулы соединений.
 */
const globalForDb = globalThis as unknown as { pool?: Pool };

const pool =
  globalForDb.pool ??
  new Pool({
    connectionString,
    // На serverless (Vercel) каждый инстанс живёт недолго — держим пул маленьким.
    max: process.env.VERCEL ? 1 : 10,
    idleTimeoutMillis: 30_000,
  });

if (process.env.NODE_ENV !== "production") {
  globalForDb.pool = pool;
}

export const db = drizzle(pool, { schema });

export { schema };
