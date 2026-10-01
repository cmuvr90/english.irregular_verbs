"use client";

import { ArrowLeft, ArrowRight, CircleCheck, CircleX, Flame, RotateCw } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";

import type { FlashcardProgress } from "@/components/trainers/flashcards-trainer";
import { interpolate } from "@/lib/locales";
import { answerCard, recordCardView } from "@/lib/trainer-actions";
import { buildDeck, mulberry32, REPEAT_AFTER, shuffle } from "@/lib/trainer-deck";
import { stepIcon } from "@/lib/trainer-icons";
import type { TrainerSettings } from "@/lib/trainer-settings";

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
export type ChoiceVerb = { id: string; form1: string; form2: string; form3: string };

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

const stepChips = [
  "bg-violet-100 text-violet-600",
  "bg-blue-100 text-blue-600",
  "bg-emerald-100 text-emerald-600",
];

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

            {/* картинка; alt пустой намеренно — подпись выдала бы ответ */}
            <div className="relative mt-5 aspect-[4/3] w-full overflow-hidden rounded-3xl border border-line/60 bg-white shadow-sm">
              <Image
                src={task.verb.imageUrl}
                alt=""
                fill
                priority
                sizes="(max-width: 448px) 100vw, 448px"
                className="object-contain p-3"
              />
            </div>
            {!answered && <p className="mt-3 text-center text-sm text-subtle">{settings.hint}</p>}

            {/* варианты */}
            <ul className="mt-4 flex flex-col gap-2.5">
              {task.options.map((option, i) => {
                const isRight = option.id === task.verb.id;
                const isPicked = option.id === picked;
                const state = !answered ? "idle" : isRight ? "right" : isPicked ? "wrong" : "muted";
                return (
                  <li key={option.id}>
                    <button
                      type="button"
                      onClick={() => onPick(option)}
                      disabled={answered}
                      aria-pressed={isPicked}
                      className={`flex w-full items-center gap-3.5 rounded-2xl border p-4 text-left transition-colors ${
                        state === "right"
                          ? "border-emerald-500 bg-emerald-50"
                          : state === "wrong"
                            ? "border-rose-500 bg-rose-50"
                            : state === "muted"
                              ? "border-line/60 bg-white opacity-60"
                              : "border-line/60 bg-white hover:bg-muted"
                      }`}
                    >
                      <span
                        className={`flex size-8 shrink-0 items-center justify-center rounded-xl text-sm font-semibold ${
                          state === "right"
                            ? "bg-emerald-500 text-white"
                            : state === "wrong"
                              ? "bg-rose-500 text-white"
                              : "bg-muted text-subtle"
                        }`}
                      >
                        {OPTION_LETTERS[i] ?? "•"}
                      </span>
                      <span className="min-w-0 flex-1 text-lg font-medium">{triple(option)}</span>
                      {state === "right" && <CircleCheck size={20} className="shrink-0 text-emerald-600" />}
                      {state === "wrong" && <CircleX size={20} className="shrink-0 text-rose-600" />}
                    </button>
                  </li>
                );
              })}
            </ul>

            {answered ? (
              /* разбор */
              <div
                role="status"
                className={`mt-4 rounded-3xl border p-5 ${
                  isCorrect ? "border-emerald-200 bg-emerald-50" : "border-rose-200 bg-rose-50"
                }`}
              >
                <p
                  className={`flex items-center gap-2 font-semibold ${
                    isCorrect ? "text-emerald-700" : "text-rose-700"
                  }`}
                >
                  {isCorrect ? <CircleCheck size={20} /> : <CircleX size={20} />}
                  {isCorrect ? labels.correct : labels.wrong}
                </p>
                <p className="mt-2.5 text-sm">
                  {!isCorrect && <span className="text-subtle">{labels.correctAnswer}: </span>}
                  <span className="font-semibold text-emerald-700">{triple(task.verb)}</span>
                  {task.verb.translation && (
                    <span className="text-subtle"> · {task.verb.translation}</span>
                  )}
                </p>

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
