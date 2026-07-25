import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { cache } from "react";

import { auth } from "./auth";

/**
 * Сессия текущего запроса. `cache` схлопывает повторные вызовы
 * в рамках одного рендера в один поход в БД.
 */
export const getSession = cache(async () => {
  return auth.api.getSession({ headers: await headers() });
});

/** Для защищённых страниц: отдаёт сессию либо уводит на вход. */
export async function requireSession() {
  const session = await getSession();
  if (!session) redirect("/sign-in");
  return session;
}
