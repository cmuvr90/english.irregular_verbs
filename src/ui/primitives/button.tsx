"use client";

import type { HTMLMotionProps } from "motion/react";
import * as m from "motion/react-m";

import type { Icon } from "../icons";
import { spring } from "../motion/presets";
import { type ButtonSize, type ButtonVariant, buttonClass, iconSizes, tactile } from "./button-styles";

export type { ButtonSize, ButtonVariant } from "./button-styles";

export type ButtonProps = Omit<HTMLMotionProps<"button">, "children"> & {
  variant?: ButtonVariant;
  size?: ButtonSize;
  /** Иконка слева от текста. */
  icon?: Icon;
  /** Иконка справа — обычно стрелка «дальше». */
  iconRight?: Icon;
  loading?: boolean;
  block?: boolean;
  children?: React.ReactNode;
};

export function Button({
  variant = "primary",
  size = "md",
  icon: IconLeft,
  iconRight: IconRight,
  loading,
  block,
  disabled,
  className,
  children,
  type = "button",
  ...rest
}: ButtonProps) {
  const iconSize = iconSizes[size];
  return (
    <m.button
      type={type}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      // У тактильных кнопок нажатие уже показано «проваливанием» — масштаб только у плоских.
      whileTap={tactile[variant] ? undefined : { scale: 0.96 }}
      transition={spring.snappy}
      className={buttonClass({ variant, size, block, className })}
      {...rest}
    >
      {loading ? (
        <Spinner size={iconSize} />
      ) : (
        IconLeft && <IconLeft size={iconSize} weight="bold" aria-hidden />
      )}
      {children}
      {IconRight && !loading && <IconRight size={iconSize - 2} weight="bold" aria-hidden />}
    </m.button>
  );
}

function Spinner({ size }: { size: number }) {
  return (
    <m.svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden
      animate={{ rotate: 360 }}
      transition={{ repeat: Infinity, duration: 0.8, ease: "linear" }}
    >
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeOpacity="0.25" strokeWidth="3" />
      <path d="M21 12a9 9 0 0 0-9-9" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
    </m.svg>
  );
}
