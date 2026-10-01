"use client";

import {
  ArrowLeft,
  ArrowRight,
  CircleCheck,
  CircleX,
  Flame,
  RotateCw,
} from "lucide-react";
import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";

import { interpolate } from "@/lib/locales";
import {
  correctOptions,
  parseBlanks,
  splitSentence,
  type SentenceOption,
  type SentenceOptions,
} from "@/lib/sentence-options";
import { answerCard, recordCardView } from "@/lib/trainer-actions";
import { stepIcon } from "@/lib/trainer-icons";
import type { TrainerSettings } from "@/lib/trainer-settings";

/**
 * Тренажёр «Выбери форму» (multiple-choice). Показывает предложение с одним
 * пропуском и три варианта; студент выбирает, тренажёр сразу подсвечивает
 * результат и открывает разбор.
 *
 * Прогресс общий с остальными тренажёрами и живёт на глаголе, а не на
 * предложении: верный ответ шлёт «know», неверный — «repeat». Поэтому колода
 * собирается той же интервальной логикой, что и карточки:
 * - невиданные и «повторить» — основа колоды, вперемешку;
 * - выученные подмешиваются редко (примерно 1 к 5), первыми — те,
 *   что дольше всего не показывались;
 * - предложение с неверным ответом возвращается в колоду через несколько
 *   позиций, чтобы студент увидел его ещё раз в этой же сессии.
 */

export type ChoiceSentence = {
  id: string;
  /** Глагол, на который пишется прогресс. */
  verbId: string;
  /** Текст с маркером пропуска: "He [a] his hair once a month". */
  text: string;
  options: SentenceOptions;
  /** Разбор и перевод уже на языке интерфейса; пустая строка — блок не рисуем. */
  explanation: string;
  translation: string;
};

export type ChoiceProgress = {
  verbId: string;
  status: "none" | "repeat" | "learned";
  /** epoch millis — Date не сериализуем через границу RSC без нужды. */
  lastViewAt: number | null;
};

export type MultipleChoiceLabels = {
  howItWorks: string;
  correct: string;
  /** Подпись под числом верных ответов на экране итогов. */
  correctCount: string;
  wrong: string;
  correctAnswer: string;
  why: string;
  sentenceTranslation: string;
  next: string;
  mistakes: string;
  finishTitle: string;
  scoreText: string;
  again: string;
  empty: string;
  back: string;
};

type Props = {
  trainerId: string;
  title: string;
  settings: TrainerSettings;
  sentences: ChoiceSentence[];
  progress: ChoiceProgress[];
  labels: MultipleChoiceLabels;
  backHref: string;
  /**
   * Зерно перемешивания с сервера: и колода, и порядок вариантов внутри
   * задания собираются детерминированно, поэтому SSR и гидрация совпадают.
   */
  seed: number;
};

const stepChips = [
  "bg-violet-100 text-violet-600",
  "bg-blue-100 text-blue-600",
  "bg-emerald-100 text-emerald-600",
];

/** Подписи вариантов, как в бумажных тестах: a) b) c). */
const OPTION_LETTERS = "abcdefgh";

/** Каждый пятый показ — предложение с уже выученным глаголом. */
const LEARNED_EVERY = 5;
/** Неверный ответ возвращает предложение в колоду через столько позиций. */
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

/** Задание в колоде: предложение плюс уже перемешанные варианты. */
type Question = {
  sentence: ChoiceSentence;
  /** Ключ пропуска ("a") — компонент работает ровно с одним. */
  blankKey: string;
  options: SentenceOption[];
};

/**
 * Перемешивает варианты. В базе верный лежит первым (так удобнее автору),
 * поэтому без перемешивания ответом всегда была бы кнопка «a».
 */
function buildQuestion(sentence: ChoiceSentence, random: () => number): Question | null {
  // Ключ берём из текста, а не из Object.keys(options): порядок ключей jsonb
  // Postgres нормализует, и «первый ключ» — не обязательно тот пропуск,
  // который стоит в предложении. Отрисовка (splitSentence) идёт от текста,
  // так что варианты нужно поднимать тем же ключом — иначе студент увидит
  // один пропуск, а ответит на другой.
  const [blankKey] = parseBlanks(sentence.text);
  const options = blankKey ? sentence.options[blankKey] : undefined;
  // Битые данные до рендера не доводим: страница отсеивает такие строки,
  // но колода не должна падать, если что-то просочилось.
  if (!blankKey || !options || options.length === 0) return null;
  return { sentence, blankKey, options: shuffle(options, random) };
}

