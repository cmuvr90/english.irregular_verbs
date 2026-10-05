"use client";

import { useMotionValueEvent, useScroll } from "motion/react";
import * as m from "motion/react-m";
import Link from "next/link";
import { useState } from "react";

import { cn } from "../cn";
import { IconBack } from "../icons";
import { spring } from "../motion/presets";

export type TopBarProps = {
  title: string;
  subtitle?: string;
  back?: { href: string; label: string };
  /** Кнопки справа: серия, уведомления, профиль. */
  actions?: React.ReactNode;
  /** Прятать при скролле вниз и возвращать при скролле вверх. */
  hideOnScroll?: boolean;
  /** fixed — прибит к верху экрана; static — для витрин. */
  position?: "fixed" | "static";
  className?: string;
};

/** Шапка экрана на стекле: прозрачная наверху, «запотевает» при прокрутке. */
export function TopBar({ title, subtitle, back, actions, hideOnScroll = true, position = "fixed", className }: TopBarProps) {
  const { scrollY } = useScroll();
  const [hidden, setHidden] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useMotionValueEvent(scrollY, "change", (y) => {
    const prev = scrollY.getPrevious() ?? 0;
    setScrolled(y > 8);
    // Порог гасит дрожание от инерционного скролла; у верха страницы шапка видна всегда.
    if (hideOnScroll && Math.abs(y - prev) > 6) setHidden(y > prev && y > 72);
  });

  return (
    <m.header
      inert={hidden}
      animate={{ y: hidden ? "-110%" : "0%" }}
      transition={spring.gentle}
      className={cn(
        position === "fixed" && "fixed inset-x-0 top-0 z-30",
        "border-b transition-[background-color,border-color,backdrop-filter] duration-300",
        scrolled ? "glass border-x-0 border-t-0 border-hairline/70" : "border-transparent bg-transparent",
        className,
      )}
    >
      <div className="mx-auto flex w-full max-w-md items-center gap-3 px-5 py-3">
        {back && (
          <Link
            href={back.href}
            aria-label={back.label}
            title={back.label}
            className="focus-ring -ml-1 flex size-10 shrink-0 items-center justify-center rounded-full bg-surface text-fg shadow-sm ring-1 ring-hairline transition-colors hover:text-ink-600"
          >
            <IconBack size={20} weight="bold" aria-hidden />
          </Link>
        )}
        <div className="min-w-0 flex-1">
          <h1 className="t-heading truncate text-fg-strong">{title}</h1>
          {subtitle && <p className="t-caption truncate text-fg-muted">{subtitle}</p>}
        </div>
        {actions && <div className="flex shrink-0 items-center gap-2">{actions}</div>}
      </div>
    </m.header>
  );
}
