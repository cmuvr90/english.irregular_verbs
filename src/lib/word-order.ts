import { firstCorrectAnswer, splitSentence, type SentenceOptions } from "@/lib/sentence-options";

/**
 * «Расставь слова по порядку». Модуль чистый: колоду собирает клиент,
 * а сервер по тем же функциям проверяет, что в журнал ошибок попал
 * действительно неверный порядок слов этого предложения.
 *
 * Слова не нормализуются: заглавная буква и точка остаются на своих словах.
 * Это намеренно — без них у «Yesterday she hit her leg on the table.»
 * было бы несколько грамматичных порядков, а засчитать можно только один.
 */

/** Предложение тренажёра «Выбери форму» с подставленной верной формой. */
export function fillSentence(text: string, options: SentenceOptions | unknown): string | null {
  const answer = firstCorrectAnswer(text, options);
  if (!answer) return null;
  return splitSentence(text, {})
    .map((part) => (part.kind === "text" ? part.value : answer))
    .join("")
    .replace(/\s+/g, " ")
    .trim();
}

export function tokenize(sentence: string): string[] {
  return sentence.split(/\s+/).filter(Boolean);
}

export function sameOrder(a: string[], b: string[]) {
  return a.length === b.length && a.every((word, i) => word === b[i]);
}

/** Те же слова в любом порядке — с учётом повторов («the … the»). */
export function isPermutation(a: string[], b: string[]) {
  if (a.length !== b.length) return false;
  const counts = new Map<string, number>();
  for (const word of a) counts.set(word, (counts.get(word) ?? 0) + 1);
  for (const word of b) {
    const left = counts.get(word);
    if (!left) return false;
    counts.set(word, left - 1);
  }
  return true;
}
