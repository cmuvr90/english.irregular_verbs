import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";
import storybook from "eslint-plugin-storybook";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  ...storybook.configs["flat/recommended"],
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
    // Сгенерированный клиент Prisma — не наш код, линтовать нечего.
    "generated/**",
    // Данные постгреса из docker compose: каталог принадлежит root,
    // и обход всего проекта падает на нём с EACCES.
    ".data/**",
    "storybook-static/**",
  ]),
]);

export default eslintConfig;
