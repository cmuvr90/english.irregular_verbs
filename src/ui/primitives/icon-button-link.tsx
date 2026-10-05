"use client";

import Link from "next/link";
import * as m from "motion/react-m";

import type { Icon } from "../icons";
import { spring } from "../motion/presets";
import { type IconButtonVariant, iconButtonClass, iconSizes } from "./icon-button";

const MLink = m.create(Link);

export type IconButtonLinkProps = {
  href: string;
  icon: Icon;
  /** Обязательная подпись: у ссылки нет текста, скринридеру нужно имя. */
  label: string;
  variant?: IconButtonVariant;
  size?: keyof typeof iconSizes;
  className?: string;
};

/** Круглая кнопка-иконка, ведущая на другую страницу (админка, настройки). */
export function IconButtonLink({ href, icon: Glyph, label, variant = "paper", size = "md", className }: IconButtonLinkProps) {
  return (
    <MLink
      href={href}
      aria-label={label}
      title={label}
      whileHover={{ scale: 1.06 }}
      whileTap={{ scale: 0.9 }}
      transition={spring.snappy}
      className={iconButtonClass(variant, size, className)}
    >
      <Glyph size={iconSizes[size]} weight="regular" aria-hidden />
    </MLink>
  );
}
