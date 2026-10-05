import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import { Page, Section, Token } from "./doc-blocks";

const meta = {
  title: "Основа/Эффекты",
  parameters: { layout: "fullscreen" },
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

const gradients = [
  { token: "bg-grad-ink", cls: "bg-grad-ink", use: "Главное действие дня" },
  { token: "bg-grad-dawn", cls: "bg-grad-dawn", use: "V1 · рассвет" },
  { token: "bg-grad-sunset", cls: "bg-grad-sunset", use: "V2 · закат" },
  { token: "bg-grad-dusk", cls: "bg-grad-dusk", use: "V3 · сумерки" },
  { token: "bg-grad-day", cls: "bg-grad-day", use: "Все три формы сразу" },
  { token: "bg-grad-flame", cls: "bg-grad-flame", use: "Серия дней" },
  { token: "bg-grad-gold", cls: "bg-grad-gold", use: "Награды, XP" },
  { token: "bg-grad-leaf", cls: "bg-grad-leaf", use: "Цель выполнена" },
];

export const Gradients: Story = {
  name: "Градиенты",
  render: () => (
    <Page
      title="Эффекты"
      lead="Градиенты — главный художественный инструмент системы: каждый из них — кусочек неба в своё время суток. Поверх градиентов почти всегда лежит плёночное зерно, оно убирает «цифровую» гладкость."
    >
      <Section title="Градиенты" note="Утилиты bg-grad-* и text-grad-* генерируются из токенов --gradient-*.">
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          {gradients.map((g) => (
            <div key={g.token}>
              <div className={`grain h-28 rounded-xl ${g.cls}`} />
              <p className="t-label mt-2 text-fg-strong">{g.use}</p>
              <Token>{g.token}</Token>
            </div>
          ))}
        </div>
      </Section>

      <Section title="Зерно" note="grain — шум через ::after в режиме overlay. Сила — переменная --grain-opacity.">
        <div className="grid grid-cols-2 gap-4">
          <div className="flex h-36 items-end rounded-xl bg-grad-ink p-4 text-white">
            <span className="t-label">без зерна</span>
          </div>
          <div className="grain flex h-36 items-end rounded-xl bg-grad-ink p-4 text-white [--grain-opacity:0.4]">
            <span className="t-label">grain</span>
          </div>
        </div>
      </Section>
    </Page>
  ),
};

export const Surfaces: Story = {
  name: "Стекло, обводки, фоны",
  render: () => (
    <Page
      title="Материалы"
      lead="Стекло — для того, что плавает над контентом. Градиентная обводка — для выбранного и особенного. Тетрадь и точки — фоновые фактуры, напоминающие, что это учёба."
    >
      <Section title="Стекло" note="glass — светлое матовое стекло поверх контента; glass-tint — прозрачное стекло поверх цветных градиентов.">
        <div className="bg-aurora animate-aurora relative overflow-hidden rounded-2xl p-8">
          <div className="pointer-events-none absolute -top-8 left-10 size-40 rounded-full bg-grad-sunset opacity-80 blur-2xl" />
          <div className="pointer-events-none absolute right-10 -bottom-10 size-44 rounded-full bg-grad-dusk opacity-70 blur-2xl" />
          <div className="relative grid gap-5 sm:grid-cols-2">
            <div className="glass rounded-xl p-5 shadow-float">
              <p className="t-subheading text-fg-strong">glass</p>
              <p className="t-body-sm mt-1 text-fg-muted">Таб-бар, шапка, тосты, листы снизу.</p>
            </div>
            <div className="grain overflow-hidden rounded-xl bg-grad-ink p-5">
              <div className="glass-tint rounded-lg p-4 text-white">
                <p className="t-subheading">glass-tint</p>
                <p className="t-body-sm mt-1 opacity-80">Плашки внутри цветных карточек.</p>
              </div>
            </div>
          </div>
        </div>
        <div className="mt-2 flex gap-4">
          <Token>glass</Token>
          <Token>glass-tint</Token>
          <Token>bg-aurora animate-aurora</Token>
        </div>
      </Section>

      <Section title="Градиентная обводка" note="border-grad — обводка по контуру с любым радиусом, цвет — через --border-gradient.">
        <div className="flex flex-wrap gap-5">
          <div className="border-grad rounded-xl bg-surface px-6 py-5 shadow-sm">
            <p className="t-subheading text-fg-strong">«День» по умолчанию</p>
            <Token>border-grad</Token>
          </div>
          <div className="border-grad rounded-xl bg-surface px-6 py-5 shadow-sm [--border-gradient:var(--gradient-gold)] [--border-grad-width:2px]">
            <p className="t-subheading text-fg-strong">Золото, 2px</p>
            <Token>[--border-gradient:var(--gradient-gold)]</Token>
          </div>
        </div>
      </Section>

      <Section title="Фактуры">
        <div className="grid gap-5 sm:grid-cols-2">
          <div>
            {/* Высота строки = шаг линовки (1.75rem), текст начинается от верхнего края — строки ложатся на линии. */}
            <div className="bg-notebook rounded-xl pt-0 pr-5 pb-7 pl-12 text-[15px] leading-7 text-fg shadow-sm">
              <p>
                Yesterday I <span className="t-verb text-v2-600">went</span> to the park.
              </p>
              <p>
                I have never <span className="t-verb text-v3-700">seen</span> such a sunset.
              </p>
            </div>
            <Token>bg-notebook</Token>
          </div>
          <div className="bg-dots flex flex-col justify-end rounded-xl bg-surface p-5 shadow-sm">
            <p className="t-body-sm text-fg-muted">Пустые состояния и витрины</p>
            <Token>bg-dots</Token>
          </div>
        </div>
      </Section>

      <Section title="Блик и скелетон" note="shimmer — бегущая полоса света: загрузка, «новое», заполненный прогресс.">
        <div className="flex flex-col gap-3 rounded-xl bg-surface p-5 shadow-sm">
          <div className="shimmer h-4 w-2/3 rounded-full bg-surface-sunken" />
          <div className="shimmer h-4 w-1/2 rounded-full bg-surface-sunken" />
          <div className="shimmer h-10 w-40 rounded-md bg-grad-ink" />
        </div>
      </Section>
    </Page>
  ),
};
