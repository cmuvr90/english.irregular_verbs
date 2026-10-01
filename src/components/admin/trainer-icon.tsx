import { createElement } from "react";

import { trainerIcon } from "@/lib/trainer-icons";

/**
 * Иконка тренажёра — та же, что в списке тренажёров приложения.
 * createElement вместо <Icon />: trainerIcon() отдаёт готовый компонент
 * из модуля, а JSX с переменной линтер принимает за компонент, созданный в рендере.
 */
export function TrainerIcon({ trainerKey, className }: { trainerKey: string; className?: string }) {
  return createElement(trainerIcon(trainerKey), { className });
}
