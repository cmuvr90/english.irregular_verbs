/**
 * Формат пропусков в предложениях тренажёра «Выбери форму».
 *
 * text хранит маркеры вида [a], [b]; options — массив вариантов на каждый
 * маркер. Postgres не умеет проверять содержимое jsonb-поля, поэтому
 * согласованность text и options держится на validateSentence(): его зовёт
 * сид, и его же обязана звать админка перед сохранением.
 *
 * Модуль не трогает ни запрос, ни prisma — импортируется и на сервере,
 * и в клиентском компоненте тренажёра.
 */

export type SentenceOption = {
  text: string;
  correct: boolean;
};

/** Ключ — маркер пропуска ("a"), значение — его варианты по порядку. */
export type SentenceOptions = Record<string, SentenceOption[]>;

/** Маркер пропуска: одна латинская буква в квадратных скобках. */
const BLANK_PATTERN = /\[([a-z])\]/g;

/** Куски предложения для рендера: текст между пропусками и сами пропуски. */
export type SentencePart =
  | { kind: "text"; value: string }
  | { kind: "blank"; key: string; options: SentenceOption[] };

/** Маркеры пропусков в порядке появления в тексте. */
export function parseBlanks(text: string): string[] {
  // matchAll на глобальном литерале безопасен: lastIndex живёт внутри вызова.
  return [...text.matchAll(BLANK_PATTERN)].map((match) => match[1]);
}

/**
 * Разбирает предложение на части для рендера. Пропуск без вариантов в
 * options отдаётся с пустым массивом — валидация ловит это отдельно,
 * рендер из-за битых данных падать не должен.
 */
export function splitSentence(text: string, options: SentenceOptions): SentencePart[] {
  const parts: SentencePart[] = [];
  let cursor = 0;

  for (const match of text.matchAll(BLANK_PATTERN)) {
    const start = match.index;
    if (start > cursor) parts.push({ kind: "text", value: text.slice(cursor, start) });
    parts.push({ kind: "blank", key: match[1], options: options[match[1]] ?? [] });
    cursor = start + match[0].length;
  }

  if (cursor < text.length) parts.push({ kind: "text", value: text.slice(cursor) });
  return parts;
}

/** Верные варианты пропуска. */
export function correctOptions(options: SentenceOption[]): SentenceOption[] {
  return options.filter((option) => option.correct);
}

/**
 * Верный ответ первого пропуска — для предложений тренажёра, где пропуск
 * один. null — пропуска нет или верный вариант не размечен.
 */
export function firstCorrectAnswer(text: string, options: unknown): string | null {
  const [key] = parseBlanks(text);
  if (!key || !options || typeof options !== "object") return null;
  const variants = (options as Record<string, unknown>)[key];
  if (!Array.isArray(variants)) return null;
  const correct = variants.find(
    (v): v is SentenceOption => typeof v === "object" && v !== null && v.correct === true,
  );
  return typeof correct?.text === "string" ? correct.text : null;
}

/** Вариант ответа в том виде, в каком его приняла бы база: {text, correct}. */
function isSentenceOption(value: unknown): value is SentenceOption {
  return (
    typeof value === "object" &&
    value !== null &&
    typeof (value as SentenceOption).text === "string" &&
    typeof (value as SentenceOption).correct === "boolean"
  );
}

/**
 * Проверяет, что text и options описывают одно и то же упражнение.
 * Возвращает список проблем; пустой список — предложение валидно.
 *
 * options объявлен unknown намеренно: значение приходит из jsonb, где база
 * не проверяет ничего, и функция обязана вернуть список проблем на любой
 * вход, а не упасть с TypeError у вызвавшей её админки.
 *
 * Правило «ровно один верный вариант» намеренно жёсткое: формат multiple
 * choice подразумевает единственный ответ, а несколько верных — это уже
 * другой тип задания (multiple response) со своим подсчётом результата.
 */
export function validateSentence(text: string, options: unknown): string[] {
  const problems: string[] = [];
  const blanks = parseBlanks(text);

  if (blanks.length === 0) {
    problems.push("В тексте нет ни одного пропуска вида [a]");
  }

  if (typeof options !== "object" || options === null || Array.isArray(options)) {
    // Дальше идти некуда: ключи пропусков брать неоткуда.
    return [...problems, 'options должен быть объектом вида {"a": [...]}'];
  }
  const map = options as Record<string, unknown>;

  const seen = new Set<string>();
  for (const key of blanks) {
    if (seen.has(key)) problems.push(`Маркер [${key}] встречается в тексте дважды`);
    seen.add(key);
  }

  for (const key of seen) {
    const raw = map[key];

    if (raw === undefined || raw === null) {
      problems.push(`[${key}]: нет вариантов ответа`);
      continue;
    }
    if (!Array.isArray(raw)) {
      problems.push(`[${key}]: варианты должны быть массивом`);
      continue;
    }
    if (raw.length === 0) {
      problems.push(`[${key}]: нет вариантов ответа`);
      continue;
    }
    // Пока форма элементов не подтверждена, сравнивать тексты и флаги нельзя.
    if (!raw.every(isSentenceOption)) {
      problems.push(`[${key}]: вариант должен быть объектом {text: строка, correct: булево}`);
      continue;
    }
    const variants: SentenceOption[] = raw;

    if (variants.length < 2) {
      problems.push(`[${key}]: нужно минимум два варианта, иначе выбирать не из чего`);
    }

    const correct = correctOptions(variants);
    if (correct.length === 0) problems.push(`[${key}]: нет верного варианта`);
    if (correct.length > 1) {
      problems.push(
        `[${key}]: верных вариантов больше одного (${correct.map((o) => o.text).join(", ")})`,
      );
    }

    const texts = variants.map((option) => option.text.trim());
    if (texts.some((value) => value.length === 0)) {
      problems.push(`[${key}]: есть пустой вариант`);
    }
    // Дубли делают задание нерешаемым: студент выбирает верный текст,
    // а попадает в вариант с correct = false.
    if (new Set(texts).size !== texts.length) {
      problems.push(`[${key}]: варианты дублируются`);
    }
  }

  for (const key of Object.keys(map)) {
    if (!seen.has(key)) {
      problems.push(`options описывает [${key}], но в тексте такого пропуска нет`);
    }
  }

  return problems;
}
