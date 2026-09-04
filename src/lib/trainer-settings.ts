/**
 * Настройки тренажёра из поля Trainer.settings, уже сведённые к языку
 * интерфейса. Форма общая для всех тренажёров: подсказка на карточке плюс
 * шаги инструкции «Как работает тренажёр». Специфика конкретного тренажёра
 * живёт в его компоненте, а не здесь.
 */
export type TrainerSettings = {
  hint: string;
  /** icon — имя иконки lucide в kebab-case; неизвестное имя рисуется фолбэком. */
  steps: { position: number; icon: string; name: string; description: string }[];
};
