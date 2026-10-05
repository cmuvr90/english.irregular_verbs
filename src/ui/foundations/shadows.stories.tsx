import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import { Page, Section, Token } from "./doc-blocks";

const meta = {
  title: "Основа/Тени и формы",
  parameters: { layout: "fullscreen" },
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

const elevation = [
  { token: "shadow-xs", cls: "shadow-xs", use: "Чипы, мелкие плашки" },
  { token: "shadow-sm", cls: "shadow-sm", use: "Карточки в покое" },
  { token: "shadow-md", cls: "shadow-md", use: "Карточки при наведении" },
  { token: "shadow-lg", cls: "shadow-lg", use: "Выделенная карточка, поповер" },
  { token: "shadow-xl", cls: "shadow-xl", use: "Модальные листы" },
  { token: "shadow-float", cls: "shadow-float", use: "Плавающие панели: таб-бар, тосты" },
];

const press = [
  { token: "shadow-press-ink", cls: "shadow-press-ink bg-ink-600 text-white", label: "Продолжить" },
  { token: "shadow-press-leaf", cls: "shadow-press-leaf bg-leaf-600 text-white", label: "Проверить" },
  { token: "shadow-press-berry", cls: "shadow-press-berry bg-berry-600 text-white", label: "Сбросить" },
  { token: "shadow-press-paper", cls: "shadow-press-paper bg-surface text-fg-strong ring-1 ring-hairline-strong", label: "Пропустить" },
];

const glows = [
  { token: "shadow-glow-ink", cls: "shadow-glow-ink bg-grad-ink" },
  { token: "shadow-glow-v1", cls: "shadow-glow-v1 bg-grad-dawn" },
  { token: "shadow-glow-v2", cls: "shadow-glow-v2 bg-grad-sunset" },
  { token: "shadow-glow-v3", cls: "shadow-glow-v3 bg-grad-dusk" },
  { token: "shadow-glow-gold", cls: "shadow-glow-gold bg-grad-gold" },
];

const radii = [
  { token: "rounded-xs", cls: "rounded-xs", px: 8, use: "Мелкие метки" },
  { token: "rounded-sm", cls: "rounded-sm", px: 12, use: "Чипы, поля в карточке" },
  { token: "rounded-md", cls: "rounded-md", px: 16, use: "Кнопки, поля" },
  { token: "rounded-lg", cls: "rounded-lg", px: 20, use: "Иконки-плашки" },
  { token: "rounded-xl", cls: "rounded-xl", px: 24, use: "Карточки" },
  { token: "rounded-2xl", cls: "rounded-2xl", px: 28, use: "Герои, крупные карточки" },
  { token: "rounded-3xl", cls: "rounded-3xl", px: 32, use: "Листы снизу" },
  { token: "rounded-full", cls: "rounded-full", px: 999, use: "Пилюли, аватары" },
];

export const Elevation: Story = {
  name: "Тени",
  render: () => (
    <Page
      title="Тени"
      lead="Тени многослойные и подкрашены ультрамарином: короткая контактная тень даёт чёткость, длинная мягкая — воздух. Серых теней в системе нет."
    >
      <Section title="Высота">
        <div className="grid grid-cols-2 gap-6 sm:grid-cols-3">
          {elevation.map((e) => (
            <div key={e.token} className={`rounded-xl bg-surface p-5 ${e.cls}`}>
              <Token>{e.token}</Token>
              <p className="t-label mt-8 text-fg-strong">{e.use}</p>
            </div>
          ))}
        </div>
      </Section>

      <Section title="Тактильные кнопки" note="Плотный бортик снизу — кнопку хочется нажать. При нажатии она опускается на 4px, бортик исчезает (см. Примитивы/Button).">
        <div className="flex flex-wrap gap-5">
          {press.map((p) => (
            <div key={p.token} className="flex flex-col items-start gap-3">
              <span className={`t-label rounded-md px-6 py-3.5 font-semibold ${p.cls}`}>{p.label}</span>
              <Token>{p.token}</Token>
            </div>
          ))}
        </div>
      </Section>

      <Section title="Свечения" note="Только для «живых» состояний: активная форма, награда, серия. Одно свечение на экран.">
        <div className="flex flex-wrap gap-8">
          {glows.map((g) => (
            <div key={g.token} className="flex flex-col items-center gap-3">
              <div className={`size-20 rounded-2xl ${g.cls}`} />
              <Token>{g.token}</Token>
            </div>
          ))}
        </div>
      </Section>

      <Section title="Внутренние тени">
        <div className="flex flex-wrap gap-6">
          <div className="flex flex-col gap-3">
            <div className="h-16 w-56 rounded-md bg-surface-sunken inset-shadow-sunken" />
            <Token>inset-shadow-sunken — треки, слоты для слов</Token>
          </div>
          <div className="flex flex-col gap-3">
            <div className="h-16 w-56 rounded-md bg-grad-ink inset-shadow-highlight" />
            <Token>inset-shadow-highlight — блик на цветном</Token>
          </div>
        </div>
      </Section>
    </Page>
  ),
};

export const Radii: Story = {
  name: "Радиусы",
  render: () => (
    <Page
      title="Формы"
      lead="Мягкие, щедрые скругления — приложение для ежедневной привычки должно ощущаться дружелюбно. Правило вложенности: внутренний радиус = внешний − отступ."
    >
      <Section title="Радиусы">
        <div className="grid grid-cols-2 gap-5 sm:grid-cols-4">
          {radii.map((r) => (
            <div key={r.token}>
              <div className={`h-24 bg-grad-paper shadow-sm ring-1 ring-hairline ${r.cls}`} />
              <p className="t-label mt-2 text-fg-strong">
                {r.token} <span className="text-fg-faint">· {r.px === 999 ? "∞" : `${r.px}px`}</span>
              </p>
              <p className="t-caption text-fg-muted">{r.use}</p>
            </div>
          ))}
        </div>
      </Section>
    </Page>
  ),
};
