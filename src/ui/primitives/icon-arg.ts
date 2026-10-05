import * as Icons from "../icons";

/**
 * Контрол Storybook «выбрать иконку из словаря»: в панели — список имён,
 * в компонент уходит сам компонент иконки.
 */
const mapping = Object.fromEntries(
  Object.entries(Icons).filter(([name]) => name.startsWith("Icon")),
) as Record<string, Icons.Icon>;

export const iconArg = {
  options: ["—", ...Object.keys(mapping)],
  mapping: { "—": undefined, ...mapping },
  control: { type: "select" as const },
};
