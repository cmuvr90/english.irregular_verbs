"use client";

import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";

import type { FlashcardProgress } from "@/components/trainers/flashcards-trainer";
import { isPrecompressedImage } from "@/lib/image-compression";
import { interpolate } from "@/lib/locales";
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
import { IconReview, IconStreak } from "@/ui/icons";
import { Badge } from "@/ui/primitives/badge";
import { Button } from "@/ui/primitives/button";
import { buttonClass } from "@/ui/primitives/button-styles";
import { Card } from "@/ui/primitives/card";
import { VerbForm } from "@/ui/primitives/verb-form";
import { stepIcon } from "@/ui/trainer-icons";

/**
 * Тренажёр «Подбери глагол к картинке» (picture-match): картинка и четыре
 * тройки форм, студент выбирает ту, что изображена. В колоду попадают только
 * глаголы с картинкой; дистракторы — любые другие глаголы.
 */

export type PictureVerb = {
  id: string;
  form1: string;
  form2: string;
  form3: string;
  /** Перевод на языке интерфейса — показываем после ответа. */
  translation: string;
  imageUrl: string;
};

/** Глагол-дистрактор: картинка ему не нужна, только формы. */
export type ChoiceVerb = {
  id: string;
  form1: string;
  form2: string;
  form3: string;
};

export type PictureMatchLabels = {
  howItWorks: string;
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
  verbs: PictureVerb[];
  /** Все глаголы — из них берутся неверные варианты. */
  choices: ChoiceVerb[];
  progress: FlashcardProgress[];
  labels: PictureMatchLabels;
  backHref: string;
  /** Зерно с сервера: SSR и гидрация видят одну колоду и одни варианты. */
  seed: number;
};

type Task = { verb: PictureVerb; options: ChoiceVerb[] };

/** Сколько вариантов ответа показываем, включая верный. */
const OPTION_COUNT = 4;
const OPTION_LETTERS = "abcd";

const triple = (v: ChoiceVerb) => `${v.form1} – ${v.form2} – ${v.form3}`;

function buildTasks(
  verbs: PictureVerb[],
  choices: ChoiceVerb[],
  statuses: Map<string, "none" | "repeat" | "learned">,
  lastViews: Map<string, number | null>,
  random: () => number,
): Task[] {
  return buildDeck(verbs, (v) => v.id, statuses, lastViews, random).map((verb) => {
    // Дистракторы с тем же инфинитивом не берём: lie – lay – lain и
    // lie – lied – lied на одной картинке не различить.
    const others = choices.filter((c) => c.id !== verb.id && c.form1 !== verb.form1);
    const wrong = shuffle(others, random).slice(0, OPTION_COUNT - 1);
    return { verb, options: shuffle([verb, ...wrong], random) };
  });
}

export function PictureMatchTrainer({
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

  const restart = useCallback(() => {
    setDeck(buildTasks(verbs, choices, statuses, lastViews, mulberry32(Math.random())));
    setIndex(0);
    setPicked(null);
    setFinished(false);
    setRound((n) => n + 1);
    setSessionCorrect(0);
    setSessionWrong(0);
  }, [verbs, choices, statuses, lastViews]);

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

  const onPick = (option: ChoiceVerb) => {
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
              <SessionProgress
                current={index + 1}
                total={deck.length}
                label={title}
                tone="success"
              />

              {/* картинка; alt пустой намеренно — подпись выдала бы ответ */}
              <Card padding="none" className="mt-5 overflow-hidden rounded-xl">
                <div className="relative aspect-[4/3] w-full">
                  <Image
                    src={task.verb.imageUrl}
                    alt=""
                    fill
                    priority
                    sizes="(max-width: 448px) 100vw, 448px"
                    unoptimized={isPrecompressedImage(task.verb.imageUrl)}
                    className="object-contain p-3"
                  />
                </div>
              </Card>
              {!answered && (
                <p className="t-body-sm mt-3 px-1 text-center text-fg-muted">{settings.hint}</p>
              )}

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
        result={task && answered ? (isCorrect ? "correct" : "wrong") : null}
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
