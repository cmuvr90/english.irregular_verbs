/**
 * Ряд по дням для графика: последние N календарных дней (включая сегодня
 * в timeZone), пропуски заполнены нулями.
 *
 * Дни перебираются календарной арифметикой от сегодняшней даты, а не шагами
 * по 24 часа от текущего момента: около перевода часов такой шаг попадает
 * в один и тот же день дважды или перепрыгивает день.
 */
export function fillDays(
  rows: { day: string; count: number }[],
  days: number,
  timeZone: string,
): { day: string; count: number }[] {
  const byDay = new Map(rows.map((row) => [row.day, row.count]));
  // en-CA форматирует дату как YYYY-MM-DD — тот же ключ, что отдаёт to_char в SQL.
  const today = new Intl.DateTimeFormat("en-CA", { timeZone }).format(new Date());
  const [year, month, date] = today.split("-").map(Number);

  const result: { day: string; count: number }[] = [];
  for (let i = days - 1; i >= 0; i--) {
    // Date.UTC сам переносит отрицательные числа через границы месяцев и лет.
    const day = new Date(Date.UTC(year, month - 1, date - i)).toISOString().slice(0, 10);
    result.push({ day, count: byDay.get(day) ?? 0 });
  }
  return result;
}

/** Доля верных ответов в процентах; null — ответов ещё не было. */
export function accuracy(know: number, repeat: number) {
  const total = know + repeat;
  return total === 0 ? null : Math.round((know / total) * 100);
}
