/**
 * Роли пользователей. Модуль без зависимостей от запроса — можно импортировать
 * и на сервере, и в клиентских компонентах.
 *
 * - student — обычный пользователь: регистрируется и учит глаголы.
 *   Назначается автоматически при регистрации.
 * - admin — административный доступ; функциональность будет развиваться отдельно.
 *   Назначить можно только вручную (в БД) или через admin-API Better Auth.
 */
export const roles = ["student", "admin"] as const;

export type Role = (typeof roles)[number];

export const defaultRole: Role = "student";

export function isAdmin(user: { role?: string | null } | null | undefined) {
  return user?.role === "admin";
}
