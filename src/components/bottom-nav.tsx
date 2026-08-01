"use client";

import { ChartColumn, Dumbbell, House, User } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

export type BottomNavLabels = {
  home: string;
  trainers: string;
  progress: string;
  profile: string;
};

/**
 * Нижняя навигация как таб-бар мобильного приложения: присутствует на всех
 * основных экранах, активная вкладка вычисляется по текущему маршруту.
 */
export function BottomNav({ labels }: { labels: BottomNavLabels }) {
  const pathname = usePathname();

  const items = [
    { icon: <House size={22} />, label: labels.home, href: "/dashboard" },
    { icon: <Dumbbell size={22} />, label: labels.trainers, href: "/trainers" },
    { icon: <ChartColumn size={20} />, label: labels.progress, href: "/coming-soon" },
    { icon: <User size={22} />, label: labels.profile, href: "/coming-soon" },
  ];

  return (
    <nav className="fixed inset-x-0 bottom-0 z-20 border-t border-line/60 bg-white/95 backdrop-blur">
      <div className="mx-auto grid w-full max-w-md grid-cols-4 pb-[max(0px,env(safe-area-inset-bottom))]">
        {items.map((item) => {
          // Заглушка /coming-soon стоит за несколькими вкладками —
          // подсвечиваем только настоящие разделы. Сравнение по сегментам,
          // чтобы гипотетический /dashboard-x не подсвечивал /dashboard.
          const active =
            item.href !== "/coming-soon" &&
            (pathname === item.href || pathname.startsWith(`${item.href}/`));
          return (
            <Link
              key={item.label}
              href={item.href}
              aria-current={active ? "page" : undefined}
              className={`relative flex flex-col items-center gap-1 pt-3 pb-2.5 text-[11px] ${
                active
                  ? "font-semibold text-blue-600"
                  : "text-subtle transition-colors hover:text-foreground"
              }`}
            >
              {active && <span className="absolute top-0 h-1 w-10 rounded-b-full bg-blue-600" />}
              {item.icon}
              {item.label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
