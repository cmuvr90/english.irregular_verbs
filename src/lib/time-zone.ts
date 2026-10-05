/**
 * Часовой пояс студента. Серия дней и цель «на сегодня» считаются по его
 * календарю, а не по часам сервера: иначе вечернее занятие в Минске после
 * полуночи по UTC засчитывалось бы следующему дню.
 *
 * Пояс браузер кладёт в cookie (см. TimeZoneSync), сервер читает его отсюда.
 */
export const TIME_ZONE_COOKIE = "tz";

/** Пока cookie нет (самый первый заход) — считаем по UTC. */
export const FALLBACK_TIME_ZONE = "UTC";

/** Значение cookie приходит от клиента — пропускаем только то, что знает Intl. */
export function isTimeZone(value: unknown): value is string {
  if (typeof value !== "string" || value.length === 0 || value.length > 64) return false;
  try {
    new Intl.DateTimeFormat("en", { timeZone: value });
    return true;
  } catch {
    return false;
  }
}

/** Календарная дата в поясе как YYYY-MM-DD (en-CA форматирует именно так). */
export function dayIn(timeZone: string, date = new Date()) {
  return new Intl.DateTimeFormat("en-CA", { timeZone }).format(date);
}

/** Сдвиг даты YYYY-MM-DD на n календарных дней — без шагов по 24 часа и сюрпризов перевода часов. */
export function shiftDay(day: string, n: number) {
  const [year, month, date] = day.split("-").map(Number);
  return new Date(Date.UTC(year, month - 1, date + n)).toISOString().slice(0, 10);
}
