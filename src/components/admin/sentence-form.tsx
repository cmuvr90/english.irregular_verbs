"use client";

import { Plus, X } from "lucide-react";
import { useRef, useState } from "react";

import {
  Field,
  FormFooter,
  inputClass,
  textareaClass,
  LocalizedFields,
  Section,
  useAdminForm,
} from "./form-fields";

import { buttonClass } from "./ui";

import { saveSentence } from "@/lib/admin-actions";
import {
  sentenceStatuses,
  sentenceStatusLabels,
  type SentenceStatusValue,
} from "@/lib/admin-form";
import type { Locale } from "@/lib/locales";
import {
  correctOptions,
  parseBlanks,
  splitSentence,
  validateSentence,
  type SentenceOption,
  type SentenceOptions,
} from "@/lib/sentence-options";

export type SentenceFormValues = {
  verbId: string;
  text: string;
  options: SentenceOptions;
  explanation: Partial<Record<Locale, string>>;
  translation: Partial<Record<Locale, string>>;
  level: number;
  status: SentenceStatusValue;
  note: string;
};

/** Пустой пропуск: верный вариант и один дистрактор — меньше validateSentence не примет. */
function emptyBlank(): SentenceOption[] {
  return [
    { text: "", correct: true },
    { text: "", correct: false },
  ];
}

const ALPHABET = "abcdefghijklmnopqrstuvwxyz";

