/**
 * Сборка колоды тренажёров с учётом прогресса (интервальное повторение):
 * - невиданные и «повторить» — основа колоды, вперемешку;
 * - выученные подмешиваются редко (примерно 1 к LEARNED_EVERY), первыми —
 *   те, что дольше всего не показывались;
 * - всё выучено — сессия целиком из повторения выученных.
 *
 * Перемешивание детерминировано зерном: первая колода собирается одинаково
 * на сервере и при гидрации. Модуль чистый — работает и на клиенте.
 */

export type ProgressStatus = "none" | "repeat" | "learned";

/** Каждый пятый показ — выученный глагол. */
export const LEARNED_EVERY = 5;
/** Ошибка или «Повторить» возвращает задание в колоду через столько позиций. */
export const REPEAT_AFTER = 5;

/** mulberry32 — маленький детерминированный ГПСЧ по числовому зерну. */
export function mulberry32(seed: number) {
  let state = Math.floor(seed * 2 ** 32) || 1;
  return () => {
    state = (state + 0x6d2b79f5) | 0;
    let t = Math.imul(state ^ (state >>> 15), 1 | state);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function shuffle<T>(items: T[], random: () => number): T[] {
  const result = [...items];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

/** Порядок заданий; verbIdOf — по какому глаголу у задания считается прогресс. */
export function buildDeck<T>(
  items: T[],
  verbIdOf: (item: T) => string,
  statuses: Map<string, ProgressStatus>,
  lastViewAt: Map<string, number | null>,
  random: () => number,
): T[] {
  const fresh = items.filter((item) => statuses.get(verbIdOf(item)) !== "learned");
  const learned = items
    .filter((item) => statuses.get(verbIdOf(item)) === "learned")
    // Давно не виденные — первыми в очереди на «вкрапление».
    .sort((a, b) => (lastViewAt.get(verbIdOf(a)) ?? 0) - (lastViewAt.get(verbIdOf(b)) ?? 0));

  if (fresh.length === 0) return learned;

  const base = shuffle(fresh, random);
  const mixCount = Math.min(learned.length, Math.floor(base.length / LEARNED_EVERY));
  const deck: T[] = [];
  let mixed = 0;
  base.forEach((item, i) => {
    deck.push(item);
    if ((i + 1) % LEARNED_EVERY === 0 && mixed < mixCount) deck.push(learned[mixed++]);
  });
  return deck;
}
