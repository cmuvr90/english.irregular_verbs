"use client";

import {
  ArrowLeft,
  Brain,
  Check,
  CircleCheck,
  Eye,
  Flame,
  RotateCw,
  Sparkles,
  type LucideIcon,
} from "lucide-react";
import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";

import { answerCard, recordCardView } from "@/lib/trainer-actions";

/**
 * Тренажёр «Карточки» (flashcards). Компонент заточен ровно под этот тип
 * тренажёра: читает его settings (подсказка + шаги инструкции) и работает
 * с любым списком глаголов — группой или всеми вперемешку.
 *
 * Колода собирается с учётом прогресса студента (интервальное повторение):
 * - невиданные и «повторить» — основа колоды, вперемешку;
 * - выученные подмешиваются редко (примерно 1 к 5), первыми — те,
 *   что дольше всего не показывались;
 * - карточка с ответом «Повторить» возвращается в колоду через несколько позиций.
 */

export type FlashcardVerb = {
  id: string;
  form1: string;
  form2: string;
  form3: string;
  /** Перевод уже на языке интерфейса. */
  translation: string;
};

export type FlashcardProgress = {
  verbId: string;
  status: "none" | "repeat" | "learned";
  /** epoch millis — Date не сериализуем через границу RSC без нужды. */
  lastViewAt: number | null;
};

export type FlashcardsSettings = {
  hint: string;
  steps: { position: number; icon: string; name: string; description: string }[];
};

export type FlashcardsLabels = {
  howItWorks: string;
  showAnswer: string;
  know: string;
  repeat: string;
  finishTitle: string;
  finishText: string;
  again: string;
  empty: string;
  back: string;
};

type Props = {
  trainerId: string;
  title: string;
  settings: FlashcardsSettings;
  verbs: FlashcardVerb[];
  progress: FlashcardProgress[];
  labels: FlashcardsLabels;
  backHref: string;
  /**
   * Зерно перемешивания с сервера: колода собирается детерминированно,
   * поэтому SSR и гидрация видят одинаковый порядок карточек.
   */
  seed: number;
};

/** Имя иконки из settings (kebab-case lucide) → компонент. */
const stepIcons: Record<string, LucideIcon> = {
  eye: Eye,
  brain: Brain,
  "circle-check": CircleCheck,
};

const stepChips = [
  "bg-violet-100 text-violet-600",
  "bg-blue-100 text-blue-600",
  "bg-emerald-100 text-emerald-600",
];

/** Каждый пятый показ — выученная карточка. */
const LEARNED_EVERY = 5;
/** «Повторить» возвращает карточку через столько позиций. */
const REPEAT_AFTER = 5;

