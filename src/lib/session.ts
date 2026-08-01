import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { cache } from "react";

import { auth } from "./auth";
import { isAdmin } from "./roles";

/**
 * Сессия текущего запроса. `cache` схлопывает повторные вызовы
 * в рамках одного рендера в один поход в БД.
 */
export const getSession = cache(async () => {
  return auth.api.getSession({ headers: await headers() });
});

/** Для защищённых страниц: отдаёт сессию либо уводит на вход (он на главной). */
export async function requireSession() {
  const session = await getSession();
  if (!session) redirect("/");
  return session;
}

/** Для админских страниц: пускает только пользователей с ролью admin. */
export async function requireAdmin() {
  const session = await requireSession();
  if (!isAdmin(session.user)) redirect("/dashboard");
  return session;
}
