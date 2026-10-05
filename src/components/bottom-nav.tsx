"use client";

import { usePathname } from "next/navigation";

import { type TabItem, TabBar } from "@/ui/composites/tab-bar";
import { IconHome, IconProfile, IconProgress, IconTrainers } from "@/ui/icons";

export type BottomNavLabels = {
  home: string;
  trainers: string;
  progress: string;
  profile: string;
};

/**
 * Нижняя навигация приложения: таб-бар дизайн-системы, активная вкладка
 * вычисляется по текущему маршруту.
 */
export function BottomNav({ labels }: { labels: BottomNavLabels }) {
  const pathname = usePathname();

  const items: TabItem[] = [
    { key: "home", icon: IconHome, label: labels.home, href: "/dashboard" },
    { key: "trainers", icon: IconTrainers, label: labels.trainers, href: "/trainers" },
    { key: "progress", icon: IconProgress, label: labels.progress, href: "/progress" },
    { key: "profile", icon: IconProfile, label: labels.profile, href: "/profile" },
  ];

  // Заглушка /coming-soon стоит за несколькими вкладками — подсвечиваем
  // только настоящие разделы. Сравнение по сегментам, чтобы гипотетический
  // /dashboard-x не подсвечивал /dashboard.
  const active = items.find(
    (item) =>
      item.href !== "/coming-soon" &&
      (pathname === item.href || pathname.startsWith(`${item.href}/`)),
  )?.key;

  return <TabBar items={items} active={active} />;
}