/** mulberry32 — маленький детерминированный ГПСЧ по числовому зерну. */
function mulberry32(seed: number) {
  let state = Math.floor(seed * 2 ** 32) || 1;
  return () => {
    state = (state + 0x6d2b79f5) | 0;
    let t = Math.imul(state ^ (state >>> 15), 1 | state);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function shuffle<T>(items: T[], random: () => number): T[] {
  const result = [...items];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

function buildDeck(
  verbs: FlashcardVerb[],
  statuses: Map<string, "none" | "repeat" | "learned">,
  lastViewAt: Map<string, number | null>,
  random: () => number,
): FlashcardVerb[] {
  const fresh = verbs.filter((v) => statuses.get(v.id) !== "learned");
  const learned = verbs
    .filter((v) => statuses.get(v.id) === "learned")
    // Давно не виденные — первыми в очереди на «вкрапление».
    .sort((a, b) => (lastViewAt.get(a.id) ?? 0) - (lastViewAt.get(b.id) ?? 0));

  // Всё выучено — сессия целиком из повторения выученных.
  if (fresh.length === 0) return learned;

  const base = shuffle(fresh, random);
  const mixCount = Math.min(learned.length, Math.floor(base.length / LEARNED_EVERY));
  const deck: FlashcardVerb[] = [];
  let mixed = 0;
  base.forEach((card, i) => {
    deck.push(card);
    if ((i + 1) % LEARNED_EVERY === 0 && mixed < mixCount) deck.push(learned[mixed++]);
  });
  return deck;
}

export function FlashcardsTrainer({
  trainerId,
  title,
  settings,
  verbs,
  progress,
  labels,
  backHref,
  seed,
}: Props) {
  // Локальная копия статусов: обновляется по ответам, из неё же считается
  // огонёк и пересобирается колода на «Ещё раз».
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

  // Первая колода детерминирована серверным seed (см. проп), поэтому её можно
  // собрать прямо в инициализаторе — SSR и клиент получат одинаковый порядок.
  const [deck, setDeck] = useState<FlashcardVerb[]>(() =>
    buildDeck(verbs, statuses, lastViews, mulberry32(seed)),
  );
  const [index, setIndex] = useState(0);
  const [revealed, setRevealed] = useState(false);
  const [finished, setFinished] = useState(false);
  const [learnedCount, setLearnedCount] = useState(
    () => progress.filter((p) => p.status === "learned").length,
  );

  // Итоги текущей сессии для финального экрана.
  const [sessionKnow, setSessionKnow] = useState(0);
  const [sessionRepeat, setSessionRepeat] = useState(0);

  // «Ещё раз»: уже на клиенте, можно перемешать по-настоящему случайно.
  const restart = useCallback(() => {
    setDeck(buildDeck(verbs, statuses, lastViews, mulberry32(Math.random())));
    setIndex(0);
    setRevealed(false);
    setFinished(false);
    setSessionKnow(0);
    setSessionRepeat(0);
  }, [verbs, statuses, lastViews]);

  const card = deck && !finished ? deck[index] : null;

  // Дребезг: второй тап по «Знаю»/«Повторить» прилетает уже после смены
  // карточки и отвечал бы за следующую, не показав её. Короткая пауза
  // между ответами отсекает случайные двойные тапы.
  const lastAnswerAt = useRef(0);
  const isDoubleTap = () => {
    const now = Date.now();
    if (now - lastAnswerAt.current < 350) return true;
    lastAnswerAt.current = now;
    return false;
  };

  // Фиксируем показ карточки; запись появляется даже без ответа (status none).
  // Зависимость от (deck, index), а не от card: одна и та же карточка может
  // встретиться в колоде дважды после «Повторить». Ref-дедупликация гасит
  // повторный вызов эффекта (StrictMode в dev) — иначе count завышался бы.
  const lastViewKey = useRef<string | null>(null);
  useEffect(() => {
    if (finished || !deck) return;
    const current = deck[index];
    if (!current) return;
    const key = `${index}:${current.id}`;
    if (lastViewKey.current === key) return;
    lastViewKey.current = key;
    recordCardView(trainerId, current.id).catch(() => {
      // Сеть моргнула — показ не записан; некритично для тренировки.
    });
  }, [trainerId, deck, index, finished]);

  const advance = (nextDeck: FlashcardVerb[]) => {
    if (index + 1 >= nextDeck.length) {
      setFinished(true);
    } else {
      setIndex(index + 1);
    }
    setRevealed(false);
  };

  const onKnow = () => {
    if (!card || !deck || isDoubleTap()) return;
    if (statuses.get(card.id) !== "learned") setLearnedCount((n) => n + 1);
    statuses.set(card.id, "learned");
    lastViews.set(card.id, Date.now());
    setSessionKnow((n) => n + 1);
    answerCard(trainerId, card.id, "know").catch(() => {});
    advance(deck);
  };

  const onRepeat = () => {
    if (!card || !deck || isDoubleTap()) return;
    if (statuses.get(card.id) === "learned") setLearnedCount((n) => n - 1);
    statuses.set(card.id, "repeat");
    lastViews.set(card.id, Date.now());
    setSessionRepeat((n) => n + 1);
    answerCard(trainerId, card.id, "repeat").catch(() => {});

    // Последняя карточка: не возвращаем её в колоду немедленно (получился бы
    // цикл «та же карточка снова и снова») — завершаем сессию, статус repeat
    // вернёт её в начало следующей.
    if (index + 1 >= deck.length) {
      setFinished(true);
      setRevealed(false);
      return;
    }

    // Возвращаем карточку в колоду через несколько позиций.
    const next = [...deck];
    next.splice(Math.min(index + 1 + REPEAT_AFTER, next.length), 0, card);
    setDeck(next);
    advance(next);
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

      {verbs.length === 0 ? (
        <p className="mt-10 rounded-3xl border border-line/60 bg-white p-6 text-center text-subtle">
          {labels.empty}
        </p>
      ) : finished ? (
        /* экран итогов */
        <div className="mt-8 flex flex-col items-center rounded-3xl border border-line/60 bg-white p-8 text-center">
          <CircleCheck size={56} className="text-emerald-500" />
          <h2 className="mt-4 text-2xl font-bold">{labels.finishTitle}</h2>
          <p className="mt-1 text-subtle">{labels.finishText}</p>

          <dl className="mt-6 grid w-full grid-cols-2 divide-x divide-line/60">
            <div className="px-2 text-center">
              <dd className="text-3xl font-bold text-emerald-600">{sessionKnow}</dd>
              <dt className="mt-0.5 text-sm text-subtle">{labels.know}</dt>
            </div>
            <div className="px-2 text-center">
              <dd className="text-3xl font-bold text-orange-500">{sessionRepeat}</dd>
              <dt className="mt-0.5 text-sm text-subtle">{labels.repeat}</dt>
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
        card && (
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

            {/* карточка со стопкой-подложкой */}
            <div className="relative mt-5">
              <div className="absolute inset-x-3 -bottom-2 h-full rounded-3xl bg-violet-100" aria-hidden />
              <div className="absolute inset-x-1.5 -bottom-1 h-full rounded-3xl bg-blue-100" aria-hidden />
              <button
                type="button"
                onClick={() => setRevealed(true)}
                className="relative flex min-h-64 w-full flex-col items-center justify-center rounded-3xl border border-line/60 bg-white p-8 shadow-sm"
              >
                <span className="text-5xl font-bold tracking-tight">{card.form1}</span>
                {revealed ? (
                  <span className="mt-6 border-t border-line/60 pt-5 text-center">
                    <span className="block text-3xl font-bold text-emerald-600">
                      {card.form2} — {card.form3}
                    </span>
                    <span className="mt-2 block text-lg text-subtle">{card.translation}</span>
                  </span>
                ) : (
                  <span className="mt-6 border-t border-line/60 pt-5 text-sm text-subtle">
                    {settings.hint}
                  </span>
                )}
              </button>
            </div>

            {/* шаги «как работает тренажёр» из settings */}
            <ul className="mt-6 flex flex-col gap-3">
              {settings.steps.map((step, i) => {
                const StepIcon = stepIcons[step.icon] ?? Sparkles;
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

            {/* действия */}
            <div className="mt-5 flex gap-3">
              <button
                type="button"
                onClick={onKnow}
                className="flex flex-1 items-center justify-center gap-2 rounded-2xl bg-blue-600 py-3.5 font-medium text-white transition-colors hover:bg-blue-700"
              >
                <Check size={18} />
                {labels.know}
              </button>
              <button
                type="button"
                onClick={onRepeat}
                className="flex flex-1 items-center justify-center gap-2 rounded-2xl border border-line/60 bg-white py-3.5 font-medium transition-colors hover:bg-muted"
              >
                <RotateCw size={18} />
                {labels.repeat}
              </button>
            </div>
            <button
              type="button"
              onClick={() => setRevealed(true)}
              disabled={revealed}
              className="mt-3 flex w-full items-center justify-center gap-2 rounded-2xl border border-line/60 bg-white py-3.5 font-medium transition-colors hover:bg-muted disabled:opacity-50"
            >
              <Eye size={18} />
              {labels.showAnswer}
            </button>
          </>
        )
      )}
    </div>
  );
}
