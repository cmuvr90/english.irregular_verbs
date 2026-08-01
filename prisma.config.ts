import { config } from "dotenv";
import { defineConfig } from "prisma/config";

// Prisma CLI работает вне Next.js и сама .env.local не читает.
config({ path: [".env.local", ".env"], quiet: true });

// Интеграция Prisma Postgres на Vercel ставит один и тот же URL под несколькими
// именами (DATABASE_URL, POSTGRES_URL, PRISMA_DATABASE_URL) — берём первое
// доступное. Локально это DATABASE_URL из .env.local.
const databaseUrl =
  process.env.DATABASE_URL ??
  process.env.PRISMA_DATABASE_URL ??
  process.env.POSTGRES_URL;

// Схема и миграции лежат по стандартным путям (prisma/) — задавать их не нужно.
export default defineConfig({
  datasource: {
    url: databaseUrl,
  },
  migrations: {
    // `prisma db seed` и авто-сид после `migrate reset`.
    seed: "tsx prisma/seed.ts",
  },
});
