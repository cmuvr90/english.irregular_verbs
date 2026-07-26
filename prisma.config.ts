import { config } from "dotenv";
import { defineConfig } from "prisma/config";

// Prisma CLI работает вне Next.js и сама .env.local не читает.
config({ path: [".env.local", ".env"], quiet: true });

// Схема и миграции лежат по стандартным путям (prisma/) — задавать их не нужно.
export default defineConfig({
  datasource: {
    url: process.env.DATABASE_URL,
  },
});
