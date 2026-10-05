"use client";

import { useInView, useMotionValue, useSpring, useTransform } from "motion/react";
import * as m from "motion/react-m";
import { useEffect, useRef } from "react";

import { spring } from "../motion/presets";

export type AnimatedNumberProps = {
  value: number;
  /** С какого числа «докручивать» при первом появлении. */
  from?: number;
  locale?: string;
  prefix?: string;
  suffix?: string;
  className?: string;
};

/**
 * Число, которое докручивается до значения, когда попадает в экран.
 * Пишет напрямую в DOM через motion value — без ререндеров на каждый кадр.
 */
export function AnimatedNumber({ value, from = 0, locale = "ru", prefix = "", suffix = "", className }: AnimatedNumberProps) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: "-10% 0px" });
  const raw = useMotionValue(from);
  const smooth = useSpring(raw, spring.progress);
  const text = useTransform(smooth, (v) => `${prefix}${Math.round(v).toLocaleString(locale)}${suffix}`);

  useEffect(() => {
    if (inView) raw.set(value);
  }, [inView, raw, value]);

  return (
    <m.span ref={ref} className={className} style={{ fontVariantNumeric: "tabular-nums" }}>
      {text}
    </m.span>
  );
}
