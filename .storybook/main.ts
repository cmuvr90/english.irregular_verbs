import tailwindcss from "@tailwindcss/vite";
import type { StorybookConfig } from "@storybook/nextjs-vite";

const config: StorybookConfig = {
  stories: ["../src/ui/**/*.mdx", "../src/ui/**/*.stories.@(ts|tsx)"],
  addons: ["@storybook/addon-docs", "@storybook/addon-a11y"],
  framework: {
    name: "@storybook/nextjs-vite",
    options: {},
  },
  // Картинки из public/ (иллюстрации, иконки) доступны историям по тем же путям, что и в приложении.
  staticDirs: ["../public"],
  // Через PostCSS Tailwind не видит новые файлы историй, пока не перезапустишь
  // Storybook. Нативный Vite-плагин следит за исходниками сам; PostCSS-конфиг
  // приложения при этом отключаем, иначе Tailwind отработает дважды.
  viteFinal: (vite) => ({
    ...vite,
    plugins: [...(vite.plugins ?? []), tailwindcss()],
    css: { ...vite.css, postcss: { plugins: [] } },
  }),
};

export default config;
