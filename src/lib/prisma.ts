import { PrismaPg } from "@prisma/adapter-pg";

import { PrismaClient } from "../../generated/prisma/client";

if (!process.env.DATABASE_URL) {
  throw new Error("Не задан DATABASE_URL — скопируйте .env.example в .env.local");
}

/**
 * Prisma 7 больше не поставляет встроенный движок запросов: подключение идёт
 * через driver adapter — здесь это node-postgres поверх обычного пула.
 */
function createClient() {
  const adapter = new PrismaPg({
    connectionString: process.env.DATABASE_URL,
    // На serverless (Vercel) держим пул меньше, чем локально, но не 1:
    // Better Auth пишет через интерактивные $transaction, каждая из которых
    // занимает соединение целиком — с max: 1 параллельные запросы упирались бы
    // в единственное соединение (P2028) даже при небольшой нагрузке.
    max: process.env.VERCEL ? 5 : 10,
    idleTimeoutMillis: 30_000,
  });

  return new PrismaClient({
    adapter,
    log: process.env.NODE_ENV === "development" ? ["warn", "error"] : ["error"],
  });
}

/**
 * В dev Next.js перезагружает модули при каждом изменении файла, из-за чего
 * без кеша на globalThis плодились бы новые пулы соединений.
 */
const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

export const prisma = globalForPrisma.prisma ?? createClient();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
