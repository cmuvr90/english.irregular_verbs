"use client";

import Link from "next/link";
import * as m from "motion/react-m";

import { cn } from "../cn";
import type { Icon } from "../icons";
import { spring } from "../motion/presets";

export type TabItem = { key: string; label: string; href: string; icon: Icon };

export type TabBarProps = {
  items: TabItem[];
  /** key активной вкладки; вычисляется страницей по маршруту. */
  active?: string;
  /** fixed — прибит к низу экрана (в приложении); static — для витрин. */
  position?: "fixed" | "static";
  className?: string;
};

/**
 * Плавающий таб-бар на матовом стекле. Подсветка активной вкладки
 * перетекает между пунктами (layoutId), иконка активной — залитая.
 */
export function TabBar({ items, active, position = "fixed", className }: TabBarProps) {
  return (
    <nav
      className={cn(
        position === "fixed" && "fixed inset-x-0 bottom-0 z-30 px-4 pb-[max(0.75rem,env(safe-area-inset-bottom))]",
        className,
      )}
    >
      <ul className="glass mx-auto flex max-w-md items-stretch gap-1 rounded-2xl p-1.5 shadow-float">
        {items.map(({ key, label, href, icon: Glyph }) => {
          const isActive = key === active;
          return (
            <li key={key} className="flex-1">
              <Link
                href={href}
                aria-current={isActive ? "page" : undefined}
                className={cn(
                  "focus-ring relative flex flex-col items-center gap-0.5 rounded-xl py-2 text-[11px] transition-colors",
                  isActive ? "font-semibold text-ink-700" : "text-fg-muted hover:text-fg",
                )}
              >
                {isActive && (
                  <m.span
                    layoutId="tab-bar-active"
                    className="absolute inset-0 rounded-xl bg-ink-50 ring-1 ring-ink-100"
                    transition={spring.snappy}
                  />
                )}
                <m.span
                  className="relative"
                  animate={isActive ? { y: -1, scale: 1.08 } : { y: 0, scale: 1 }}
                  transition={spring.bouncy}
                >
                  <Glyph size={24} weight={isActive ? "fill" : "regular"} aria-hidden />
                </m.span>
                <span className="relative">{label}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
