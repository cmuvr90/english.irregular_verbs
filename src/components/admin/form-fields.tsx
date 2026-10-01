"use client";

import { Check, LoaderCircle, Trash2 } from "lucide-react";
import { startTransition, useActionState } from "react";
import { useFormStatus } from "react-dom";

import { buttonClass, Card, inputClass, textareaClass } from "./ui";

import { initialActionState, localizedFieldName, type ActionState } from "@/lib/admin-form";
import { locales, localeNames, type Locale } from "@/lib/locales";

/** Кирпичики форм админки: подписи, переводы по локалям, кнопки. */

export { inputClass, textareaClass };

/**
 * useActionState для форм админки. Экшен зовём из onSubmit, а не через
 * <form action>: React 19 после action-отправки сбрасывает неконтролируемые
 * поля, и при ошибке валидации всё набранное пропадало бы.
 */
export function useAdminForm(
  action: (prev: ActionState, formData: FormData) => Promise<ActionState>,
) {
  const [state, dispatch, pending] = useActionState(action, initialActionState);

  function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    startTransition(() => dispatch(formData));
  }

  return { state, pending, onSubmit };
}

export function Field({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <label className="flex flex-col gap-2">
      <span className="text-sm leading-none font-medium">{label}</span>
      {children}
      {hint && <span className="text-xs text-subtle">{hint}</span>}
    </label>
  );
}

/** Секция формы — карточка с заголовком. */
export function Section({
  title,
  description,
  children,
}: {
  title: string;
  description?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <Card title={title} description={description}>
      <div className="flex flex-col gap-4">{children}</div>
    </Card>
  );
}

/**
 * Поля перевода на все языки приложения. Имена полей — field.<locale>,
 * на сервере их собирает readLocalized().
 */
export function LocalizedFields({
  name,
  values,
  multiline = false,
  required = [],
}: {
  name: string;
  values: Partial<Record<Locale, string>>;
  multiline?: boolean;
  required?: Locale[];
}) {
  return (
    <div className="flex flex-col gap-2">
      {locales.map((locale) => {
        const fieldName = localizedFieldName(name, locale);
        const isRequired = required.includes(locale);
        return (
          <div key={locale} className="flex items-start gap-3">
            <label
              htmlFor={fieldName}
              className="flex h-8 w-10 shrink-0 items-center font-mono text-xs font-medium text-subtle"
            >
              {localeNames[locale]}
              {isRequired && <span className="text-red-500">*</span>}
            </label>
            {multiline ? (
              <textarea
                id={fieldName}
                name={fieldName}
                defaultValue={values[locale] ?? ""}
                required={isRequired}
                rows={2}
                className={textareaClass}
              />
            ) : (
              <input
                id={fieldName}
                name={fieldName}
                defaultValue={values[locale] ?? ""}
                required={isRequired}
                className={inputClass}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}

/** Нижняя панель формы: ошибка и кнопка сохранения. */
export function FormFooter({
  state,
  pending,
  children,
}: {
  state: ActionState;
  pending: boolean;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-3">
      <FormError state={state} />
      <div className="flex items-center gap-3">
        <button type="submit" disabled={pending} className={buttonClass.primary}>
          {pending && <LoaderCircle className="animate-spin" />}
          {children}
        </button>
        {state.saved && !pending && (
          <span role="status" className="flex items-center gap-1 text-sm text-emerald-600">
            <Check className="size-4" />
            Сохранено
          </span>
        )}
      </div>
    </div>
  );
}

/** Ошибка экшена и список проблем валидатора. */
function FormError({ state }: { state: ActionState }) {
  if (!state.error) return null;
  return (
    <div
      role="alert"
      className="rounded-xl bg-red-500/10 px-4 py-3 text-sm text-red-600 ring-1 ring-red-500/20"
    >
      <p className="font-semibold">{state.error}</p>
      {state.problems && state.problems.length > 0 && (
        <ul className="mt-1.5 list-disc space-y-0.5 pl-5">
          {state.problems.map((problem) => (
            <li key={problem}>{problem}</li>
          ))}
        </ul>
      )}
    </div>
  );
}

/**
 * Кнопка удаления: отдельная форма со своим экшеном. Подтверждение через
 * confirm() — удаление необратимо, а каскад может унести прогресс студентов.
 */
export function DeleteButton({
  action,
  confirmText,
}: {
  action: () => Promise<void>;
  confirmText: string;
}) {
  return (
    <form
      action={action}
      onSubmit={(event) => {
        if (!window.confirm(confirmText)) event.preventDefault();
      }}
    >
      <DeleteSubmit />
    </form>
  );
}

function DeleteSubmit() {
  const { pending } = useFormStatus();
  return (
    <button type="submit" disabled={pending} className={buttonClass.destructive}>
      {pending ? <LoaderCircle className="animate-spin" /> : <Trash2 />}
      Удалить
    </button>
  );
}