export function SentenceForm({
  id,
  values,
  verbs,
}: {
  id: string | null;
  values: SentenceFormValues;
  verbs: { id: string; label: string }[];
}) {
  const { state, pending, onSubmit } = useAdminForm(saveSentence.bind(null, id));
  const [text, setText] = useState(values.text);
  // Варианты храним и для пропусков, временно пропавших из текста: стёр [a]
  // и вернул — варианты на месте. В форму уходят только живые пропуски.
  const [options, setOptions] = useState<SentenceOptions>(values.options);
  const textRef = useRef<HTMLTextAreaElement>(null);

  const blanks = [...new Set(parseBlanks(text))];
  const current: SentenceOptions = Object.fromEntries(
    blanks.map((key) => [key, options[key] ?? emptyBlank()]),
  );
  const problems = validateSentence(text, current);

  function updateBlank(key: string, update: (variants: SentenceOption[]) => SentenceOption[]) {
    setOptions((prev) => ({ ...prev, [key]: update(prev[key] ?? emptyBlank()) }));
  }

  /** Вставляет следующий свободный маркер в позицию курсора. */
  function insertBlank() {
    const key = [...ALPHABET].find((letter) => !blanks.includes(letter));
    if (!key) return;
    const el = textRef.current;
    const start = el?.selectionStart ?? text.length;
    const end = el?.selectionEnd ?? text.length;
    setText(`${text.slice(0, start)}[${key}]${text.slice(end)}`);
  }

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-6">
      <Section title="Предложение">
        <Field label="Глагол">
          <select name="verbId" defaultValue={values.verbId} required className={inputClass}>
            <option value="" disabled>
              Выберите глагол
            </option>
            {verbs.map((verb) => (
              <option key={verb.id} value={verb.id}>
                {verb.label}
              </option>
            ))}
          </select>
        </Field>

        <Field label="Текст" hint="Пропуски — латинская буква в квадратных скобках: Yesterday she [a] her leg.">
          <textarea
            ref={textRef}
            name="text"
            value={text}
            onChange={(event) => setText(event.target.value)}
            required
            rows={2}
            className={textareaClass}
          />
        </Field>
        <button
          type="button"
          onClick={insertBlank}
          className={`${buttonClass.link} w-fit`}
        >
          <Plus />
          Вставить пропуск
        </button>

        {text.trim() && (
          <div className="rounded-lg bg-slate-50 px-4 py-3 text-sm ring-1 ring-line">
            <span className="mb-1 block text-xs font-medium text-subtle">Как увидит студент</span>
            {splitSentence(text, current).map((part, index) =>
              part.kind === "text" ? (
                <span key={index}>{part.value}</span>
              ) : (
                <span
                  key={index}
                  className="mx-0.5 rounded-md bg-blue-100 px-1.5 py-0.5 font-medium text-blue-700"
                >
                  {correctOptions(part.options)[0]?.text || "___"}
                </span>
              ),
            )}
          </div>
        )}
      </Section>

      <Section title="Варианты ответа">
        <input type="hidden" name="options" value={JSON.stringify(current)} />
        {blanks.length === 0 && (
          <p className="text-sm text-subtle">Добавьте в текст хотя бы один пропуск.</p>
        )}
        {blanks.map((key) => (
          <fieldset key={key} className="rounded-lg bg-slate-50 p-4 ring-1 ring-line">
            <legend className="px-1 font-mono text-sm font-semibold">[{key}]</legend>
            <p className="mb-2 text-xs text-subtle">Отметьте единственный верный вариант.</p>
            <ul className="flex flex-col gap-2">
              {current[key].map((variant, index) => (
                <li key={index} className="flex items-center gap-2">
                  <input
                    type="radio"
                    aria-label="Верный вариант"
                    checked={variant.correct}
                    onChange={() =>
                      updateBlank(key, (variants) =>
                        variants.map((v, i) => ({ ...v, correct: i === index })),
                      )
                    }
                    className="size-4 shrink-0 accent-emerald-600"
                  />
                  <input
                    value={variant.text}
                    placeholder={variant.correct ? "Верная форма" : "Дистрактор"}
                    onChange={(event) =>
                      updateBlank(key, (variants) =>
                        variants.map((v, i) =>
                          i === index ? { ...v, text: event.target.value } : v,
                        ),
                      )
                    }
                    className={`${inputClass} ${variant.correct ? "border-emerald-500/60" : ""}`}
                  />
                  <button
                    type="button"
                    aria-label="Убрать вариант"
                    onClick={() =>
                      updateBlank(key, (variants) => variants.filter((_, i) => i !== index))
                    }
                    className="flex size-8 shrink-0 items-center justify-center rounded-full text-subtle hover:bg-red-500/10 hover:text-red-600"
                  >
                    <X size={16} />
                  </button>
                </li>
              ))}
            </ul>
            <button
              type="button"
              onClick={() =>
                updateBlank(key, (variants) => [...variants, { text: "", correct: false }])
              }
              className={`${buttonClass.link} mt-3`}
            >
              <Plus />
              Добавить вариант
            </button>
          </fieldset>
        ))}

        {problems.length > 0 && (
          <ul className="list-disc space-y-0.5 rounded-lg bg-amber-50 py-3 pr-4 pl-8 text-sm text-amber-800">
            {problems.map((problem) => (
              <li key={problem}>{problem}</li>
            ))}
          </ul>
        )}
      </Section>

      <Section title="Перевод предложения">
        <LocalizedFields name="translation" values={values.translation} />
      </Section>

      <Section title="Разбор после ответа">
        <LocalizedFields name="explanation" values={values.explanation} multiline />
      </Section>

      <Section title="Публикация">
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Статус" hint="Студенты видят только опубликованные">
            <select name="status" defaultValue={values.status} className={inputClass}>
              {sentenceStatuses.map((status) => (
                <option key={status} value={status}>
                  {sentenceStatusLabels[status]}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Уровень" hint="1 — однозначный контекст, 3 — спорный">
            <select name="level" defaultValue={values.level} className={inputClass}>
              <option value={1}>1</option>
              <option value={2}>2</option>
              <option value={3}>3</option>
            </select>
          </Field>
        </div>
        <Field label="Заметка редактора" hint="Студенту не видна">
          <textarea name="note" defaultValue={values.note} rows={2} className={textareaClass} />
        </Field>
      </Section>

      <FormFooter state={state} pending={pending}>
        {id ? "Сохранить" : "Создать предложение"}
      </FormFooter>
    </form>
  );
}
