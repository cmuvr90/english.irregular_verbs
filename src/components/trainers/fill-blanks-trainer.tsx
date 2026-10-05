"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";

import type { FlashcardProgress, FlashcardVerb } from "@/components/trainers/flashcards-trainer";
import { interpolate } from "@/lib/locales";
import { answerCard, recordCardView } from "@/lib/trainer-actions";
import { buildDeck, mulberry32, REPEAT_AFTER } from "@/lib/trainer-deck";
import type { TrainerSettings } from "@/lib/trainer-settings";
import { formOf, hasAnswer, hiddenGroups, matchesForm, type FormNumber } from "@/lib/verb-forms";
import { cn } from "@/ui/cn";
import { AnswerSheet } from "@/ui/composites/answer-sheet";
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
    answerCard(trainerId, verbIdValue, "repeat", {
      form: askedForm,
      chosen: typed,
    }).catch(() => {});

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
              <SessionProgress current={index + 1} total={deck.length} label={title} tone="v2" />

              {/* задание: три формы, одна — поле ввода */}
              <Card padding="lg" className="mt-5">
                <form onSubmit={onCheck}>
                  {/* Три формы столбиком, а не в строку: длина форм (understood) и
                      ответа заранее неизвестна, и строчная раскладка на узком
                      экране разъезжалась. Метка формы — над полем, поле
                      растягивается на всю ширину и не толкает соседей. */}
                  <ol className="flex flex-col gap-4">
                    {([1, 2, 3] as const).map((form) => (
                      <li key={form} className="flex flex-col gap-1.5">
                        <VerbForm form={`v${form}`} variant="label" />
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
                            // Классы — как у TextField variant="answer": самому TextField
                            // нельзя передать ref, а фокус в поле нужен (см. эффект выше).
                            className={cn(
                              "t-verb h-16 w-full min-w-0 rounded-md bg-surface px-5 text-center text-2xl text-fg-strong ring-1 ring-hairline-strong transition-[box-shadow,background-color] duration-200 outline-none placeholder:text-fg-faint",
                              "focus:shadow-[0_0_0_4px_var(--color-ink-100)] focus:ring-2 focus:ring-ink-500",
                              // неверно — «ягода» и зачёркнутый ответ, верно — «листва»
                              "aria-invalid:bg-berry-50/60 aria-invalid:text-berry-700 aria-invalid:line-through aria-invalid:decoration-2 aria-invalid:ring-2 aria-invalid:ring-berry-400 aria-invalid:focus:shadow-[0_0_0_4px_var(--color-berry-100)]",
                              result === true &&
                                "bg-leaf-50 text-leaf-700 ring-2 ring-leaf-400 focus:shadow-[0_0_0_4px_var(--color-leaf-100)] focus:ring-leaf-500",
                            )}
                          />
                        ) : task.hidden.includes(form) ? (
                          // Вторая скрытая позиция с тем же написанием: повторяем
                          // введённое, второго поля нет — ответ пишется один раз.
                          <span
                            aria-hidden
                            className="t-verb flex h-16 min-w-0 items-center justify-center truncate rounded-md border-2 border-dashed border-hairline-strong px-5 text-2xl text-fg-faint"
                          >
                            {typed.trim() || "…"}
                          </span>
                        ) : (
                          // Известная форма — на «утопленной» плашке, цветом своей формы.
                          <span className="flex min-h-16 min-w-0 items-center justify-center rounded-md bg-surface-sunken px-5 inset-shadow-sunken">
                            <VerbForm
                              form={`v${form}`}
                              word={formOf(task.verb, form)}
                              variant="text"
                              className="text-2xl break-all"
                            />
                          </span>
                        )}
                      </li>
                    ))}
                  </ol>

                  {!answered && (
                    <>
                      <p className="t-body-sm mt-4 text-center text-fg-muted">{settings.hint}</p>
                      <Button
                        type="submit"
                        variant="primary"
                        size="lg"
                        block
                        disabled={!hasAnswer(typed)}
                        className="mt-5"
                      >
                        {labels.check}
                      </Button>
                    </>
                  )}
                </form>
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

      {/* разбор — лист снизу; id — для aria-describedby поля ответа */}
      <AnswerSheet
        id="fill-blanks-result"
        actionRef={nextRef}
        result={!finished && answered ? (result ? "correct" : "wrong") : null}
        title={result ? labels.correct : labels.wrong}
        answerLabel={labels.correctAnswer}
        answer={expected && <span className="t-verb text-2xl text-leaf-700">{expected}</span>}
        details={[
          ...(result === false && typed.trim()
            ? [
                {
                  label: labels.yourAnswer,
                  text: (
                    <span className="t-verb break-all text-berry-700 line-through decoration-2">
                      {typed.trim()}
                    </span>
                  ),
                },
              ]
            : []),
        ]}
        explanation={
          task
            ? `${task.verb.form1} – ${task.verb.form2} – ${task.verb.form3}${task.verb.translation ? ` · ${task.verb.translation}` : ""}`
            : undefined
        }
        actionLabel={labels.next}
        onAction={onNext}
      />
    </>
  );
}
