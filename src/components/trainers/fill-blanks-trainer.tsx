"use client";

import { ArrowLeft, ArrowRight, CircleCheck, CircleX, Flame, RotateCw } from "lucide-react";
import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";

import type { FlashcardProgress, FlashcardVerb } from "@/components/trainers/flashcards-trainer";
import { interpolate } from "@/lib/locales";
import { answerCard, recordCardView } from "@/lib/trainer-actions";
import { buildDeck, mulberry32, REPEAT_AFTER } from "@/lib/trainer-deck";
import { stepIcon } from "@/lib/trainer-icons";
import type { TrainerSettings } from "@/lib/trainer-settings";
import { formOf, hasAnswer, hiddenGroups, matchesForm, type FormNumber } from "@/lib/verb-forms";

/**
 * Тренажёр «Заполни пропуски» (fill-blanks): три формы глагола, одна скрыта,
 * студент вписывает её сам. В отличие от карточек, ответ проверяется, а не
 * оценивается студентом; в отличие от «Выбери форму», вариантов-подсказок нет.
 *
 * Какую форму скрыть, решает колода — случайно для каждого показа, но так,
 * чтобы ответ не стоял на экране: совпадающие формы (brought – brought)
 * скрываются вместе, и студент вписывает общую форму один раз. Прогресс
 * пишется по глаголу, как у остальных тренажёров; ошибка возвращает глагол
 * в колоду через несколько позиций.
 */

export type FillBlanksLabels = {
  howItWorks: string;
  fillPlaceholder: string;
  check: string;
  yourAnswer: string;
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
  verbs: FlashcardVerb[];
  progress: FlashcardProgress[];
  labels: FillBlanksLabels;
  backHref: string;
  /** Зерно с сервера: SSR и гидрация видят одну колоду и одни пропуски. */
  seed: number;
};

/** Задание: глагол и скрытые формы (одна или несколько одинаковых). */
type Task = { verb: FlashcardVerb; hidden: FormNumber[] };

const stepChips = [
  "bg-violet-100 text-violet-600",
  "bg-blue-100 text-blue-600",
  "bg-emerald-100 text-emerald-600",
];

const verbId = (verb: FlashcardVerb) => verb.id;

/** Подписи форм — английские термины, их учат именно так на любом языке интерфейса. */
const FORM_NAMES = ["Infinitive", "Past Simple", "Past Participle"] as const;

/** Самая длинная форма с вариантами — пара десятков символов; больше — уже не ответ. */
const MAX_ANSWER_LENGTH = 40;

function buildTasks(
  verbs: FlashcardVerb[],
  statuses: Map<string, "none" | "repeat" | "learned">,
  lastViews: Map<string, number | null>,
  random: () => number,
): Task[] {
  return buildDeck(verbs, verbId, statuses, lastViews, random).map((verb) => {
    const groups = hiddenGroups(verb);
    return { verb, hidden: groups[Math.floor(random() * groups.length)] };
  });
}

