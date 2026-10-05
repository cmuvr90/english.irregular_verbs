import "server-only";

import { cookies } from "next/headers";
import { cache } from "react";

import { FALLBACK_TIME_ZONE, isTimeZone, TIME_ZONE_COOKIE } from "./time-zone";

/** Пояс текущего запроса из cookie; `cache` схлопывает вызовы одного рендера. */
export const getTimeZone = cache(async (): Promise<string> => {
  const value = (await cookies()).get(TIME_ZONE_COOKIE)?.value;
  return isTimeZone(value) ? value : FALLBACK_TIME_ZONE;
});
