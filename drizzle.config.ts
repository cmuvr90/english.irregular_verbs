import { config } from "dotenv";
import { defineConfig } from "drizzle-kit";

// drizzle-kit запускается вне Next.js, поэтому .env.local читаем вручную.
config({ path: [".env.local", ".env"], quiet: true });

export default defineConfig({
  schema: "./src/db/schema.ts",
  out: "./drizzle",
  dialect: "postgresql",
  dbCredentials: {
    url: process.env.DATABASE_URL!,
  },
  verbose: true,
  strict: true,
});
