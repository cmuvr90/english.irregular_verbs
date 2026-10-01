"use client";

import {
  ArrowLeft,
  BookOpen,
  Dumbbell,
  LayoutDashboard,
  List,
  Menu,
  MessageSquareText,
  Tags,
  Users,
  X,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

type NavItem = { label: string; href: string; icon: React.ReactNode };

const NAV: { label?: string; items: NavItem[] }[] = [
  { items: [{ label: "Обзор", href: "/admin", icon: <LayoutDashboard /> }] },
  {
    label: "Тренажёры",
    items: [{ label: "Что где настраивается", href: "/admin/trainers", icon: <Dumbbell /> }],
  },
  {
    label: "Контент",
    items: [
      { label: "Глаголы", href: "/admin/verbs", icon: <List /> },
      { label: "Группы", href: "/admin/groups", icon: <Tags /> },
      { label: "Предложения", href: "/admin/sentences", icon: <MessageSquareText /> },
    ],
  },
  {
    label: "Доступ",
    items: [{ label: "Пользователи", href: "/admin/users", icon: <Users /> }],
  },
];

/** Активен самый длинный совпавший пункт: на /admin/verbs/1 — «Глаголы», а не «Обзор». */
function findActive(pathname: string) {
  return NAV.flatMap((group) => group.items)
    .filter((item) => pathname === item.href || pathname.startsWith(`${item.href}/`))
    .sort((a, b) => b.href.length - a.href.length)[0]?.href;
}

const menuButton =
  "flex h-8 w-full items-center gap-2 rounded-md px-2 text-sm text-white/80 transition-colors hover:bg-white/10 hover:text-white [&_svg]:size-4 [&_svg]:shrink-0";

/**
 * Каркас админки: тёмный сайдбар слева, колонка контента справа.
 * На узком экране сайдбар выезжает поверх контента по кнопке в верхней полосе.
 */
export function AdminShell({
  user,
  children,
}: {
  user: { name: string; email: string };
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const active = findActive(pathname);
  // Запоминаем адрес, на котором открыли мобильное меню: переход по ссылке
  // меняет pathname, и меню закрывается само, без эффекта.
  const [openedAt, setOpenedAt] = useState<string | null>(null);
  const open = openedAt === pathname;
  const setOpen = (value: boolean) => setOpenedAt(value ? pathname : null);

  const initial = (user.name || user.email).charAt(0).toUpperCase();

  const sidebar = (
    <div className="flex h-full w-64 flex-col bg-slate-900 text-white">
      {/* логотип */}
      <div className="p-2">
        <Link href="/admin" className="flex items-center gap-2 rounded-md p-2 hover:bg-white/10">
          <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-blue-500 text-white">
            <BookOpen className="size-4" />
          </span>
          <span className="flex min-w-0 flex-col">
            <span className="truncate text-sm leading-snug font-semibold">Irregular Verbs</span>
            <span className="truncate text-xs opacity-70">Админка</span>
          </span>
        </Link>
      </div>

      {/* навигация */}
      <nav className="flex min-h-0 flex-1 flex-col overflow-y-auto">
        {NAV.map((group, index) => (
          <div key={group.label ?? index} className="p-2">
            {group.label && (
              <div className="flex h-8 items-center px-2 text-xs font-medium text-white/50">
                {group.label}
              </div>
            )}
            <ul className="flex flex-col gap-1">
              {group.items.map((item) => {
                const isActive = item.href === active;
                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      aria-current={isActive ? "page" : undefined}
                      className={`${menuButton} ${isActive ? "bg-blue-500/20 font-medium text-white" : ""}`}
                    >
                      {item.icon}
                      <span className="truncate">{item.label}</span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </nav>

      {/* низ: возврат в приложение и пользователь */}
      <div className="flex flex-col gap-2 border-t border-white/10 p-2">
        <Link href="/dashboard" className={menuButton}>
          <ArrowLeft />
          <span>В приложение</span>
        </Link>
        <div className="flex items-center gap-2 rounded-md p-2">
          <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-white/10 text-sm font-semibold">
            {initial}
          </span>
          <span className="flex min-w-0 flex-col">
            <span className="truncate text-sm font-semibold">{user.name || user.email}</span>
            <span className="truncate text-xs opacity-70">{user.email}</span>
          </span>
        </div>
      </div>
    </div>
  );

  return (
    <div className="flex min-h-svh w-full bg-slate-50">
      {/* десктоп: сайдбар закреплён, под ним — пустое место той же ширины */}
      <aside className="hidden w-64 shrink-0 md:block">
        <div className="fixed inset-y-0 left-0 z-10">{sidebar}</div>
      </aside>

      {/* мобильный: выезжающая панель */}
      {open && (
        <div className="fixed inset-0 z-30 md:hidden">
          <button
            type="button"
            aria-label="Закрыть меню"
            onClick={() => setOpen(false)}
            className="absolute inset-0 bg-black/50"
          />
          <div className="relative h-full w-fit">{sidebar}</div>
        </div>
      )}

      <div className="flex min-w-0 flex-1 flex-col">
        <div className="flex h-12 items-center px-4">
          <button
            type="button"
            aria-label={open ? "Закрыть меню" : "Открыть меню"}
            onClick={() => setOpen(!open)}
            className="flex size-8 items-center justify-center rounded-md text-subtle hover:bg-muted hover:text-foreground md:hidden"
          >
            {open ? <X size={18} /> : <Menu size={18} />}
          </button>
        </div>
        <main className="mx-auto flex w-full max-w-6xl flex-1 flex-col gap-10 px-6 pb-12">
          {children}
        </main>
      </div>
    </div>
  );
}
