"use client";

import {
  Field,
  FormFooter,
  inputClass,
  LocalizedFields,
  Section,
  useAdminForm,
} from "./form-fields";

import { saveGroup } from "@/lib/admin-actions";
import type { Locale } from "@/lib/locales";

export type GroupFormValues = {
  key: string;
  name: Partial<Record<Locale, string>>;
  description: Partial<Record<Locale, string>>;
};

export function GroupForm({ id, values }: { id: string | null; values: GroupFormValues }) {
  const { state, pending, onSubmit } = useAdminForm(saveGroup.bind(null, id));

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-6">
      <Section title="Ключ">
        <Field
          label="Машинный ключ"
          hint="Попадает в адрес /verbs/<ключ> и в ссылки на тренажёр — после публикации лучше не менять"
        >
          <input
            name="key"
            defaultValue={values.key}
            required
            pattern="[a-z0-9]+(-[a-z0-9]+)*"
            className={`${inputClass} font-mono`}
          />
        </Field>
      </Section>

      <Section title="Название">
        <LocalizedFields name="name" values={values.name} required={["en"]} />
      </Section>

      <Section title="Описание">
        <LocalizedFields name="description" values={values.description} multiline />
      </Section>

      <FormFooter state={state} pending={pending}>
        {id ? "Сохранить" : "Создать группу"}
      </FormFooter>
    </form>
  );
}
