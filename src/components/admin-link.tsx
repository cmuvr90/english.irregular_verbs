import { isAdmin } from "@/lib/roles";
import { getSession } from "@/lib/session";
import { IconAdmin } from "@/ui/icons";
import { IconButtonLink } from "@/ui/primitives/icon-button-link";

/**
 * Кнопка в админку для шапки страниц приложения. Видна только админам:
 * остальным не рендерится вовсе. Сессия берётся из кеша запроса — страница
 * её уже запросила, лишнего похода в БД нет. Сам доступ к /admin всё равно
 * проверяет requireAdmin: кнопка — только навигация.
 */
export async function AdminLink({ label }: { label: string }) {
  const session = await getSession();
  if (!isAdmin(session?.user)) return null;
  return <IconButtonLink href="/admin" icon={IconAdmin} label={label} />;
}
