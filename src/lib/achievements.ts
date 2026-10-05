/**
 * Список наград. Живёт в коде, а не в БД: условия — это логика, а в
 * user_achievements хранится только факт получения. Ключ награды уходит в
 * БД и в словари — менять его нельзя, только добавлять новые.
 *
 * Модуль не обращается к БД — его импортирует и страница, чтобы нарисовать
 * ещё не полученные кубки.
 */

export type AchievementKind =
  /** Дней подряд с ответами. */
  | "streak"
  /** Верных ответов подряд без ошибки. */
  | "run"
  /** Выучено глаголов (хотя бы в одном тренажёре). */
  | "learned";

export type Achievement = {
  key: string;
  kind: AchievementKind;
  /** Порог; "all" — все глаголы справочника, сколько бы их ни было. */
  goal: number | "all";
};

const streak = (days: number): Achievement => ({ key: `streak-${days}`, kind: "streak", goal: days });
const run = (answers: number): Achievement => ({ key: `run-${answers}`, kind: "run", goal: answers });
const learned = (verbs: number | "all"): Achievement => ({
  key: `learned-${verbs}`,
  kind: "learned",
  goal: verbs,
});

/** Месяц серии — 30 дней: календарный месяц для «подряд» ничего не добавляет. */
const MONTH = 30;

export const ACHIEVEMENTS: Achievement[] = [
  streak(1),
  streak(3),
  streak(7),
  streak(MONTH),
  streak(2 * MONTH),
  streak(3 * MONTH),
  streak(100),
  streak(4 * MONTH),
  streak(5 * MONTH),
  streak(6 * MONTH),
  streak(200),
  streak(365),

  run(20),
  run(50),
  run(100),
  run(200),

  learned(5),
  learned(10),
  learned(20),
  learned(50),
  learned(100),
  learned(150),
  learned("all"),
];

export const ACHIEVEMENT_KINDS: AchievementKind[] = ["streak", "run", "learned"];

/** Показатели студента, по которым выдаются награды. */
export type AchievementMetrics = {
  /** Самая длинная серия дней за всю историю. */
  bestStreak: number;
  /** Лучшая серия верных ответов подряд. */
  bestRun: number;
  learned: number;
  totalVerbs: number;
};

/** Числовой порог награды: "all" разворачивается в размер справочника. */
export function goalOf(achievement: Achievement, totalVerbs: number) {
  return achievement.goal === "all" ? totalVerbs : achievement.goal;
}

export function isEarned(achievement: Achievement, metrics: AchievementMetrics) {
  const goal = goalOf(achievement, metrics.totalVerbs);
  // Пустой справочник — «выучить все» нечего, награду не даём.
  if (goal <= 0) return false;
  const value =
    achievement.kind === "streak"
      ? metrics.bestStreak
      : achievement.kind === "run"
        ? metrics.bestRun
        : metrics.learned;
  return value >= goal;
}
