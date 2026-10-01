"use client";

import { ArrowDown, ArrowUp, Eye, Plus, X } from "lucide-react";
import { useState } from "react";

import { FormFooter, inputClass, LocalizedFields, Section, useAdminForm } from "./form-fields";
import { buttonClass } from "./ui";

import { saveTrainer } from "@/lib/admin-actions";
import { locales, localeNames, type Locale } from "@/lib/locales";
import { stepIcon, stepIcons } from "@/lib/trainer-icons";

type Texts = Partial<Record<Locale, string>>;

export type TrainerStepValue = { icon: string; name: Texts; description: Texts };

export type TrainerFormValues = {
  name: Texts;
  description: Texts;
  hint: Texts;
  steps: TrainerStepValue[];
};

/** Шаг со стабильным ключом: React не перепутает поля при удалении и перестановке. */
type StepState = TrainerStepValue & { uid: number };

let nextUid = 0;

/** Подпись «где это видно студенту» над секцией формы. */
function Where({ children }: { children: React.ReactNode }) {
  return (
    <span className="flex items-start gap-1.5">
      <Eye className="mt-0.5 size-3.5 shrink-0" />
      <span>{children}</span>
    </span>
  );
}

export function TrainerForm({
  id,
  values,
  hintPlace,
}: {
  id: string;
  values: TrainerFormValues;
  hintPlace: string;
}) {
  const { state, pending, onSubmit } = useAdminForm(saveTrainer.bind(null, id));
  const [steps, setSteps] = useState<StepState[]>(() =>
    values.steps.map((step) => ({ ...step, uid: nextUid++ })),
  );

  function update(uid: number, patch: (step: StepState) => StepState) {
    setSteps((prev) => prev.map((step) => (step.uid === uid ? patch(step) : step)));
  }

  function move(index: number, delta: number) {
    setSteps((prev) => {
      const next = [...prev];
      const [step] = next.splice(index, 1);
      next.splice(index + delta, 0, step);
      return next;
    });
  }

  const serialized = JSON.stringify(
    steps.map(({ icon, name, description }) => ({ icon, name, description })),
  );

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-6">
      <Section
        title="Название"
        description={
          <Where>
            Список тренажёров в приложении и заголовок экрана тренировки
          </Where>
        }
      >
        <LocalizedFields name="name" values={values.name} required={["en"]} />
      </Section>

      <Section
        title="Описание"
        description={<Where>Строка под названием в списке тренажёров</Where>}
      >
        <LocalizedFields name="description" values={values.description} multiline />
      </Section>

      <Section title="Подсказка" description={<Where>На экране тренировки — {hintPlace}</Where>}>
        <LocalizedFields name="hint" values={values.hint} required={["en"]} />
      </Section>

      <Section
        title="Инструкция «Как работает тренажёр»"
        description={
          <Where>
            Блок под тренировкой. Порядок и иконки общие для всех языков; пустой перевод
            заменится английским.
          </Where>
        }
      >
        <input type="hidden" name="steps" value={serialized} />
        {steps.map((step, index) => {
          const Icon = stepIcon(step.icon);
          return (
            <div key={step.uid} className="rounded-lg bg-slate-50 p-4 ring-1 ring-line">
              <div className="mb-3 flex flex-wrap items-center gap-2">
                <span className="flex size-8 items-center justify-center rounded-lg bg-blue-100 text-blue-600">
                  <Icon className="size-4" />
                </span>
                <span className="font-semibold">Шаг {index + 1}</span>
                <select
                  aria-label="Иконка"
                  value={step.icon}
                  onChange={(event) => update(step.uid, (s) => ({ ...s, icon: event.target.value }))}
                  className={`${inputClass} w-40`}
                >
                  {/* Иконка из старых данных, которой нет в списке, остаётся выбранной. */}
                  {!Object.hasOwn(stepIcons, step.icon) && <option value={step.icon}>{step.icon} (нет)</option>}
                  {Object.keys(stepIcons).map((name) => (
                    <option key={name} value={name}>
                      {name}
                    </option>
                  ))}
                </select>
                <span className="ml-auto flex gap-1">
                  <IconButton label="Выше" disabled={index === 0} onClick={() => move(index, -1)}>
                    <ArrowUp />
                  </IconButton>
                  <IconButton
                    label="Ниже"
                    disabled={index === steps.length - 1}
                    onClick={() => move(index, 1)}
                  >
                    <ArrowDown />
                  </IconButton>
                  <IconButton
                    label="Убрать шаг"
                    onClick={() => setSteps((prev) => prev.filter((s) => s.uid !== step.uid))}
                  >
                    <X />
                  </IconButton>
                </span>
              </div>

              <div className="flex flex-col gap-2">
                {locales.map((locale) => (
                  <div key={locale} className="grid gap-2 sm:grid-cols-[2.5rem_1fr_2fr]">
                    <span className="flex h-8 items-center font-mono text-xs font-medium text-subtle">
                      {localeNames[locale]}
                      {locale === "en" && <span className="text-red-500">*</span>}
                    </span>
                    <input
                      aria-label={`Название шага, ${localeNames[locale]}`}
                      placeholder="Название"
                      value={step.name[locale] ?? ""}
                      onChange={(event) =>
                        update(step.uid, (s) => ({
                          ...s,
                          name: { ...s.name, [locale]: event.target.value },
                        }))
                      }
                      className={inputClass}
                    />
                    <input
                      aria-label={`Описание шага, ${localeNames[locale]}`}
                      placeholder="Описание"
                      value={step.description[locale] ?? ""}
                      onChange={(event) =>
                        update(step.uid, (s) => ({
                          ...s,
                          description: { ...s.description, [locale]: event.target.value },
                        }))
                      }
                      className={inputClass}
                    />
                  </div>
                ))}
              </div>
            </div>
          );
        })}
        <button
          type="button"
          onClick={() =>
            setSteps((prev) => [
              ...prev,
              { uid: nextUid++, icon: Object.keys(stepIcons)[0], name: {}, description: {} },
            ])
          }
          className={`${buttonClass.link} w-fit`}
        >
          <Plus />
          Добавить шаг
        </button>
      </Section>

      <FormFooter state={state} pending={pending}>
        Сохранить тренажёр
      </FormFooter>
    </form>
  );
}

function IconButton({
  label,
  disabled,
  onClick,
  children,
}: {
  label: string;
  disabled?: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      disabled={disabled}
      onClick={onClick}
      className="flex size-8 items-center justify-center rounded-full text-subtle hover:bg-white hover:text-foreground disabled:opacity-30 [&_svg]:size-4"
    >
      {children}
    </button>
  );
}
