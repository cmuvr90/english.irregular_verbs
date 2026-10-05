"use client";

import { LazyMotion, MotionConfig } from "motion/react";

const loadFeatures = () => import("./features").then((mod) => mod.default);

/**
 * Корневая обёртка анимаций. LazyMotion в strict-режиме разрешает только
 * облегчённый `m.*` (motion/react-m) — случайный полный `motion.div`
 * упадёт с ошибкой, а не раздует бандл. reducedMotion="user" гасит
 * перемещения у тех, кто включил «уменьшить движение» в системе.
 */
export function MotionProvider({ children }: { children: React.ReactNode }) {
  return (
    <LazyMotion features={loadFeatures} strict>
      <MotionConfig reducedMotion="user">{children}</MotionConfig>
    </LazyMotion>
  );
}