export function FillBlanksTrainer({
  trainerId,
  title,
  settings,
  verbs,
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
    buildTasks(verbs, statuses, lastViews, mulberry32(seed)),
  );
  const [index, setIndex] = useState(0);
  const [typed, setTyped] = useState("");
  /** null — ещё не проверяли; true/false — результат проверки. */
  const [result, setResult] = useState<boolean | null>(null);
  const [finished, setFinished] = useState(false);
  /** Номер прохода: «Ещё раз» начинает новый, и показ первой карточки пишется заново. */
  const [round, setRound] = useState(0);
  const [learnedCount, setLearnedCount] = useState(
    () => progress.filter((p) => p.status === "learned").length,
  );
  const [sessionCorrect, setSessionCorrect] = useState(0);
  const [sessionWrong, setSessionWrong] = useState(0);

  const inputRef = useRef<HTMLInputElement>(null);
  const nextRef = useRef<HTMLButtonElement>(null);

  const task = !finished ? deck[index] : undefined;
  // Скрытые формы одинаковы по написанию — проверяем по первой из них.
  const askedForm = task?.hidden[0];
  const expected = task && askedForm ? formOf(task.verb, askedForm) : "";
  const answered = result !== null;

  const restart = useCallback(() => {
    setDeck(buildTasks(verbs, statuses, lastViews, mulberry32(Math.random())));
    setIndex(0);
    setTyped("");
    setResult(null);
    setFinished(false);
    setRound((n) => n + 1);
    setSessionCorrect(0);
    setSessionWrong(0);
  }, [verbs, statuses, lastViews]);

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

  // Фокус: до проверки — в поле ввода, после — на «Дальше», чтобы Enter
  // вёл по колоде без мыши и без повторной отправки того же ответа.
  useEffect(() => {
    if (finished) return;
    if (answered) nextRef.current?.focus();
    else inputRef.current?.focus();
  }, [answered, index, finished]);

  const onCheck = (event: React.FormEvent) => {
    event.preventDefault();
    if (!task || !askedForm || answered || !hasAnswer(typed)) return;

    const verbIdValue = task.verb.id;
    const correct = matchesForm(typed, task.verb, askedForm);
    setResult(correct);

    if (correct) {
      if (statuses.get(verbIdValue) !== "learned") setLearnedCount((n) => n + 1);
      statuses.set(verbIdValue, "learned");
      setSessionCorrect((n) => n + 1);
      answerCard(trainerId, verbIdValue, "know").catch(() => {});
      return;
    }

    if (statuses.get(verbIdValue) === "learned") setLearnedCount((n) => n - 1);
    statuses.set(verbIdValue, "repeat");
    setSessionWrong((n) => n + 1);
    answerCard(trainerId, verbIdValue, "repeat", { form: askedForm, chosen: typed }).catch(
      () => {},
    );

    // Ошибку возвращаем в колоду через несколько позиций — кроме последнего
    // задания: иначе сессия зациклилась бы на одном глаголе. Скрытая форма
    // при повторе та же — студент должен закрепить именно её.
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
    setTyped("");
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

            {/* задание: три формы, одна — поле ввода */}
            <form
              onSubmit={onCheck}
              className="mt-5 rounded-3xl border border-line/60 bg-white p-6 shadow-sm"
            >
              {/* Три формы столбиком, а не в строку: длина форм (understood) и
                  ответа заранее неизвестна, и строчная раскладка на узком
                  экране разъезжалась. Каждая строка — своя ширина, поле
                  растягивается на всю строку и не толкает соседей. */}
              <ol className="flex flex-col gap-2.5">
                {([1, 2, 3] as const).map((form) => (
                  <li key={form} className="grid grid-cols-[6.5rem_1fr] items-center gap-3">
                    <span className="flex flex-col leading-tight">
                      <span className="text-sm font-semibold text-blue-600">V{form}</span>
                      <span className="text-[11px] whitespace-nowrap text-subtle">{FORM_NAMES[form - 1]}</span>
                    </span>
                    {form === askedForm ? (
                      <input
                        ref={inputRef}
                        value={typed}
                        onChange={(event) => setTyped(event.target.value)}
                        // readOnly, а не disabled: поле остаётся в порядке табуляции,
                        // и скринридер может прочитать ответ вместе с aria-invalid.
                        readOnly={answered}
                        aria-invalid={result === false}
                        aria-describedby={answered ? "fill-blanks-result" : undefined}
                        maxLength={MAX_ANSWER_LENGTH}
                        aria-label={`${labels.fillPlaceholder}: ${task.hidden
                          .map((f) => `V${f} ${FORM_NAMES[f - 1]}`)
                          .join(", ")}`}
                        placeholder="…"
                        autoComplete="off"
                        autoCorrect="off"
                        autoCapitalize="none"
                        spellCheck={false}
                        enterKeyHint="done"
                        className={`h-12 w-full min-w-0 rounded-xl border-2 bg-white px-3 text-xl font-bold outline-none transition-colors ${
                          result === true
                            ? "border-emerald-500 text-emerald-600"
                            : result === false
                              ? "border-rose-500 text-rose-600 line-through decoration-2"
                              : "border-blue-300 focus:border-blue-600"
                        }`}
                      />
                    ) : task.hidden.includes(form) ? (
                      // Вторая скрытая позиция с тем же написанием: повторяем
                      // введённое, второго поля нет — ответ пишется один раз.
                      <span
                        aria-hidden
                        className="flex h-12 min-w-0 items-center truncate rounded-xl border-2 border-dashed border-blue-200 px-3 text-xl font-bold text-subtle"
                      >
                        {typed.trim() || "…"}
                      </span>
                    ) : (
                      <span className="flex h-12 min-w-0 items-center rounded-xl bg-muted px-3 text-xl font-bold break-all">
                        {formOf(task.verb, form)}
                      </span>
                    )}
                  </li>
                ))}
              </ol>

              {!answered && (
                <>
                  <p className="mt-4 text-center text-sm text-subtle">{settings.hint}</p>
                  <button
                    type="submit"
                    disabled={!hasAnswer(typed)}
                    className="mt-5 flex w-full items-center justify-center gap-2 rounded-2xl bg-blue-600 py-3.5 font-medium text-white transition-colors hover:bg-blue-700 disabled:opacity-50"
                  >
                    {labels.check}
                  </button>
                </>
              )}
            </form>

            {answered ? (
              /* разбор */
              <div
                id="fill-blanks-result"
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
                  <>
                    <p className="mt-2.5 text-sm">
                      <span className="text-subtle">{labels.yourAnswer}: </span>
                      <span className="font-semibold break-all text-rose-700">{typed.trim()}</span>
                    </p>
                    <p className="mt-1 text-sm">
                      <span className="text-subtle">{labels.correctAnswer}: </span>
                      <span className="font-semibold text-emerald-700">{expected}</span>
                    </p>
                  </>
                )}

                <p className="mt-2.5 text-sm">
                  <span className="font-semibold">
                    {task.verb.form1} – {task.verb.form2} – {task.verb.form3}
                  </span>
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