function buildDeck(
  sentences: ChoiceSentence[],
  statuses: Map<string, "none" | "repeat" | "learned">,
  lastViewAt: Map<string, number | null>,
  random: () => number,
): Question[] {
  const toQuestion = (sentence: ChoiceSentence) => buildQuestion(sentence, random);

  const fresh = sentences.filter((s) => statuses.get(s.verbId) !== "learned");
  const learned = sentences
    .filter((s) => statuses.get(s.verbId) === "learned")
    // Давно не виденные — первыми в очереди на «вкрапление».
    .sort((a, b) => (lastViewAt.get(a.verbId) ?? 0) - (lastViewAt.get(b.verbId) ?? 0));

  const learnedQuestions = learned.map(toQuestion).filter((q): q is Question => q !== null);

  // Всё выучено — сессия целиком из повторения выученных.
  if (fresh.length === 0) return learnedQuestions;

  const base = shuffle(fresh, random)
    .map(toQuestion)
    .filter((q): q is Question => q !== null);

  const mixCount = Math.min(learnedQuestions.length, Math.floor(base.length / LEARNED_EVERY));
  const deck: Question[] = [];
  let mixed = 0;
  base.forEach((question, i) => {
    deck.push(question);
    if ((i + 1) % LEARNED_EVERY === 0 && mixed < mixCount) deck.push(learnedQuestions[mixed++]);
  });
  return deck;
}

