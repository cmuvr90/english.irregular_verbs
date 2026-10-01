/**
 * Сравнение ответа студента с формой глагола для «Заполни пропуски».
 * Модуль чистый: проверку делает и клиент (мгновенная обратная связь),
 * и сервер (в журнал ошибок не должен попасть верный ответ).
 */

export type FormNumber = 1 | 2 | 3;

export function isFormNumber(value: unknown): value is FormNumber {
  return value === 1 || value === 2 || value === 3;
}

type VerbForms = { form1: string; form2: string; form3: string };

/**
 * Правильные варианты, которых нет в базе. У глаголов с двойными формами
 * сид хранит неправильный вариант (learnt, burnt — см. seed-data/verbs.ts),
 * и в базу их через слеш не пишем: «Карточки» и «Выбери форму» показывают
 * форму как есть, слеш там лишний. Но вписанное «learned» — верный ответ,
 * и засчитывать его ошибкой нельзя.
 *
 * Ключ — инфинитив (form1), значение — дополнительные варианты для V2 и V3.
 */
const ALTERNATIVES: Record<string, { 2?: string[]; 3?: string[] }> = {
  abide: { 2: ["abided"], 3: ["abided"] },
  bereave: { 2: ["bereaved"], 3: ["bereaved"] },
  beseech: { 2: ["beseeched"], 3: ["beseeched"] },
  broadcast: { 2: ["broadcasted"], 3: ["broadcasted"] },
  burn: { 2: ["burned"], 3: ["burned"] },
  dream: { 2: ["dreamed"], 3: ["dreamed"] },
  dwell: { 2: ["dwelled"], 3: ["dwelled"] },
  fit: { 2: ["fitted"], 3: ["fitted"] },
  forbid: { 2: ["forbad"] },
  forecast: { 2: ["forecasted"], 3: ["forecasted"] },
  hang: { 2: ["hanged"], 3: ["hanged"] },
  hew: { 3: ["hewed"] },
  kneel: { 2: ["kneeled"], 3: ["kneeled"] },
  lean: { 2: ["leaned"], 3: ["leaned"] },
  leap: { 2: ["leaped"], 3: ["leaped"] },
  learn: { 2: ["learned"], 3: ["learned"] },
  light: { 2: ["lighted"], 3: ["lighted"] },
  mow: { 3: ["mowed"] },
  prove: { 3: ["proved"] },
  quit: { 2: ["quitted"], 3: ["quitted"] },
  saw: { 3: ["sawed"] },
  sew: { 3: ["sewed"] },
  shave: { 3: ["shaved"] },
  shear: { 3: ["sheared"] },
  shine: { 2: ["shined"], 3: ["shined"] },
  show: { 3: ["showed"] },
  shrink: { 2: ["shrunk"] },
  smell: { 2: ["smelled"], 3: ["smelled"] },
  sow: { 3: ["sowed"] },
  speed: { 2: ["speeded"], 3: ["speeded"] },
  spell: { 2: ["spelled"], 3: ["spelled"] },
  spill: { 2: ["spilled"], 3: ["spilled"] },
  spit: { 2: ["spit"], 3: ["spit"] },
  spoil: { 2: ["spoiled"], 3: ["spoiled"] },
  spring: { 2: ["sprung"] },
  stink: { 2: ["stunk"] },
  strew: { 3: ["strewed"] },
  strive: { 2: ["strived"], 3: ["strived"] },
  sweat: { 2: ["sweated"], 3: ["sweated"] },
  swell: { 3: ["swelled"] },
  tread: { 3: ["trod"] },
  weave: { 2: ["weaved"], 3: ["weaved"] },
  wed: { 2: ["wedded"], 3: ["wedded"] },
  wet: { 2: ["wetted"], 3: ["wetted"] },
};

/** Регистр, лишние пробелы, типографский апостроф и точка в конце — не ошибка. */
export function normalizeAnswer(value: string) {
  return value
    .toLowerCase()
    .replace(/[’`]/g, "'")
    .replace(/[.!?]+$/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

/**
 * Варианты, на которые разбит ответ или форма: "was/were", "was, were",
 * "was or were" и просто "was were" — пробел тоже разделитель, составных
 * форм у неправильных глаголов нет.
 */
function variants(value: string) {
  return normalizeAnswer(value)
    .split(/\s*(?:\/|,|;|\bor\b|\s)\s*/)
    .filter((part) => /[a-z]/.test(part));
}

/** Есть ли в ответе хоть одно слово — «/» или пробелы ответом не считаются. */
export function hasAnswer(typed: string) {
  return variants(typed).length > 0;
}

export function formOf(verb: VerbForms, form: FormNumber) {
  return [verb.form1, verb.form2, verb.form3][form - 1];
}

/**
 * Ответ верен, если каждый введённый вариант — допустимое написание формы.
 * Для "got/gotten" подходят "got", "gotten" и "gotten / got"; для "was/were"
 * хватит одного "was" — оба варианта правильные, второй студент мог не вспомнить.
 */
export function matchesForm(typed: string, verb: VerbForms, form: FormNumber) {
  const answer = variants(typed);
  if (answer.length === 0) return false;

  const key = normalizeAnswer(verb.form1);
  const extra = (Object.hasOwn(ALTERNATIVES, key) && ALTERNATIVES[key][form as 2 | 3]) || [];
  const allowed = new Set([...variants(formOf(verb, form)), ...extra]);
  return answer.every((part) => allowed.has(part));
}

/**
 * Какие формы можно скрыть одним заданием. Совпадающие формы скрываются
 * вместе: если спрятать одну из bring – brought – brought, ответ остался бы
 * на экране рядом. Поэтому варианты — группы позиций с одинаковым написанием:
 * - begin – began – begun → [1], [2], [3];
 * - bring – brought – brought → [1] или [2, 3];
 * - cut – cut – cut → только [2, 3]: все три спрятать нельзя, V1 остаётся
 *   подсказкой, а знание «формы не меняются» и есть ответ.
 */
export function hiddenGroups(verb: VerbForms): FormNumber[][] {
  const norm = [verb.form1, verb.form2, verb.form3].map(normalizeAnswer);
  const groups: FormNumber[][] = [];
  for (const form of [1, 2, 3] as const) {
    const group = groups.find((g) => norm[g[0] - 1] === norm[form - 1]);
    if (group) group.push(form);
    else groups.push([form]);
  }
  return groups.length === 1 ? [[2, 3]] : groups;
}
