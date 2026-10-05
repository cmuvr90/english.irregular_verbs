"use client";

import * as m from "motion/react-m";
import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";

import type { FlashcardProgress } from "@/components/trainers/flashcards-trainer";
import { interpolate } from "@/lib/locales";
import { answerCard, recordCardView } from "@/lib/trainer-actions";
import { buildDeck, mulberry32, REPEAT_AFTER, shuffle } from "@/lib/trainer-deck";
import type { TrainerSettings } from "@/lib/trainer-settings";
import { sameOrder, tokenize } from "@/lib/word-order";
import { cn } from "@/ui/cn";
import { AnswerSheet } from "@/ui/composites/answer-sheet";
import { EmptyState } from "@/ui/composites/empty-state";
import { SessionProgress } from "@/ui/composites/session-progress";
import { SessionSummary } from "@/ui/composites/session-summary";
import { TopBar } from "@/ui/composites/top-bar";
import { TrainerSteps } from "@/ui/composites/trainer-steps";
import { IconReview, IconStreak, IconUndo } from "@/ui/icons";
import { spring } from "@/ui/motion/presets";
import { Badge } from "@/ui/primitives/badge";
import { Button } from "@/ui/primitives/button";
import { buttonClass } from "@/ui/primitives/button-styles";
import { Card } from "@/ui/primitives/card";
import { IconButton } from "@/ui/primitives/icon-button";
import { stepIcon } from "@/ui/trainer-icons";

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
    <>
      <TopBar
        title={title}
        subtitle={labels.howItWorks}
        back={{ href: backHref, label: labels.back }}
        actions={
          <Badge tone="v2" icon={IconStreak} className="h-9 px-3.5 text-sm">
            {learnedCount}
          </Badge>
        }
      />

      {/* pt-24 — место под шапку; снизу — под таб-бар или лист разбора */}
      <div className={`mx-auto w-full max-w-md px-4 pt-24 ${answered ? "pb-96" : "pb-32"}`}>
        {deck.length === 0 ? (
          <EmptyState title={labels.empty} className="mt-6" />
        ) : finished ? (
          <SessionSummary
            className="mt-4"
            title={labels.finishTitle}
            text={interpolate(labels.scoreText, {
              correct: sessionCorrect,
              total: sessionCorrect + sessionWrong,
            })}
            illustration={{ src: "/images/app/mascot-celebrate.webp", alt: "" }}
            stats={[
              {
                value: sessionCorrect,
                label: labels.correctCount,
                tone: "success",
              },
              { value: sessionWrong, label: labels.mistakes, tone: "v2" },
            ]}
            actions={
              <>
                <Button size="lg" block icon={IconReview} onClick={restart}>
                  {labels.again}
                </Button>
                <Link
                  href={backHref}
                  className={buttonClass({
                    variant: "secondary",
                    size: "lg",
                    block: true,
                  })}
                >
                  {labels.back}
                </Link>
              </>
            }
          />
        ) : (
          task && (
            <>
              <SessionProgress current={index + 1} total={deck.length} label={title} tone="ink" />

              <Card padding="lg" className="mt-5">
                {/* перевод — смысл, который нужно собрать */}
                {task.item.translation && (
                  <p className="t-heading text-fg-strong">{task.item.translation}</p>
                )}

                {/* собранный ответ — «утопленная» тетрадная строка; нажатие возвращает слово обратно */}
                <div
                  aria-label={labels.yourAnswer}
                  className={cn(
                    "mt-4 flex min-h-20 flex-wrap content-start gap-2 rounded-xl p-3 transition-colors duration-200",
                    result === true
                      ? "bg-leaf-50 ring-2 ring-leaf-300"
                      : result === false
                        ? "bg-berry-50 ring-2 ring-berry-300"
                        : "bg-surface-sunken inset-shadow-sunken",
                  )}
                >
                  {picked.map((wordIndex, position) => (
                    <m.button
                      // layoutId общий с плиткой в наборе: слово «перелетает» между зонами.
                      // Номер прохода и задания в ключе — чтобы не летело из прошлого задания.
                      layoutId={`${round}:${index}:${wordIndex}`}
                      transition={spring.snappy}
                      key={wordIndex}
                      type="button"
                      disabled={answered}
                      onClick={() => setPicked((prev) => prev.filter((i) => i !== wordIndex))}
                      aria-label={`${position + 1}. ${task.words[wordIndex]}`}
                      className={cn(
                        "focus-ring t-verb cursor-pointer rounded-md px-3.5 py-2 text-lg ring-1 transition-[background-color,box-shadow,translate] duration-150",
                        result === true
                          ? "bg-surface text-leaf-700 ring-leaf-300"
                          : result === false
                            ? "bg-surface text-berry-700 ring-berry-300"
                            : "bg-surface text-fg-strong shadow-press-paper ring-hairline-strong active:translate-y-1 active:shadow-none",
                      )}
                    >
                      {task.words[wordIndex]}
                    </m.button>
                  ))}
                </div>

                {/* слова, которые ещё не использованы */}
                {!answered && (
                  <>
                    <div className="mt-5 flex min-h-12 flex-wrap justify-center gap-2.5">
                      {task.shuffled.map((wordIndex) => {
                        const used = picked.includes(wordIndex);
                        // Использованное слово оставляет невидимую «тень» той же ширины:
                        // остальные плитки не прыгают, пока студент собирает ответ.
                        return used ? (
                          <span
                            key={wordIndex}
                            aria-hidden
                            className="t-verb invisible rounded-md px-3.5 py-2 text-lg ring-1 ring-transparent"
                          >
                            {task.words[wordIndex]}
                          </span>
                        ) : (
                          <m.button
                            layoutId={`${round}:${index}:${wordIndex}`}
                            transition={spring.snappy}
                            key={wordIndex}
                            type="button"
                            onClick={() => setPicked((prev) => [...prev, wordIndex])}
                            className="focus-ring t-verb cursor-pointer rounded-md bg-surface px-3.5 py-2 text-lg text-fg-strong shadow-press-paper ring-1 ring-hairline-strong transition-[background-color,box-shadow,translate] duration-150 hover:bg-surface-sunken/50 active:translate-y-1 active:shadow-none"
                          >
                            {task.words[wordIndex]}
                          </m.button>
                        );
                      })}
                    </div>

                    <p className="t-body-sm mt-5 text-center text-fg-muted">{settings.hint}</p>

                    <div className="mt-5 flex items-center gap-3">
                      <Button
                        variant="primary"
                        size="lg"
                        onClick={onCheck}
                        disabled={!complete}
                        className="flex-1"
                      >
                        {labels.check}
                      </Button>
                      <IconButton
                        icon={IconUndo}
                        label={labels.reset}
                        variant="paper"
                        size="lg"
                        onClick={() => setPicked([])}
                        disabled={picked.length === 0}
                      />
                    </div>
                  </>
                )}
              </Card>

              {/* шаги «как работает тренажёр» из settings — только до ответа,
                  чтобы не отвлекать от разбора */}
              {!answered && (
                <TrainerSteps
                  className="mt-8"
                  title={labels.howItWorks}
                  steps={settings.steps.map((step) => ({
                    ...step,
                    icon: stepIcon(step.icon),
                  }))}
                />
              )}
            </>
          )
        )}
      </div>

      {/* разбор — лист снизу */}
      <AnswerSheet
        actionRef={nextRef}
        result={!finished && answered ? (result ? "correct" : "wrong") : null}
        title={result ? labels.correct : labels.wrong}
        answerLabel={labels.correctAnswer}
        answer={task && <span className="t-verb text-xl text-leaf-700">{task.item.sentence}</span>}
        details={[
          ...(result === false && answerWords.length > 0
            ? [
                {
                  label: labels.yourAnswer,
                  text: (
                    <span className="text-berry-700 line-through decoration-2">
                      {answerWords.join(" ")}
                    </span>
                  ),
                },
              ]
            : []),
          ...(task?.item.explanation ? [{ label: labels.why, text: task.item.explanation }] : []),
        ]}
        actionLabel={labels.next}
        onAction={onNext}
      />
    </>
  );
}
