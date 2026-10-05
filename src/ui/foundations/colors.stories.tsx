import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import { Page, Section, Token } from "./doc-blocks";

const meta = {
  title: "Основа/Цвета",
  parameters: { layout: "fullscreen" },
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

const steps = [50, 100, 200, 300, 400, 500, 600, 700, 800, 900, 950] as const;

// Классы перечислены целиком: Tailwind ищет имена утилит в исходниках
// строками и не соберёт «bg-${name}-${step}».
const palettes = [
  {
    name: "ink",
    title: "Ink · чернила",
    role: "Бренд, основные действия, ссылки, фокус",
    classes: ["bg-ink-50", "bg-ink-100", "bg-ink-200", "bg-ink-300", "bg-ink-400", "bg-ink-500", "bg-ink-600", "bg-ink-700", "bg-ink-800", "bg-ink-900", "bg-ink-950"],
  },
  {
    name: "dawn",
    title: "Dawn · рассвет — V1",
    role: "Первая форма, настоящее время: свежий утренний голубой",
    classes: ["bg-dawn-50", "bg-dawn-100", "bg-dawn-200", "bg-dawn-300", "bg-dawn-400", "bg-dawn-500", "bg-dawn-600", "bg-dawn-700", "bg-dawn-800", "bg-dawn-900", "bg-dawn-950"],
  },
  {
    name: "coral",
    title: "Coral · закат — V2",
    role: "Вторая форма, Past Simple: тёплый вечерний коралл",
    classes: ["bg-coral-50", "bg-coral-100", "bg-coral-200", "bg-coral-300", "bg-coral-400", "bg-coral-500", "bg-coral-600", "bg-coral-700", "bg-coral-800", "bg-coral-900", "bg-coral-950"],
  },
  {
    name: "orchid",
    title: "Orchid · сумерки — V3",
    role: "Третья форма, Past Participle: глубокий сумеречный фиолетовый",
    classes: ["bg-orchid-50", "bg-orchid-100", "bg-orchid-200", "bg-orchid-300", "bg-orchid-400", "bg-orchid-500", "bg-orchid-600", "bg-orchid-700", "bg-orchid-800", "bg-orchid-900", "bg-orchid-950"],
  },
  {
    name: "leaf",
    title: "Leaf · лист — success",
    role: "Верный ответ, выученный глагол, выполненная цель",
    classes: ["bg-leaf-50", "bg-leaf-100", "bg-leaf-200", "bg-leaf-300", "bg-leaf-400", "bg-leaf-500", "bg-leaf-600", "bg-leaf-700", "bg-leaf-800", "bg-leaf-900", "bg-leaf-950"],
  },
  {
    name: "berry",
    title: "Berry · ягода — danger",
    role: "Ошибка, неверный ответ, удаление",
    classes: ["bg-berry-50", "bg-berry-100", "bg-berry-200", "bg-berry-300", "bg-berry-400", "bg-berry-500", "bg-berry-600", "bg-berry-700", "bg-berry-800", "bg-berry-900", "bg-berry-950"],
  },
  {
    name: "gold",
    title: "Gold · золото — warning / награды",
    role: "Опыт (XP), достижения, серия, мягкие предупреждения",
    classes: ["bg-gold-50", "bg-gold-100", "bg-gold-200", "bg-gold-300", "bg-gold-400", "bg-gold-500", "bg-gold-600", "bg-gold-700", "bg-gold-800", "bg-gold-900", "bg-gold-950"],
  },
  {
    name: "mist",
    title: "Mist · туман — нейтральные",
    role: "Холодные серые с ультрамариновым подтоном",
    classes: ["bg-mist-50", "bg-mist-100", "bg-mist-200", "bg-mist-300", "bg-mist-400", "bg-mist-500", "bg-mist-600", "bg-mist-700", "bg-mist-800", "bg-mist-900", "bg-mist-950"],
  },
];

export const Palettes: Story = {
  name: "Палитры",
  render: () => (
    <Page
      title="Цвета"
      lead="Метафора — время суток. Три формы неправильного глагола окрашены в три неба: рассвет (V1), закат (V2), сумерки (V3). Бренд — ультрамариновые чернила. Все шкалы в OKLCH с одинаковой светлотой ступеней: 600-я ступень любой палитры держит контраст с белым текстом."
    >
      <Section title="Палитры" note="Белое «Aa» на ступени — допустимо для белого текста, тёмное — для тёмного.">
        <div className="flex flex-col gap-7">
          {palettes.map((p) => (
            <div key={p.name}>
              <div className="flex items-baseline justify-between gap-4">
                <h3 className="t-subheading text-fg-strong">{p.title}</h3>
                <span className="t-caption hidden text-fg-muted sm:block">{p.role}</span>
              </div>
              <div className="mt-3 grid grid-cols-11 gap-1.5">
                {p.classes.map((cls, i) => (
                  <div key={cls} className="flex flex-col gap-1.5">
                    <div
                      className={`flex h-14 items-end justify-start rounded-sm p-1.5 text-[11px] font-semibold shadow-xs ${cls} ${
                        steps[i] >= 600 ? "text-white" : "text-fg-strong"
                      }`}
                    >
                      Aa
                    </div>
                    <Token>{steps[i]}</Token>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </Section>
    </Page>
  ),
};

const semantic = [
  { alias: "brand", palette: "ink", soft: "bg-brand-100 text-brand-700", solid: "bg-brand-600 text-white" },
  { alias: "v1", palette: "dawn", soft: "bg-v1-100 text-v1-800", solid: "bg-v1-600 text-white" },
  { alias: "v2", palette: "coral", soft: "bg-v2-100 text-v2-800", solid: "bg-v2-600 text-white" },
  { alias: "v3", palette: "orchid", soft: "bg-v3-100 text-v3-800", solid: "bg-v3-600 text-white" },
  { alias: "success", palette: "leaf", soft: "bg-success-100 text-success-800", solid: "bg-success-600 text-white" },
  { alias: "danger", palette: "berry", soft: "bg-danger-100 text-danger-800", solid: "bg-danger-600 text-white" },
  { alias: "warning", palette: "gold", soft: "bg-warning-100 text-warning-900", solid: "bg-warning-400 text-warning-950" },
];

const surfaces = [
  { token: "canvas", cls: "bg-canvas", note: "Фон экрана — холодная бумага" },
  { token: "surface", cls: "bg-surface", note: "Карточки, листы, поля" },
  { token: "surface-sunken", cls: "bg-surface-sunken", note: "Утопленные зоны: треки, слоты" },
  { token: "hairline", cls: "bg-hairline", note: "Тонкие разделители и обводки" },
  { token: "hairline-strong", cls: "bg-hairline-strong", note: "Обводка в фокусе, бортик кнопок" },
];

export const Semantic: Story = {
  name: "Семантика и поверхности",
  render: () => (
    <Page
      title="Семантика"
      lead="Компоненты не знают про конкретные палитры — только про роли. Перекрасить, например, третью форму глагола можно одной строкой в tokens.css."
    >
      <Section title="Роли" note="Мягкий вариант (100/800) — чипы и подложки. Плотный (600/белый) — кнопки и акценты.">
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {semantic.map((s) => (
            <div key={s.alias} className="rounded-xl bg-surface p-4 shadow-sm">
              <div className="flex items-center justify-between">
                <span className="t-subheading text-fg-strong">{s.alias}</span>
                <Token>→ {s.palette}</Token>
              </div>
              <div className="mt-3 flex gap-2">
                <span className={`t-label flex-1 rounded-sm px-3 py-2 ${s.soft}`}>Мягкий</span>
                <span className={`t-label flex-1 rounded-sm px-3 py-2 ${s.solid}`}>Плотный</span>
              </div>
            </div>
          ))}
        </div>
      </Section>

      <Section title="Поверхности" note="Слои снизу вверх: canvas → surface-sunken → surface. Белые карточки на бумажном фоне отделяются тенью, а не обводкой.">
        <div className="grid gap-3 sm:grid-cols-5">
          {surfaces.map((s) => (
            <div key={s.token}>
              <div className={`h-20 rounded-lg ring-1 ring-hairline ${s.cls}`} />
              <p className="t-label mt-2 text-fg-strong">{s.token}</p>
              <p className="t-caption text-fg-muted">{s.note}</p>
            </div>
          ))}
        </div>
      </Section>

      <Section title="Три формы — три неба" note="Главный тематический приём: где бы ни встретилась форма глагола, её цвет одинаков.">
        <div className="grid gap-3 sm:grid-cols-3">
          {[
            { f: "V1", word: "go", name: "Infinitive", grad: "bg-grad-dawn", glow: "shadow-glow-v1" },
            { f: "V2", word: "went", name: "Past Simple", grad: "bg-grad-sunset", glow: "shadow-glow-v2" },
            { f: "V3", word: "gone", name: "Past Participle", grad: "bg-grad-dusk", glow: "shadow-glow-v3" },
          ].map((x) => (
            <div key={x.f} className={`grain rounded-2xl p-5 text-white ${x.grad} ${x.glow}`}>
              <p className="t-overline opacity-80">{x.f} · {x.name}</p>
              <p className="t-title mt-6">{x.word}</p>
            </div>
          ))}
        </div>
      </Section>
    </Page>
  ),
};
