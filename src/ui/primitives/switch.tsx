"use client";

import * as m from "motion/react-m";

import { cn } from "../cn";
import { spring } from "../motion/presets";

export type SwitchProps = {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label: string;
  /** Подпись видна рядом; иначе используется только как aria-label. */
  showLabel?: boolean;
  disabled?: boolean;
  className?: string;
};

export function Switch({ checked, onChange, label, showLabel, disabled, className }: SwitchProps) {
  return (
    <label className={cn("inline-flex cursor-pointer items-center gap-3", disabled && "cursor-not-allowed opacity-50", className)}>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        aria-label={showLabel ? undefined : label}
        disabled={disabled}
        onClick={() => onChange(!checked)}
        className={cn(
          "focus-ring relative h-8 w-[52px] shrink-0 rounded-full p-1 transition-colors duration-300",
          checked ? "bg-grad-ink shadow-glow-ink" : "bg-mist-200 inset-shadow-sunken",
        )}
      >
        <m.span
          className="block size-6 rounded-full bg-white shadow-md"
          animate={{ x: checked ? 20 : 0 }}
          whileTap={{ scaleX: 1.2 }}
          transition={spring.snappy}
        />
      </button>
      {showLabel && <span className="t-body-sm text-fg">{label}</span>}
    </label>
  );
}