export function MultipleChoiceTrainer({
  trainerId,
  title,
  settings,
  sentences,
  progress,
  labels,
  backHref,
  seed,
}: Props) {
  // Локальная копия прогресса: обновляется по ответам, из неё же считается
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
  const [deck, setDeck] = useState<Question[]>(() =>
    buildDeck(sentences, statuses, lastViews, mulberry32(seed)),
  );
  const [index, setIndex] = useState(0);
  /** Текст выбранного варианта; null — на задание ещё не ответили. */
  const [picked, setPicked] = useState<string | null>(null);
  const [finished, setFinished] = useState(false);
  const [learnedCount, setLearnedCount] = useState(
    () => progress.filter((p) => p.status === "learned").length,
  );

  // Итоги текущей сессии для финального экрана.
  const [sessionCorrect, setSessionCorrect] = useState(0);
  const [sessionWrong, setSessionWrong] = useState(0);

  // «Ещё раз»: уже на клиенте, можно перемешать по-настоящему случайно.
  const restart = useCallback(() => {
    setDeck(buildDeck(sentences, statuses, lastViews, mulberry32(Math.random())));
    setIndex(0);
    setPicked(null);
    setFinished(false);
    setSessionCorrect(0);
    setSessionWrong(0);
  }, [sentences, statuses, lastViews]);

  const question = !finished ? deck[index] : undefined;

  // Фиксируем показ; запись появляется даже без ответа (status none).
  // Зависимость от (deck, index), а не от question: одно и то же предложение
  // может встретиться в колоде дважды после неверного ответа. Ref-дедупликация
  // гасит повторный вызов эффекта (StrictMode в dev) — иначе count завышался бы.
  const lastViewKey = useRef<string | null>(null);
  useEffect(() => {
    if (finished) return;
    const current = deck[index];
    if (!current) return;
    const key = `${index}:${current.sentence.id}`;
    if (lastViewKey.current === key) return;
    lastViewKey.current = key;
    // Отметка времени ставится здесь, а не в ответе: на сервере lastViewAt
    // тоже пишется по показу, и по ней «Ещё раз» решает, какие выученные
    // глаголы подмешать первыми.
    lastViews.set(current.sentence.verbId, Date.now());
    recordCardView(trainerId, current.sentence.verbId).catch(() => {
      // Сеть моргнула — показ не записан; некритично для тренировки.
    });
  }, [trainerId, deck, index, finished, lastViews]);

  const onPick = (option: SentenceOption) => {
    // Повторные тапы после ответа игнорируем: результат уже зафиксирован.
    if (!question || picked !== null) return;
    setPicked(option.text);

    const verbId = question.sentence.verbId;

    if (option.correct) {
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
      sentenceId: question.sentence.id,
      chosen: option.text,
    }).catch(() => {});

    // Ошибку возвращаем в колоду через несколько позиций — кроме случая,
    // когда это последнее задание: подстановка в конец зациклила бы сессию
    // на одном предложении. Статус repeat вернёт его в начало следующей.
    if (index + 1 < deck.length) {
      const next = [...deck];
      next.splice(Math.min(index + 1 + REPEAT_AFTER, next.length), 0, question);
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

  const answered = picked !== null;
  const pickedOption = question?.options.find((o) => o.text === picked);
  const isCorrect = pickedOption?.correct ?? false;
  const rightAnswer = question ? correctOptions(question.options)[0]?.text : undefined;

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
              <dd className="text-3xl font-bold text-orange-500">{sessionWrong}</dd>
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
        question && (
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

            {/* предложение: пропуск до ответа — прочерк, после — выбранное слово */}
            <div className="mt-5 rounded-3xl border border-line/60 bg-white p-6 shadow-sm">
              <p className="text-2xl leading-relaxed font-semibold">
                {splitSentence(question.sentence.text, question.sentence.options).map(
                  (part, i) =>
                    part.kind === "text" ? (
                      <span key={i}>{part.value}</span>
                    ) : (
                      <span
                        key={i}
                        className={
                          !answered
                            ? "mx-0.5 inline-block min-w-24 border-b-2 border-dashed border-line align-bottom"
                            : isCorrect
                              ? "mx-0.5 inline-block border-b-2 border-emerald-500 text-emerald-600"
                              : "mx-0.5 inline-block border-b-2 border-rose-500 text-rose-600"
                        }
                      >
                        {/* до ответа пропуск пустой, но высота строки должна сохраниться */}
                        {answered ? picked : " "}
                      </span>
                    ),
                )}
              </p>
              {!answered && <p className="mt-4 text-sm text-subtle">{settings.hint}</p>}
            </div>

            {/* варианты */}
            <ul className="mt-4 flex flex-col gap-2.5">
              {question.options.map((option, i) => {
                const isPicked = option.text === picked;
                // После ответа подсвечиваем верный всегда, а выбранный неверный —
                // красным: студент должен увидеть и свою ошибку, и правильную форму.
                const state = !answered
                  ? "idle"
                  : option.correct
                    ? "right"
                    : isPicked
                      ? "wrong"
                      : "muted";

                return (
                  <li key={option.text}>
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
                      <span className="min-w-0 flex-1 text-lg font-medium">{option.text}</span>
                      {state === "right" && (
                        <CircleCheck size={20} className="shrink-0 text-emerald-600" />
                      )}
                      {state === "wrong" && (
                        <CircleX size={20} className="shrink-0 text-rose-600" />
                      )}
                    </button>
                  </li>
                );
              })}
            </ul>

            {answered ? (
              /* разбор */
              <div
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

                {!isCorrect && rightAnswer && (
                  <p className="mt-2.5 text-sm">
                    <span className="text-subtle">{labels.correctAnswer}: </span>
                    <span className="font-semibold text-emerald-700">{rightAnswer}</span>
                  </p>
                )}

                {question.sentence.explanation && (
                  <p className="mt-2.5 text-sm">
                    <span className="text-subtle">{labels.why}: </span>
                    {question.sentence.explanation}
                  </p>
                )}

                {question.sentence.translation && (
                  <p className="mt-2.5 text-sm">
                    <span className="text-subtle">{labels.sentenceTranslation}: </span>
                    {question.sentence.translation}
                  </p>
                )}

                <button
                  type="button"
                  onClick={onNext}
                  className="mt-5 flex w-full items-center justify-center gap-2 rounded-2xl bg-blue-600 py-3.5 font-medium text-white transition-colors hover:bg-blue-700"
                >
                  {labels.next}
                  <ArrowRight size={18} />
                </button>
              </div>
            ) : (
              /* шаги «как работает тренажёр» из settings — только до ответа,
                 чтобы не отвлекать от разбора */
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
