import { config } from "dotenv";
import { defineConfig } from "prisma/config";

// Prisma CLI работает вне Next.js и сама .env.local не читает.
config({ path: [".env.local", ".env"], quiet: true });

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
  },
  datasource: {
    url: process.env.DATABASE_URL,
  },
});
