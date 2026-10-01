"use client";

import {
  Field,
  FormFooter,
  inputClass,
  LocalizedFields,
  Section,
  useAdminForm,
} from "./form-fields";

import { saveVerb } from "@/lib/admin-actions";
import type { Locale } from "@/lib/locales";

export type VerbFormValues = {
  form1: string;
  form2: string;
  form3: string;
  translation: Partial<Record<Locale, string>>;
  groupIds: string[];
};

export function VerbForm({
  id,
  values,
  groups,
}: {
  /** null — создание нового глагола. */
  id: string | null;
  values: VerbFormValues;
  groups: { id: string; key: string; name: string }[];
}) {
  const { state, pending, onSubmit } = useAdminForm(saveVerb.bind(null, id));

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-6">
      <Section title="Формы">
        <div className="grid gap-4 sm:grid-cols-3">
          <Field label="Infinitive (V1)">
            <input name="form1" defaultValue={values.form1} required className={inputClass} />
          </Field>
          <Field label="Past Simple (V2)" hint="Несколько вариантов — через слеш: was/were">
            <input name="form2" defaultValue={values.form2} required className={inputClass} />
          </Field>
          <Field label="Past Participle (V3)">
            <input name="form3" defaultValue={values.form3} required className={inputClass} />
          </Field>
        </div>
      </Section>

      <Section title="Перевод">
        <LocalizedFields name="translation" values={values.translation} required={["en"]} />
      </Section>

      <Section title="Группы">
        {groups.length === 0 ? (
          <p className="text-sm text-subtle">Групп пока нет.</p>
        ) : (
          <div className="grid gap-2 sm:grid-cols-2">
            {groups.map((group) => (
              <label
                key={group.id}
                className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm ring-1 ring-line transition-colors hover:bg-slate-50 has-checked:bg-blue-50 has-checked:ring-blue-500/50"
              >
                <input
                  type="checkbox"
                  name="groups"
                  value={group.id}
                  defaultChecked={values.groupIds.includes(group.id)}
                  className="size-4 accent-blue-600"
                />
                <span className="min-w-0">
                  <span className="block truncate">{group.name}</span>
                  <span className="block truncate font-mono text-xs text-subtle">{group.key}</span>
                </span>
              </label>
            ))}
          </div>
        )}
      </Section>

      <FormFooter state={state} pending={pending}>
        {id ? "Сохранить" : "Создать глагол"}
      </FormFooter>
    </form>
  );
}
