"use client";

import { AnimatePresence } from "motion/react";
import * as m from "motion/react-m";
import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";

import type { FlashcardProgress } from "@/components/trainers/flashcards-trainer";
import { interpolate } from "@/lib/locales";
import { spokenTriple, useVerbSpeech } from "@/lib/speech";
import { answerCard, recordCardView } from "@/lib/trainer-actions";
import { buildDeck, mulberry32, REPEAT_AFTER, shuffle } from "@/lib/trainer-deck";
import type { TrainerSettings } from "@/lib/trainer-settings";
import { AnswerSheet } from "@/ui/composites/answer-sheet";
import { type ChoiceState, ChoiceOption } from "@/ui/composites/choice-option";
import { EmptyState } from "@/ui/composites/empty-state";
import { SessionProgress } from "@/ui/composites/session-progress";
import { SessionSummary } from "@/ui/composites/session-summary";
import { TopBar } from "@/ui/composites/top-bar";
import { TrainerSteps } from "@/ui/composites/trainer-steps";
import { IconReview, IconSpeaker, IconStreak, IconWarning } from "@/ui/icons";
import { spring } from "@/ui/motion/presets";
import { Badge } from "@/ui/primitives/badge";
import { Button } from "@/ui/primitives/button";
import { buttonClass } from "@/ui/primitives/button-styles";
import { Card } from "@/ui/primitives/card";
import { VerbForm } from "@/ui/primitives/verb-form";
import { stepIcon } from "@/ui/trainer-icons";

/**
 * Тренажёр «Выбери, что слышишь» (listening): звучит тройка форм, студент
 * выбирает её из четырёх вариантов. Неверные варианты — по возможности из
 * тех же групп, что и верный глагол (begin – began – begun рядом с
 * sing – sang – sung): на слух их и правда легко спутать, а случайный
 * глагол угадывался бы по первому звуку.
 *
 * Звук — через useVerbSpeech: файл из Blob, если он загружен в админке
 * (audioUrls у глагола — по файлу на форму), иначе синтез браузера.
 */

export type ListeningVerb = {
  id: string;
  form1: string;
  form2: string;
  form3: string;
  /** Перевод на языке интерфейса — показываем после ответа. */
  translation: string;
  /** Группы глагола — из них берутся похожие на слух дистракторы. */
  groupIds: string[];
  /** Записанная озвучка из Blob, три формы по порядку; null — синтез браузера. */
  audioUrls: [string, string, string] | null;
};

export type ListeningLabels = {
  howItWorks: string;
  listen: string;
  noSpeech: string;
  correct: string;
  wrong: string;
  correctAnswer: string;
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
  /** Колода: все глаголы или глаголы группы. */
  verbs: ListeningVerb[];
  /** Все глаголы — из них берутся неверные варианты. */
  choices: ListeningVerb[];
  progress: FlashcardProgress[];
  labels: ListeningLabels;
  backHref: string;
  /** Зерно с сервера: SSR и гидрация видят одну колоду и одни варианты. */
  seed: number;
};

type Task = { verb: ListeningVerb; options: ListeningVerb[] };

const OPTION_COUNT = 4;
const OPTION_LETTERS = "abcd";

const triple = (v: ListeningVerb) => `${v.form1} – ${v.form2} – ${v.form3}`;

function buildTasks(
  verbs: ListeningVerb[],
  choices: ListeningVerb[],
  statuses: Map<string, "none" | "repeat" | "learned">,
  lastViews: Map<string, number | null>,
  random: () => number,
): Task[] {
  return buildDeck(verbs, (v) => v.id, statuses, lastViews, random).map((verb) => {
    // Тот же инфинитив (lie – lay – lain / lie – lied – lied) на слух в начале
    // не различить — такие варианты не берём.
    const others = choices.filter((c) => c.id !== verb.id && c.form1 !== verb.form1);
    const similar = shuffle(
      others.filter((c) => c.groupIds.some((g) => verb.groupIds.includes(g))),
      random,
    );
    const rest = shuffle(
      others.filter((c) => !similar.includes(c)),
      random,
    );
    const wrong = [...similar, ...rest].slice(0, OPTION_COUNT - 1);
    return { verb, options: shuffle([verb, ...wrong], random) };
  });
}

