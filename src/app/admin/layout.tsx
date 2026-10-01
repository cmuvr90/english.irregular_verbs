import type { Metadata } from "next";

import { AdminShell } from "@/components/admin/admin-shell";
import { requireAdmin } from "@/lib/session";

export const metadata: Metadata = {
  title: { default: "Админка", template: "%s · Админка" },
  robots: { index: false },
};

/**
 * Оболочка админки. Интерфейс только на русском: им пользуются редакторы,
 * а не студенты, и тянуть его строки во все словари незачем.
 *
 * Проверка роли здесь — для сайдбара; каждая страница и каждый экшен проверяют
 * доступ сами: layout не перерендеривается при клиентской навигации.
 */
export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await requireAdmin();

  return (
    <AdminShell user={{ name: session.user.name, email: session.user.email }}>
      {children}
    </AdminShell>
  );
}
