"use client";

import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";

/**
 * Фиксированная шапка в стиле мобильных приложений: не прокручивается
 * с контентом, прячется при скролле вниз и возвращается при скролле вверх.
 */
export function AppHeader({
  backHref,
  backLabel,
  title,
  subtitle,
}: {
  backHref: string;
  backLabel: string;
  title: string;
  subtitle?: string;
}) {
  const [hidden, setHidden] = useState(false);
  const lastY = useRef(0);

  useEffect(() => {
    lastY.current = window.scrollY;

    const onScroll = () => {
      const y = window.scrollY;
      const delta = y - lastY.current;
      // Порог в 8px гасит дрожание от инерции и микроскроллов. lastY двигаем
      // только после срабатывания, чтобы медленный скролл накапливал дельту,
      // а не обнулял её на каждом событии.
      if (Math.abs(delta) < 8) return;
      lastY.current = y;
      // Возле верха страницы шапка видна всегда.
      setHidden(delta > 0 && y > 64);
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      // inert убирает скрытую шапку из фокуса и дерева доступности,
      // иначе Tab уводил бы фокус в уехавшую за экран ссылку.
      inert={hidden}
      className={`fixed inset-x-0 top-0 z-20 border-b border-line/60 bg-white/95 backdrop-blur transition-transform duration-300 ${
        hidden ? "-translate-y-full" : ""
      }`}
    >
      <div className="mx-auto w-full max-w-md px-5 py-3">
        <Link
          href={backHref}
          className="flex items-center gap-1.5 text-sm font-medium text-subtle transition-colors hover:text-foreground"
        >
          <ArrowLeft size={16} />
          {backLabel}
        </Link>
        <h1 className="mt-1 truncate text-xl font-bold tracking-tight">{title}</h1>
        {subtitle && <p className="mt-0.5 line-clamp-2 text-xs text-subtle">{subtitle}</p>}
      </div>
    </header>
  );
}