export function ListeningTrainer({
  trainerId,
  title,
  settings,
  verbs,
  choices,
  progress,
  labels,
  backHref,
  seed,
}: Props) {
  const { support, speaking, play } = useVerbSpeech();

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
    buildTasks(verbs, choices, statuses, lastViews, mulberry32(seed)),
  );
  const [index, setIndex] = useState(0);
  const [picked, setPicked] = useState<string | null>(null);
  const [finished, setFinished] = useState(false);
  /** Номер прохода: после «Ещё раз» показ первой карточки пишется заново. */
  const [round, setRound] = useState(0);
  const [learnedCount, setLearnedCount] = useState(
    () => progress.filter((p) => p.status === "learned").length,
  );
  const [sessionCorrect, setSessionCorrect] = useState(0);
  const [sessionWrong, setSessionWrong] = useState(0);

  /** Обёртка листа разбора: из неё достаём кнопку «Дальше» для фокуса. */
  const nextRef = useRef<HTMLButtonElement>(null);

  const task = !finished ? deck[index] : undefined;
  const answered = picked !== null;
  const isCorrect = task ? picked === task.verb.id : false;

  const say = useCallback((verb: ListeningVerb) => play(spokenTriple(verb), verb.audioUrls), [play]);

  const restart = useCallback(() => {
    const fresh = buildTasks(verbs, choices, statuses, lastViews, mulberry32(Math.random()));
    setDeck(fresh);
    setIndex(0);
    setPicked(null);
    setFinished(false);
    setRound((n) => n + 1);
    setSessionCorrect(0);
    setSessionWrong(0);
    // «Ещё раз» — нажатие, значит говорить уже можно.
    if (fresh[0]) say(fresh[0].verb);
  }, [verbs, choices, statuses, lastViews, say]);

  // Показ фиксируем как у остальных тренажёров; ref гасит повтор эффекта в StrictMode.
  const lastViewKey = useRef<string | null>(null);
  useEffect(() => {
    if (finished) return;
    const current = deck[index];
    if (!current) return;
    const key = `${round}:${index}:${current.verb.id}`;
    if (lastViewKey.current === key) return;
    lastViewKey.current = key;
    lastViews.set(current.verb.id, Date.now());
    recordCardView(trainerId, current.verb.id).catch(() => {});
  }, [trainerId, deck, index, finished, lastViews, round]);

  // После ответа фокус — на «Дальше»: Enter ведёт по колоде без мыши.
  useEffect(() => {
    if (answered) nextRef.current?.focus();
  }, [answered]);

  const onPick = (option: ListeningVerb) => {
    if (!task || answered) return;
    setPicked(option.id);
    const verbId = task.verb.id;

    if (option.id === verbId) {
      if (statuses.get(verbId) !== "learned") setLearnedCount((n) => n + 1);
      statuses.set(verbId, "learned");
      setSessionCorrect((n) => n + 1);
      answerCard(trainerId, verbId, "know").catch(() => {});
      return;
    }

    if (statuses.get(verbId) === "learned") setLearnedCount((n) => n - 1);
    statuses.set(verbId, "repeat");
    setSessionWrong((n) => n + 1);
    answerCard(trainerId, verbId, "repeat", { pickedVerbId: option.id }).catch(() => {});

    // Ошибку возвращаем в колоду через несколько позиций — кроме последнего задания.
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
      // Следующая тройка звучит сразу: «Дальше» — это жест пользователя,
      // браузер разрешит синтез. Колоду берём текущую — ошибка могла её дополнить.
      say(deck[index + 1].verb);
    }
    setPicked(null);
  };

  const rightForms = task && (
    <span className="flex flex-wrap gap-2">
      <VerbForm form="v1" word={task.verb.form1} size="sm" />
      <VerbForm form="v2" word={task.verb.form2} size="sm" />
      <VerbForm form="v3" word={task.verb.form3} size="sm" />
    </span>
  );

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
        ) : support === "unsupported" ? (
          /* браузер не умеет синтез речи — мягкое предупреждение вместо задания */
          <p className="t-body-sm mt-6 flex items-start gap-3 rounded-lg bg-gold-50 p-4 text-gold-900">
            <IconWarning size={22} weight="fill" className="shrink-0 text-gold-600" aria-hidden />
            {labels.noSpeech}
          </p>
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
              <SessionProgress current={index + 1} total={deck.length} label={title} tone="gold" />

              {/* кнопка прослушивания: первый раз браузер разрешит звук только по нажатию */}
              <Card padding="lg" className="mt-5 flex flex-col items-center overflow-hidden">
                <div className="relative flex size-40 items-center justify-center">
                  {/* расходящиеся кольца, пока звучит тройка */}
                  <AnimatePresence>
                    {speaking &&
                      [0, 0.6].map((delay) => (
                        <m.span
                          key={delay}
                          aria-hidden
                          className="absolute inset-6 rounded-full ring-2 ring-ink-300"
                          initial={{ scale: 1, opacity: 0 }}
                          animate={{ scale: [1, 1.4], opacity: [0.7, 0] }}
                          exit={{ opacity: 0 }}
                          transition={{
                            duration: 1.2,
                            delay,
                            repeat: Infinity,
                            ease: "easeOut",
                          }}
                        />
                      ))}
                  </AnimatePresence>
                  <m.button
                    type="button"
                    onClick={() => say(task.verb)}
                    disabled={support !== "ready"}
                    aria-label={labels.listen}
                    whileTap={{ scale: 0.92 }}
                    whileHover={{ scale: 1.04 }}
                    animate={speaking ? { scale: [1, 1.05, 1] } : { scale: 1 }}
                    transition={speaking ? { duration: 0.9, repeat: Infinity } : spring.snappy}
                    className="focus-ring grain relative flex size-28 cursor-pointer items-center justify-center rounded-full bg-grad-ink text-white shadow-glow-ink disabled:cursor-default disabled:opacity-50 disabled:saturate-50"
                  >
                    <IconSpeaker size={52} weight="fill" aria-hidden />
                  </m.button>
                </div>
                <span className="t-label mt-1 text-fg-strong">{labels.listen}</span>
                {!answered && (
                  <p className="t-body-sm mt-1 text-center text-fg-muted">{settings.hint}</p>
                )}
              </Card>

              {/* варианты */}
              <ul className="mt-4 flex flex-col gap-3">
                {task.options.map((option, i) => {
                  const isPicked = option.id === picked;
                  // После ответа подсвечиваем верный всегда, а выбранный неверный — красным.
                  const state: ChoiceState = !answered
                    ? "idle"
                    : option.id === task.verb.id
                      ? "right"
                      : isPicked
                        ? "wrong"
                        : "muted";
                  return (
                    <li key={option.id}>
                      <ChoiceOption
                        letter={OPTION_LETTERS[i] ?? "•"}
                        state={state}
                        onClick={() => onPick(option)}
                        disabled={answered}
                        pressed={isPicked}
                      >
                        {triple(option)}
                      </ChoiceOption>
                    </li>
                  );
                })}
              </ul>

              {/* шаги «как работает тренажёр» из settings — только до ответа */}
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
        result={!finished && answered ? (isCorrect ? "correct" : "wrong") : null}
        title={isCorrect ? labels.correct : labels.wrong}
        answerLabel={labels.correctAnswer}
        answer={rightForms}
        explanation={task?.verb.translation || undefined}
        actionLabel={labels.next}
        onAction={onNext}
        actionRef={nextRef}
      />
    </>
  );
}
