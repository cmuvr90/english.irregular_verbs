"use client";

import { AnimatePresence } from "motion/react";
import * as m from "motion/react-m";
import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";

import { answerCard, recordCardView } from "@/lib/trainer-actions";
import { buildDeck, mulberry32, REPEAT_AFTER } from "@/lib/trainer-deck";
import type { TrainerSettings } from "@/lib/trainer-settings";
import { EmptyState } from "@/ui/composites/empty-state";
import { SessionProgress } from "@/ui/composites/session-progress";
import { SessionSummary } from "@/ui/composites/session-summary";
import { TopBar } from "@/ui/composites/top-bar";
import { TrainerSteps } from "@/ui/composites/trainer-steps";
import { IconCheck, IconReview, IconShow, IconStreak } from "@/ui/icons";
import { spring } from "@/ui/motion/presets";
import { Badge } from "@/ui/primitives/badge";
import { Button } from "@/ui/primitives/button";
import { buttonClass } from "@/ui/primitives/button-styles";
import { Card } from "@/ui/primitives/card";
import { VerbForm } from "@/ui/primitives/verb-form";
import { stepIcon } from "@/ui/trainer-icons";

/**
 * Тренажёр «Карточки» (flashcards). Компонент заточен ровно под этот тип
 * тренажёра: читает его settings (подсказка + шаги инструкции) и работает
 * с любым списком глаголов — группой или всеми вперемешку.
 *
 * Колода собирается с учётом прогресса студента (см. src/lib/trainer-deck.ts);
 * карточка с ответом «Повторить» возвращается в колоду через несколько позиций.
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

export type FlashcardsSettings = TrainerSettings;

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

const verbId = (verb: FlashcardVerb) => verb.id;

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
    buildDeck(verbs, verbId, statuses, lastViews, mulberry32(seed)),
  );
  const [index, setIndex] = useState(0);
  const [revealed, setRevealed] = useState(false);
  const [finished, setFinished] = useState(false);
  /** Номер прохода: после «Ещё раз» показ первой карточки пишется заново. */
  const [round, setRound] = useState(0);
  const [learnedCount, setLearnedCount] = useState(
    () => progress.filter((p) => p.status === "learned").length,
  );

  // Итоги текущей сессии для финального экрана.
  const [sessionKnow, setSessionKnow] = useState(0);
  const [sessionRepeat, setSessionRepeat] = useState(0);

  // «Ещё раз»: уже на клиенте, можно перемешать по-настоящему случайно.
  const restart = useCallback(() => {
    setDeck(buildDeck(verbs, verbId, statuses, lastViews, mulberry32(Math.random())));
    setIndex(0);
    setRevealed(false);
    setFinished(false);
    setRound((n) => n + 1);
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
    const key = `${round}:${index}:${current.id}`;
    if (lastViewKey.current === key) return;
    lastViewKey.current = key;
    recordCardView(trainerId, current.id).catch(() => {
      // Сеть моргнула — показ не записан; некритично для тренировки.
    });
  }, [trainerId, deck, index, finished, round]);

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

      {/* pt-24 освобождает место под фиксированную шапку, pb-32 — под таб-бар */}
      <div className="mx-auto w-full max-w-md px-4 pt-24 pb-32">
        {verbs.length === 0 ? (
          <EmptyState title={labels.empty} className="mt-6" />
        ) : finished ? (
          <SessionSummary
            className="mt-4"
            title={labels.finishTitle}
            text={labels.finishText}
            illustration={{ src: "/images/app/mascot-celebrate.webp", alt: "" }}
            stats={[
              { value: sessionKnow, label: labels.know, tone: "success" },
              { value: sessionRepeat, label: labels.repeat, tone: "v2" },
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
          card && (
            <>
              <SessionProgress current={index + 1} total={deck.length} label={title} tone="v3" />

              {/* карточка со стопкой-подложкой: три «неба» форм глагола */}
              <div className="relative mt-5">
                <div
                  className="absolute inset-x-4 -bottom-3 h-full rounded-2xl bg-grad-dusk opacity-35"
                  aria-hidden
                />
                <div
                  className="absolute inset-x-2 -bottom-1.5 h-full rounded-2xl bg-grad-sunset opacity-45"
                  aria-hidden
                />
                <AnimatePresence mode="popLayout" initial={false}>
                  <m.div
                    // Ключ по позиции в колоде: повтор той же карточки — это новая анимация.
                    key={`${round}:${index}`}
                    initial={{ opacity: 0, x: 60, rotate: 4 }}
                    animate={{ opacity: 1, x: 0, rotate: 0 }}
                    exit={{ opacity: 0, x: -60, rotate: -4 }}
                    transition={spring.gentle}
                  >
                    <Card padding="none" className="overflow-hidden">
                      <div className="absolute inset-x-0 top-0 h-1.5 bg-grad-day" aria-hidden />
                      <button
                        type="button"
                        onClick={() => setRevealed(true)}
                        className="focus-ring flex min-h-72 w-full flex-col items-center justify-center rounded-xl p-8"
                      >
                        <VerbForm form="v1" variant="label" />
                        <VerbForm
                          form="v1"
                          word={card.form1}
                          variant="text"
                          className="mt-3 text-5xl"
                        />
                        <AnimatePresence mode="wait" initial={false}>
                          {revealed ? (
                            <m.span
                              key="answer"
                              initial={{
                                opacity: 0,
                                y: 12,
                                filter: "blur(6px)",
                              }}
                              animate={{
                                opacity: 1,
                                y: 0,
                                filter: "blur(0px)",
                              }}
                              transition={spring.gentle}
                              className="mt-6 flex w-full flex-col items-center border-t border-hairline pt-5"
                            >
                              <span className="flex flex-wrap justify-center gap-2">
                                <VerbForm form="v2" word={card.form2} size="lg" />
                                <VerbForm form="v3" word={card.form3} size="lg" />
                              </span>
                              <span className="t-body mt-3 text-fg-muted">{card.translation}</span>
                            </m.span>
                          ) : (
                            <m.span
                              key="hint"
                              exit={{ opacity: 0, y: -8 }}
                              className="t-body-sm mt-6 w-full border-t border-hairline pt-5 text-fg-muted"
                            >
                              {settings.hint}
                            </m.span>
                          )}
                        </AnimatePresence>
                      </button>
                    </Card>
                  </m.div>
                </AnimatePresence>
              </div>

              {/* действия */}
              <div className="mt-7 flex gap-3">
                <Button
                  variant="success"
                  size="lg"
                  icon={IconCheck}
                  onClick={onKnow}
                  className="flex-1"
                >
                  {labels.know}
                </Button>
                <Button
                  variant="secondary"
                  size="lg"
                  icon={IconReview}
                  onClick={onRepeat}
                  className="flex-1"
                >
                  {labels.repeat}
                </Button>
              </div>
              <Button
                variant="soft"
                size="lg"
                block
                icon={IconShow}
                onClick={() => setRevealed(true)}
                disabled={revealed}
                className="mt-3"
              >
                {labels.showAnswer}
              </Button>

              {/* шаги «как работает тренажёр» из settings */}
              <TrainerSteps
                className="mt-8"
                title={labels.howItWorks}
                steps={settings.steps.map((step) => ({
                  ...step,
                  icon: stepIcon(step.icon),
                }))}
              />
            </>
          )
        )}
      </div>
    </>
  );
}
