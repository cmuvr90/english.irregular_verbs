"use client";

import { LoaderCircle } from "lucide-react";
import { useActionState } from "react";

import { buttonClass, filterSelectClass } from "./ui";

import { setUserRole } from "@/lib/admin-actions";
import { initialActionState } from "@/lib/admin-form";
import { roles } from "@/lib/roles";

/**
 * Смена роли в строке таблицы. Клиентская ради ответа экшена: отказ
 * (последний админ, параллельная смена) иначе прошёл бы молча.
 */
export function RoleForm({ userId, role }: { userId: string; role: string }) {
  const [state, formAction, pending] = useActionState(
    setUserRole.bind(null, userId),
    initialActionState,
  );

  return (
    <form action={formAction} className="flex flex-col gap-1">
      <span className="flex items-center gap-1.5">
        <select name="role" defaultValue={role} aria-label="Роль" className={filterSelectClass}>
          {roles.map((value) => (
            <option key={value} value={value}>
              {value}
            </option>
          ))}
        </select>
        <button type="submit" disabled={pending} className={buttonClass.outline}>
          {pending && <LoaderCircle className="animate-spin" />}
          Сохранить
        </button>
      </span>
      {state.error && (
        <span role="alert" className="text-xs text-red-600">
          {state.error}
        </span>
      )}
    </form>
  );
}
