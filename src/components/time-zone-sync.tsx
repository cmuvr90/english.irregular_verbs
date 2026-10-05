"use client";

import { useEffect } from "react";

import { TIME_ZONE_COOKIE } from "@/lib/time-zone";

/**
 * Кладёт часовой пояс браузера в cookie, чтобы сервер считал серию дней
 * и цель дня по календарю студента. Ничего не рисует; пишет cookie, только
 * если пояс изменился (переезд, путешествие).
 */
export function TimeZoneSync() {
  useEffect(() => {
    const zone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    if (!zone) return;
    const current = document.cookie
      .split("; ")
      .find((part) => part.startsWith(`${TIME_ZONE_COOKIE}=`))
      ?.slice(TIME_ZONE_COOKIE.length + 1);
    if (current && decodeURIComponent(current) === zone) return;
    document.cookie = `${TIME_ZONE_COOKIE}=${encodeURIComponent(zone)}; path=/; max-age=${60 * 60 * 24 * 365}; samesite=lax`;
  }, []);

  return null;
}
