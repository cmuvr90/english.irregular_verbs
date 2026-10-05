import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import { Page, Section, Token } from "./doc-blocks";

const meta = {
  title: "Основа/Текст",
  parameters: { layout: "fullscreen" },
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

const textColors = [
  { token: "text-fg-strong", cls: "text-fg-strong", use: "Заголовки, цифры, ответы" },
  { token: "text-fg", cls: "text-fg", use: "Основной текст" },
  { token: "text-fg-muted", cls: "text-fg-muted", use: "Пояснения, подписи" },
  { token: "text-fg-faint", cls: "text-fg-faint", use: "Плейсхолдеры, неактивное" },
  { token: "text-fg-link", cls: "text-fg-link", use: "Ссылки и текстовые действия" },
];

const scale = [
  { token: "t-display", sample: "Irregular verbs", meta: "Unbounded 600 · 40/42", use: "Герои экранов, онбординг" },
  { token: "t-title", sample: "Привет, Женя!", meta: "Unbounded 600 · 26/30", use: "Заголовок экрана" },
  { token: "t-heading", sample: "Продолжить обучение", meta: "Unbounded 600 · 19/24", use: "Заголовок карточки, секции" },
  { token: "t-subheading", sample: "Карточки · 12 глаголов", meta: "Geist 600 · 17/23", use: "Названия в списках" },
  { token: "t-body", sample: "Запоминай три формы глагола каждый день по 10 минут.", meta: "Geist 400 · 15/23", use: "Основной текст" },
  { token: "t-body-sm", sample: "Осталось 8 глаголов до дневной цели.", meta: "Geist 400 · 14/21", use: "Вторичный текст" },
  { token: "t-label", sample: "Сменить цель", meta: "Geist 500 · 13/17", use: "Кнопки, чипы, поля" },
  { token: "t-caption", sample: "дней подряд", meta: "Geist 400 · 12/16", use: "Подписи к цифрам" },
  { token: "t-overline", sample: "Past participle", meta: "Geist 600 · 11 · +12% · CAPS", use: "Надзаголовки, метки форм" },
];

export const TextPalette: Story = {
  name: "Палитра текста",
  render: () => (
    <Page
      title="Текст"
      lead="Пять ступеней текста на холодной бумаге. Все ступени — один ультрамариновый оттенок разной светлоты, поэтому текст выглядит «написанным чернилами», а не серым."
    >
      <Section title="Цвета текста" note="fg-strong и fg проходят WCAG AA на canvas и surface; fg-muted — для текста от 14px; fg-faint — только для неинформативного.">
        <div className="grid gap-3 sm:grid-cols-5">
          {textColors.map((c) => (
            <div key={c.token} className="rounded-xl bg-surface p-4 shadow-sm">
              <p className={`t-title ${c.cls}`}>Aa</p>
              <p className="t-label mt-3 text-fg-strong">{c.use}</p>
              <Token>{c.token}</Token>
            </div>
          ))}
        </div>
      </Section>

      <Section title="Градиентный текст" note="Для акцентов: серия, награды, сами формы глагола. Не больше одного градиентного слова в поле зрения.">
        <div className="flex flex-wrap items-baseline gap-x-8 gap-y-3 rounded-2xl bg-surface p-6 shadow-sm">
          <span className="t-display text-grad-ink">ink</span>
          <span className="t-display text-grad-day">go · went · gone</span>
          <span className="t-display text-grad-flame">7 days</span>
          <span className="t-display text-grad-gold">+120 XP</span>
        </div>
        <div className="mt-2 flex gap-4">
          <Token>text-grad-ink</Token>
          <Token>text-grad-day</Token>
          <Token>text-grad-flame</Token>
          <Token>text-grad-gold</Token>
        </div>
      </Section>
    </Page>
  ),
};

export const TypeScale: Story = {
  name: "Шкала",
  render: () => (
    <Page
      title="Типографика"
      lead="Два голоса: Unbounded — широкий и уверенный, для заголовков, цифр и форм глагола; Geist — нейтральный и плотный, для всего остального. Утилиты t-* задают сразу кегль, интерлиньяж, трекинг и начертание."
    >
      <Section title="Шкала">
        <div className="divide-y divide-hairline rounded-2xl bg-surface shadow-sm">
          {scale.map((s) => (
            <div key={s.token} className="grid gap-2 p-5 sm:grid-cols-[180px_1fr] sm:items-baseline">
              <div>
                <Token>{s.token}</Token>
                <p className="t-caption mt-1 text-fg-faint">{s.meta}</p>
              </div>
              <div>
                <p className={`${s.token} text-fg-strong`}>{s.sample}</p>
                <p className="t-caption mt-1 text-fg-muted">{s.use}</p>
              </div>
            </div>
          ))}
        </div>
      </Section>

      <Section title="Цифры" note="t-stat — табличные цифры Unbounded: значения в счётчиках не прыгают при анимации.">
        <div className="flex flex-wrap gap-10 rounded-2xl bg-surface p-6 shadow-sm">
          {[
            ["152", "глагола", "text-v1-700"],
            ["7", "дней подряд", "text-v2-600"],
            ["23", "сессии", "text-v3-700"],
            ["B1", "уровень", "text-ink-700"],
          ].map(([v, l, c]) => (
            <div key={l}>
              <p className={`t-stat ${c}`}>{v}</p>
              <p className="t-caption mt-1.5 text-fg-muted">{l}</p>
            </div>
          ))}
        </div>
      </Section>

      <Section title="Формы глагола" note="t-verb + цвет формы. Так глагол выглядит везде: в карточках, тренажёрах и списках.">
        <div className="flex flex-wrap items-center gap-3 rounded-2xl bg-surface p-6 shadow-sm">
          <span className="t-verb text-3xl text-v1-700">begin</span>
          <span className="text-fg-faint">→</span>
          <span className="t-verb text-3xl text-v2-600">began</span>
          <span className="text-fg-faint">→</span>
          <span className="t-verb text-3xl text-v3-700">begun</span>
        </div>
      </Section>
    </Page>
  ),
};
