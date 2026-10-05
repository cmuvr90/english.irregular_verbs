import type { Transition, Variants } from "motion/react";

/**
 * Пружины и варианты анимаций — единый «характер движения» приложения.
 * Компоненты не придумывают свои кривые, а берут отсюда.
 */
export const spring = {
  /** Нажатия, переключатели — быстрый отклик без раскачки. */
  snappy: { type: "spring", stiffness: 520, damping: 34, mass: 0.7 },
  /** Появление карточек, раскрытие панелей. */
  gentle: { type: "spring", stiffness: 260, damping: 28 },
  /** Награды, верный ответ — с заметным «отскоком». */
  bouncy: { type: "spring", stiffness: 420, damping: 14, mass: 0.8 },
  /** Прогресс-бары и кольца: плавно доезжают до значения. */
  progress: { type: "spring", stiffness: 90, damping: 20 },
} satisfies Record<string, Transition>;

/** Отклик на нажатие для любых кликабельных поверхностей. */
export const press = {
  whileHover: { y: -2 },
  whileTap: { scale: 0.97, y: 0 },
  transition: spring.snappy,
};

export const fadeUp: Variants = {
  hidden: { opacity: 0, y: 14, filter: "blur(4px)" },
  show: { opacity: 1, y: 0, filter: "blur(0px)", transition: spring.gentle },
};

export const pop: Variants = {
  hidden: { opacity: 0, scale: 0.6 },
  show: { opacity: 1, scale: 1, transition: spring.bouncy },
};

/** Контейнер, по очереди проявляющий детей с вариантами fadeUp/pop. */
export const stagger = (step = 0.06, delay = 0): Variants => ({
  hidden: {},
  show: { transition: { staggerChildren: step, delayChildren: delay } },
});

/** Тряска «неверно» — короткое затухающее покачивание. */
export const shake = {
  x: [0, -10, 9, -6, 4, -2, 0],
  transition: { duration: 0.45 },
};
