"use client";

import { ArrowLeft, ArrowRight, CircleCheck, CircleX, Flame, RotateCw, Undo2 } from "lucide-react";
import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";

import type { FlashcardProgress } from "@/components/trainers/flashcards-trainer";
import { interpolate } from "@/lib/locales";
import { answerCard, recordCardView } from "@/lib/trainer-actions";
import { buildDeck, mulberry32, REPEAT_AFTER, shuffle } from "@/lib/trainer-deck";
import { stepIcon } from "@/lib/trainer-icons";
import type { TrainerSettings } from "@/lib/trainer-settings";
import { sameOrder, tokenize } from "@/lib/word-order";

/**
 * Тренажёр «Расставь слова по порядку» (word-order): студент видит перевод
 * и перемешанные слова английского предложения и собирает его, нажимая на
 * слова. Предложения — те же, что у «Выбери форму», с подставленной верной
 * формой (страница присылает их уже собранными).
 *
 * Слова различаются по позиции, а не по тексту: в предложении бывает два
 * одинаковых «the», и вернуть из ответа нужно именно нажатое.
 */

export type OrderSentence = {
  id: string;
  /** Глагол, на который пишется прогресс. */
  verbId: string;
  /** Предложение с подставленной верной формой. */
  sentence: string;
  /** Перевод и разбор на языке интерфейса; пустая строка — блок не рисуем. */
  translation: string;
  explanation: string;
};

export type WordOrderLabels = {
  howItWorks: string;
  check: string;
  reset: string;
  yourAnswer: string;
  correct: string;
  wrong: string;
  correctAnswer: string;
  why: string;
  next: string;
  finishTitle: string;
  scoreText: string;
  correctCount: string;
  mistakes: string;
  again: string;
  empty: string;
  back: string;
};

type Props = {
  trainerId: string;
  title: string;
  settings: TrainerSettings;
  sentences: OrderSentence[];
  progress: FlashcardProgress[];
  labels: WordOrderLabels;
  backHref: string;
  /** Зерно с сервера: SSR и гидрация видят одну колоду и один порядок слов. */
  seed: number;
};

/** Задание: предложение, его слова по порядку и они же вперемешку (индексы). */
type Task = { item: OrderSentence; words: string[]; shuffled: number[] };

const stepChips = [
  "bg-violet-100 text-violet-600",
  "bg-blue-100 text-blue-600",
  "bg-emerald-100 text-emerald-600",
];

/**
 * Перемешивает так, чтобы порядок не совпал с ответом: иначе задание решено
 * до того, как студент что-то нажал. Предложение из одинаковых слов (или из
 * одного слова) перемешать нельзя — его в колоду не берём.
 */
function buildTask(item: OrderSentence, random: () => number): Task | null {
  const words = tokenize(item.sentence);
  if (new Set(words).size < 2) return null;
  const indices = words.map((_, i) => i);
  let shuffled = shuffle(indices, random);
  for (let attempt = 0; attempt < 5 && sameOrder(shuffled.map((i) => words[i]), words); attempt++) {
    shuffled = shuffle(indices, random);
  }
  // Пять неудач подряд — почти невозможно; тогда просто сдвигаем на одно слово.
  if (sameOrder(shuffled.map((i) => words[i]), words)) shuffled = [...indices.slice(1), indices[0]];
  return { item, words, shuffled };
}

function buildTasks(
  sentences: OrderSentence[],
  statuses: Map<string, "none" | "repeat" | "learned">,
  lastViews: Map<string, number | null>,
  random: () => number,
): Task[] {
  // Неперемешиваемые отсеиваем до сборки колоды — от них не должна зависеть
  // доля подмешанных выученных.
  const playable = sentences.filter((s) => new Set(tokenize(s.sentence)).size >= 2);
  return buildDeck(playable, (s) => s.verbId, statuses, lastViews, random)
    .map((item) => buildTask(item, random))
    .filter((task): task is Task => task !== null);
}

