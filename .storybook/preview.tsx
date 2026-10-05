import type { Preview } from "@storybook/nextjs-vite";

import { fontVariables } from "../src/app/fonts";
import { MotionProvider } from "../src/ui/motion/provider";
import "../src/app/globals.css";

// В приложении переменные шрифтов next/font стоят на <html> (см. layout) —
// повторяем это, чтобы body и утилиты font-* видели те же шрифты.
document.documentElement.classList.add(...fontVariables.split(" "));

const preview: Preview = {
  parameters: {
    layout: "centered",
    controls: { expanded: true, sort: "requiredFirst" },
    backgrounds: {
      options: {
        canvas: { name: "Бумага", value: "oklch(98.4% 0.006 272)" },
        surface: { name: "Белый", value: "#ffffff" },
        ink: { name: "Чернила", value: "oklch(32.5% 0.136 266)" },
      },
    },
    options: {
      storySort: {
        order: ["Введение", "Основа", "Примитивы", "Композиты", "Экраны"],
      },
    },
    a11y: { test: "todo" },
  },
  initialGlobals: {
    backgrounds: { value: "canvas" },
  },
  decorators: [
    (Story) => (
      <div className="font-sans text-fg antialiased">
        <MotionProvider>
          <Story />
        </MotionProvider>
      </div>
    ),
  ],
};

export default preview;
