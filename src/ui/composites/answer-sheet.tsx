"use client";

import { AnimatePresence } from "motion/react";
import * as m from "motion/react-m";

import { cn } from "../cn";
import { IconCorrect, IconNext, IconWrong } from "../icons";
import { pop, spring } from "../motion/presets";
import { Button } from "../primitives/button";

export type AnswerSheetProps = {
  /** null — лист скрыт. */
  result: "correct" | "wrong" | null;
  title: string;
  /** Верный ответ — показывается при ошибке. */
  answer?: React.ReactNode;
  answerLabel?: string;
  explanation?: string;
  /** Дополнительные строки разбора: «Почему», «Перевод». */
  details?: Array<{ label: string; text: React.ReactNode }>;
  actionLabel: string;
  onAction: () => void;
  /** Ref на кнопку действия: тренажёры переводят на неё фокус после ответа (Enter → дальше). */
  actionRef?: React.Ref<HTMLButtonElement>;
  /** id листа — на него ссылается aria-describedby поля ответа. */
  id?: string;
  /** fixed — выезжает снизу экрана; static — для витрин. */
  position?: "fixed" | "static";
};

/**
 * Лист обратной связи в тренажёрах: выезжает снизу после ответа.
 * Верно — лист «листвы» с отскоком иконки; неверно — «ягода» и верный ответ.
 */
export function AnswerSheet({ result, title, answer, answerLabel, explanation, details, actionLabel, onAction, actionRef, id, position = "fixed" }: AnswerSheetProps) {
  const correct = result === "correct";
  return (
    <AnimatePresence>
      {result && (
        <m.div
          key={result}
          id={id}
          role="status"
          aria-live="polite"
          initial={{ y: "100%", opacity: 0.6 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: "100%", opacity: 0 }}
          transition={spring.gentle}
          className={cn(position === "fixed" && "fixed inset-x-0 bottom-0 z-40", "px-3 pb-[max(0.75rem,env(safe-area-inset-bottom))]")}
        >
          <div
            className={cn(
              "mx-auto max-h-[75dvh] max-w-md overflow-y-auto rounded-3xl p-5 shadow-xl ring-1",
              correct ? "bg-leaf-50 ring-leaf-200" : "bg-berry-50 ring-berry-200",
            )}
          >
            <div className="flex items-center gap-3">
              <m.span variants={pop} initial="hidden" animate="show" className={correct ? "text-leaf-600" : "text-berry-600"}>
                {correct ? <IconCorrect size={36} weight="fill" aria-hidden /> : <IconWrong size={36} weight="fill" aria-hidden />}
              </m.span>
              <p className={cn("t-heading", correct ? "text-leaf-800" : "text-berry-800")}>{title}</p>
            </div>

            {!correct && answer && (
              <div className="mt-3">
                {answerLabel && <p className="t-overline text-berry-700/80">{answerLabel}</p>}
                <div className="mt-1.5">{answer}</div>
              </div>
            )}
            {explanation && <p className={cn("t-body-sm mt-3", correct ? "text-leaf-900/80" : "text-berry-900/80")}>{explanation}</p>}
            {details?.map((d) => (
              <p key={d.label} className={cn("t-body-sm mt-2", correct ? "text-leaf-950/85" : "text-berry-950/85")}>
                <span className="font-semibold">{d.label}: </span>
                {d.text}
              </p>
            ))}

            <Button
              ref={actionRef}
              variant={correct ? "success" : "danger"}
              size="lg"
              block
              iconRight={IconNext}
              onClick={onAction}
              className="mt-4"
            >
              {actionLabel}
            </Button>
          </div>
        </m.div>
      )}
    </AnimatePresence>
  );
}
