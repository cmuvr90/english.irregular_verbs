import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { nextCookies } from "better-auth/next-js";

import { db, schema } from "@/db";

const isDev = process.env.NODE_ENV === "development";

/**
 * Better Auth сверяет Origin запроса с baseURL, поэтому важно, чтобы адрес
 * совпадал с тем, на котором реально поднялось приложение.
 *
 * В dev разрешаем любой локальный порт: если 3000 занят, Next.js молча
 * переезжает на 3001 — с жёстко прописанным адресом это давало "Invalid origin".
 */
function getBaseURL() {
  if (isDev && !process.env.BETTER_AUTH_URL) {
    return {
      allowedHosts: ["localhost:*", "127.0.0.1:*"],
      protocol: "http" as const,
      fallback: "http://localhost:3000",
    };
  }
  if (process.env.BETTER_AUTH_URL) return process.env.BETTER_AUTH_URL;
  // На Vercel домен превью-деплоя заранее неизвестен — берём из окружения.
  if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}`;
  return undefined;
}

export const auth = betterAuth({
  baseURL: getBaseURL(),
  secret: process.env.BETTER_AUTH_SECRET,
  database: drizzleAdapter(db, {
    provider: "pg",
    schema,
  }),
  emailAndPassword: {
    enabled: true,
    minPasswordLength: 8,
    // Для болванки письма не отправляем — аккаунт активен сразу после регистрации.
    requireEmailVerification: false,
  },
  session: {
    expiresIn: 60 * 60 * 24 * 7, // 7 дней
    updateAge: 60 * 60 * 24, // продлевать раз в сутки
    cookieCache: {
      // Сессия кешируется в подписанной куке — меньше запросов в БД на каждый рендер.
      enabled: true,
      maxAge: 5 * 60,
    },
  },
  // nextCookies() должен идти последним в списке плагинов.
  plugins: [nextCookies()],
});

export type Session = typeof auth.$Infer.Session;