export function WordOrderTrainer({
  trainerId,
  title,
  settings,
  sentences,
  progress,
  labels,
  backHref,
  seed,
}: Props) {
  const [statuses] = useState(() => {
    const map = new Map<string, "none" | "repeat" | "learned">();
    for (const p of progress) map.set(p.verbId, p.status);
    return map;
  });
  const [lastViews] = useState(() => {
    const map = new Map<string, number | null>();
    for (const p of progress) map.set(p.verbId, p.lastViewAt);
    return map;
  });

  const [deck, setDeck] = useState<Task[]>(() =>
    buildTasks(sentences, statuses, lastViews, mulberry32(seed)),
  );
  const [index, setIndex] = useState(0);
  /** Собранный ответ — индексы слов в порядке нажатия. */
  const [picked, setPicked] = useState<number[]>([]);
  /** null — ещё не проверяли; true/false — результат проверки. */
  const [result, setResult] = useState<boolean | null>(null);
  const [finished, setFinished] = useState(false);
  /** Номер прохода: после «Ещё раз» показ первой карточки пишется заново. */
  const [round, setRound] = useState(0);
  const [learnedCount, setLearnedCount] = useState(
    () => progress.filter((p) => p.status === "learned").length,
  );
  const [sessionCorrect, setSessionCorrect] = useState(0);
  const [sessionWrong, setSessionWrong] = useState(0);

  const nextRef = useRef<HTMLButtonElement>(null);

  const task = !finished ? deck[index] : undefined;
  const answered = result !== null;
  const answerWords = task ? picked.map((i) => task.words[i]) : [];
  const complete = task ? picked.length === task.words.length : false;

  const restart = useCallback(() => {
    setDeck(buildTasks(sentences, statuses, lastViews, mulberry32(Math.random())));
    setIndex(0);
    setPicked([]);
    setResult(null);
    setFinished(false);
    setRound((n) => n + 1);
    setSessionCorrect(0);
    setSessionWrong(0);
  }, [sentences, statuses, lastViews]);

  // Показ фиксируем как у остальных тренажёров; ref гасит повтор эффекта в StrictMode.
  const lastViewKey = useRef<string | null>(null);
  useEffect(() => {
    if (finished) return;
    const current = deck[index];
    if (!current) return;
    const key = `${round}:${index}:${current.item.id}`;
    if (lastViewKey.current === key) return;
    lastViewKey.current = key;
    lastViews.set(current.item.verbId, Date.now());
    recordCardView(trainerId, current.item.verbId).catch(() => {});
  }, [trainerId, deck, index, finished, lastViews, round]);

  // После проверки фокус — на «Дальше»: Enter ведёт по колоде без мыши.
  useEffect(() => {
    if (answered) nextRef.current?.focus();
  }, [answered]);

  const onCheck = () => {
    if (!task || answered || !complete) return;

    const verbId = task.item.verbId;
    const correct = sameOrder(answerWords, task.words);
    setResult(correct);

    if (correct) {
      if (statuses.get(verbId) !== "learned") setLearnedCount((n) => n + 1);
      statuses.set(verbId, "learned");
      setSessionCorrect((n) => n + 1);
      answerCard(trainerId, verbId, "know").catch(() => {});
      return;
    }

    if (statuses.get(verbId) === "learned") setLearnedCount((n) => n - 1);
    statuses.set(verbId, "repeat");
    setSessionWrong((n) => n + 1);
    answerCard(trainerId, verbId, "repeat", {
      sentenceId: task.item.id,
      chosen: answerWords.join(" "),
    }).catch(() => {});

    // Ошибку возвращаем в колоду через несколько позиций — кроме последнего
    // задания, иначе сессия зациклилась бы на одном предложении.
    if (index + 1 < deck.length) {
      const next = [...deck];
      next.splice(Math.min(index + 1 + REPEAT_AFTER, next.length), 0, task);
      setDeck(next);
    }
  };

  const onNext = () => {
    if (index + 1 >= deck.length) {
      setFinished(true);
    } else {
      setIndex(index + 1);
    }
    setPicked([]);
    setResult(null);
  };

  return (
    <div className="mx-auto w-full max-w-md px-5 pt-6 pb-28">
      {/* шапка: назад, название, огонёк выученных */}
      <div className="flex items-center gap-3">
        <Link
          href={backHref}
          aria-label={labels.back}
          className="flex size-11 shrink-0 items-center justify-center rounded-full border border-line/60 bg-white text-foreground shadow-sm transition-colors hover:bg-muted"
        >
          <ArrowLeft size={20} />
        </Link>
        <div className="min-w-0 flex-1">
          <h1 className="truncate text-2xl font-bold tracking-tight">{title}</h1>
          <p className="text-sm text-subtle">{labels.howItWorks}</p>
        </div>
        <span className="flex shrink-0 items-center gap-1.5 rounded-full border border-line/60 bg-white py-2 pr-3.5 pl-3 shadow-sm">
          <Flame size={18} className="text-orange-500" />
          <span className="font-semibold text-blue-600">{learnedCount}</span>
        </span>
      </div>

      {deck.length === 0 ? (
        <p className="mt-10 rounded-3xl border border-line/60 bg-white p-6 text-center text-subtle">
          {labels.empty}
        </p>
      ) : finished ? (
        /* экран итогов */
        <div className="mt-8 flex flex-col items-center rounded-3xl border border-line/60 bg-white p-8 text-center">
          <CircleCheck size={56} className="text-emerald-500" />
          <h2 className="mt-4 text-2xl font-bold">{labels.finishTitle}</h2>
          <p className="mt-1 text-subtle">
            {interpolate(labels.scoreText, {
              correct: sessionCorrect,
              total: sessionCorrect + sessionWrong,
            })}
          </p>

          <dl className="mt-6 grid w-full grid-cols-2 divide-x divide-line/60">
            <div className="px-2 text-center">
              <dd className="text-3xl font-bold text-emerald-600">{sessionCorrect}</dd>
              <dt className="mt-0.5 text-sm text-subtle">{labels.correctCount}</dt>
            </div>
            <div className="px-2 text-center">
              <dd className="text-3xl font-bold text-rose-500">{sessionWrong}</dd>
              <dt className="mt-0.5 text-sm text-subtle">{labels.mistakes}</dt>
            </div>
          </dl>

          <button
            type="button"
            onClick={restart}
            className="mt-7 flex w-full items-center justify-center gap-2 rounded-2xl bg-blue-600 py-3.5 font-medium text-white transition-colors hover:bg-blue-700"
          >
            <RotateCw size={18} />
            {labels.again}
          </button>
          <Link
            href={backHref}
            className="mt-3 flex w-full items-center justify-center gap-2 rounded-2xl border border-line/60 bg-white py-3.5 font-medium transition-colors hover:bg-muted"
          >
            {labels.back}
          </Link>
        </div>
      ) : (
        task && (
          <>
            {/* прогресс сессии */}
            <div className="mt-5 flex items-center gap-3">
              <div className="h-1.5 min-w-0 flex-1 overflow-hidden rounded-full bg-line/60">
                <div
                  className="h-full rounded-full bg-blue-600 transition-[width] duration-300"
                  style={{ width: `${((index + 1) / deck.length) * 100}%` }}
                />
              </div>
              <span className="shrink-0 text-sm font-semibold">
                {index + 1}
                <span className="font-normal text-subtle"> / {deck.length}</span>
              </span>
            </div>

            <div className="mt-5 rounded-3xl border border-line/60 bg-white p-6 shadow-sm">
              {/* перевод — смысл, который нужно собрать */}
              {task.item.translation && (
                <p className="text-lg leading-snug font-semibold">{task.item.translation}</p>
              )}

              {/* собранный ответ: нажатие возвращает слово обратно */}
              <div
                aria-label={labels.yourAnswer}
                className={`mt-4 flex min-h-16 flex-wrap content-start gap-2 rounded-2xl border-2 border-dashed p-3 ${
                  result === true
                    ? "border-emerald-400 bg-emerald-50"
                    : result === false
                      ? "border-rose-400 bg-rose-50"
                      : "border-line"
                }`}
              >
                {picked.map((wordIndex, position) => (
                  <button
                    key={wordIndex}
                    type="button"
                    disabled={answered}
                    onClick={() => setPicked((prev) => prev.filter((i) => i !== wordIndex))}
                    aria-label={`${position + 1}. ${task.words[wordIndex]}`}
                    className="rounded-xl border border-blue-200 bg-blue-50 px-3 py-1.5 text-lg font-medium text-blue-800 transition-colors hover:bg-blue-100 disabled:hover:bg-blue-50"
                  >
                    {task.words[wordIndex]}
                  </button>
                ))}
              </div>

              {/* слова, которые ещё не использованы */}
              {!answered && (
                <>
                  <div className="mt-4 flex min-h-12 flex-wrap justify-center gap-2">
                    {task.shuffled.map((wordIndex) => {
                      const used = picked.includes(wordIndex);
                      return (
                        <button
                          key={wordIndex}
                          type="button"
                          disabled={used}
                          aria-hidden={used}
                          onClick={() => setPicked((prev) => [...prev, wordIndex])}
                          className={`rounded-xl border px-3 py-1.5 text-lg font-medium transition-colors ${
                            used
                              ? "invisible"
                              : "border-line bg-white shadow-sm hover:bg-muted"
                          }`}
                        >
                          {task.words[wordIndex]}
                        </button>
                      );
                    })}
                  </div>

                  <p className="mt-4 text-center text-sm text-subtle">{settings.hint}</p>

                  <div className="mt-5 flex gap-3">
                    <button
                      type="button"
                      onClick={onCheck}
                      disabled={!complete}
                      className="flex flex-1 items-center justify-center gap-2 rounded-2xl bg-blue-600 py-3.5 font-medium text-white transition-colors hover:bg-blue-700 disabled:opacity-50"
                    >
                      {labels.check}
                    </button>
                    <button
                      type="button"
                      onClick={() => setPicked([])}
                      disabled={picked.length === 0}
                      aria-label={labels.reset}
                      title={labels.reset}
                      className="flex size-[3.25rem] shrink-0 items-center justify-center rounded-2xl border border-line/60 bg-white transition-colors hover:bg-muted disabled:opacity-50"
                    >
                      <Undo2 size={18} />
                    </button>
                  </div>
                </>
              )}
            </div>

            {answered ? (
              /* разбор */
              <div
                role="status"
                className={`mt-4 rounded-3xl border p-5 ${
                  result ? "border-emerald-200 bg-emerald-50" : "border-rose-200 bg-rose-50"
                }`}
              >
                <p
                  className={`flex items-center gap-2 font-semibold ${
                    result ? "text-emerald-700" : "text-rose-700"
                  }`}
                >
                  {result ? <CircleCheck size={20} /> : <CircleX size={20} />}
                  {result ? labels.correct : labels.wrong}
                </p>

                {!result && (
                  <p className="mt-2.5 text-sm">
                    <span className="text-subtle">{labels.correctAnswer}: </span>
                    <span className="font-semibold text-emerald-700">{task.item.sentence}</span>
                  </p>
                )}

                {task.item.explanation && (
                  <p className="mt-2.5 text-sm">
                    <span className="text-subtle">{labels.why}: </span>
                    {task.item.explanation}
                  </p>
                )}

                <button
                  ref={nextRef}
                  type="button"
                  onClick={onNext}
                  className="mt-5 flex w-full items-center justify-center gap-2 rounded-2xl bg-blue-600 py-3.5 font-medium text-white transition-colors hover:bg-blue-700"
                >
                  {labels.next}
                  <ArrowRight size={18} />
                </button>
              </div>
            ) : (
              /* шаги «как работает тренажёр» из settings — только до ответа */
              <ul className="mt-6 flex flex-col gap-3">
                {settings.steps.map((step, i) => {
                  const StepIcon = stepIcon(step.icon);
                  return (
                    <li
                      key={step.position}
                      className="flex items-center gap-3.5 rounded-3xl border border-line/60 bg-white p-4"
                    >
                      <span
                        className={`flex size-11 shrink-0 items-center justify-center rounded-2xl ${stepChips[i % stepChips.length]}`}
                      >
                        <StepIcon size={22} />
                      </span>
                      <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-muted text-sm font-semibold text-subtle">
                        {step.position}
                      </span>
                      <span className="min-w-0">
                        <span className="block text-sm font-semibold">{step.name}</span>
                        <span className="block text-xs text-subtle">{step.description}</span>
                      </span>
                    </li>
                  );
                })}
              </ul>
            )}
          </>
        )
      )}
    </div>
  );
}
