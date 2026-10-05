"use client";

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
import { stepIcon } from "@/ui/trainer-icons";

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

/** Подписи вариантов, как в бумажных тестах: a) b) c). */
const OPTION_LETTERS = "abcdefgh";

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

/** Порядок предложений — общий для тренажёров (trainer-deck), варианты перемешиваются здесь. */
function buildQuestions(
  sentences: ChoiceSentence[],
  statuses: Map<string, "none" | "repeat" | "learned">,
  lastViewAt: Map<string, number | null>,
  random: () => number,
): Question[] {
  // Битые предложения отсеиваем до сборки колоды, а не после: иначе доля
  // подмешанных выученных считалась бы от заданий, которых не будет.
  const playable = sentences.filter((sentence) => {
    const [blankKey] = parseBlanks(sentence.text);
    return Boolean(blankKey && sentence.options[blankKey]?.length);
  });
  return buildDeck(playable, (s) => s.verbId, statuses, lastViewAt, random)
    .map((sentence) => buildQuestion(sentence, random))
    .filter((q): q is Question => q !== null);
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
    buildQuestions(sentences, statuses, lastViews, mulberry32(seed)),
  );
  const [index, setIndex] = useState(0);
  /** Текст выбранного варианта; null — на задание ещё не ответили. */
  const [picked, setPicked] = useState<string | null>(null);
  const [finished, setFinished] = useState(false);
  /** Номер прохода: после «Ещё раз» показ первой карточки пишется заново. */
  const [round, setRound] = useState(0);
  const [learnedCount, setLearnedCount] = useState(
    () => progress.filter((p) => p.status === "learned").length,
  );

  // Итоги текущей сессии для финального экрана.
  const [sessionCorrect, setSessionCorrect] = useState(0);
  const [sessionWrong, setSessionWrong] = useState(0);

  // «Ещё раз»: уже на клиенте, можно перемешать по-настоящему случайно.
  const restart = useCallback(() => {
    setDeck(buildQuestions(sentences, statuses, lastViews, mulberry32(Math.random())));
    setIndex(0);
    setPicked(null);
    setFinished(false);
    setRound((n) => n + 1);
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
    const key = `${round}:${index}:${current.sentence.id}`;
    if (lastViewKey.current === key) return;
    lastViewKey.current = key;
    // Отметка времени ставится здесь, а не в ответе: на сервере lastViewAt
    // тоже пишется по показу, и по ней «Ещё раз» решает, какие выученные
    // глаголы подмешать первыми.
    lastViews.set(current.sentence.verbId, Date.now());
    recordCardView(trainerId, current.sentence.verbId).catch(() => {
      // Сеть моргнула — показ не записан; некритично для тренировки.
    });
  }, [trainerId, deck, index, finished, lastViews, round]);

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
          question && (
            <>
              <SessionProgress current={index + 1} total={deck.length} label={title} tone="v1" />

              {/* предложение на тетрадном листе: пропуск до ответа — прочерк, после — выбранное слово */}
              <Card variant="notebook" padding="none" className="mt-5 overflow-hidden">
                <p className="pt-7 pr-5 pb-7 pl-12 text-2xl leading-[1.75rem] font-semibold text-fg-strong [word-spacing:0.05em]">
                  {splitSentence(question.sentence.text, question.sentence.options).map(
                    (part, i) =>
                      part.kind === "text" ? (
                        <span key={i}>{part.value}</span>
                      ) : (
                        <span
                          key={i}
                          className={
                            !answered
                              ? "mx-0.5 inline-block min-w-24 rounded-xs bg-ink-50 align-bottom ring-1 ring-ink-200 ring-inset"
                              : isCorrect
                                ? "t-verb mx-0.5 inline-block rounded-xs bg-leaf-100 px-1.5 text-leaf-700"
                                : "t-verb mx-0.5 inline-block rounded-xs bg-berry-100 px-1.5 text-berry-700 line-through decoration-2"
                          }
                        >
                          {/* до ответа пропуск пустой, но высота строки должна сохраниться */}
                          {answered ? picked : "\u00a0"}
                        </span>
                      ),
                  )}
                </p>
              </Card>
              {!answered && <p className="t-body-sm mt-3 px-1 text-fg-muted">{settings.hint}</p>}

              {/* варианты */}
              <ul className="mt-4 flex flex-col gap-3">
                {question.options.map((option, i) => {
                  const isPicked = option.text === picked;
                  // После ответа подсвечиваем верный всегда, а выбранный неверный —
                  // красным: студент должен увидеть и свою ошибку, и правильную форму.
                  const state: ChoiceState = !answered
                    ? "idle"
                    : option.correct
                      ? "right"
                      : isPicked
                        ? "wrong"
                        : "muted";

                  return (
                    <li key={option.text}>
                      <ChoiceOption
                        letter={OPTION_LETTERS[i] ?? "•"}
                        state={state}
                        onClick={() => onPick(option)}
                        disabled={answered}
                        pressed={isPicked}
                      >
                        {option.text}
                      </ChoiceOption>
                    </li>
                  );
                })}
              </ul>

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
        result={!finished && answered ? (isCorrect ? "correct" : "wrong") : null}
        title={isCorrect ? labels.correct : labels.wrong}
        answerLabel={labels.correctAnswer}
        answer={rightAnswer && <span className="t-verb text-2xl text-leaf-700">{rightAnswer}</span>}
        details={[
          ...(question?.sentence.explanation
            ? [{ label: labels.why, text: question.sentence.explanation }]
            : []),
          ...(question?.sentence.translation
            ? [
                {
                  label: labels.sentenceTranslation,
                  text: question.sentence.translation,
                },
              ]
            : []),
        ]}
        actionLabel={labels.next}
        onAction={onNext}
      />
    </>
  );
}
