import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import * as Icons from "../icons";
import type { Icon, IconWeight } from "../icons";
import { Page, Section, Token } from "./doc-blocks";

const meta = {
  title: "Основа/Иконки",
  parameters: { layout: "fullscreen" },
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

const entries = Object.entries(Icons).filter(([name]) => name.startsWith("Icon")) as Array<[string, Icon]>;
const weights: IconWeight[] = ["thin", "light", "regular", "bold", "fill", "duotone"];

export const Vocabulary: Story = {
  name: "Словарь",
  render: () => (
    <Page
      title="Иконки"
      lead="Phosphor Icons: шесть начертаний одного рисунка. Иконки импортируются только из ui/icons.ts под смысловыми именами (IconStreak, а не Flame) — так словарь приложения един."
    >
      <Section title="Начертания" note="regular — служебные; duotone — смысловые в цветных плашках; fill — активное состояние.">
        <div className="grid grid-cols-3 gap-3 sm:grid-cols-6">
          {weights.map((w) => (
            <div key={w} className="flex flex-col items-center gap-2 rounded-xl bg-surface p-5 shadow-sm">
              <Icons.IconStreak size={36} weight={w} className="text-v2-500" />
              <Token>{w}</Token>
            </div>
          ))}
        </div>
      </Section>

      <Section title={`Словарь · ${entries.length}`}>
        <div className="grid grid-cols-3 gap-2 sm:grid-cols-6 lg:grid-cols-8">
          {entries.map(([name, Glyph]) => (
            <div key={name} className="flex flex-col items-center gap-2 rounded-lg bg-surface px-2 py-4 shadow-xs">
              <Glyph size={26} weight="duotone" className="text-ink-600" />
              <span className="truncate font-mono text-[10px] text-fg-muted">{name.slice(4)}</span>
            </div>
          ))}
        </div>
      </Section>
    </Page>
  ),
};
