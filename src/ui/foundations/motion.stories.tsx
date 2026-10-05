import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { AnimatePresence } from "motion/react";
import * as m from "motion/react-m";
import { useState } from "react";

import { fadeUp, pop, press, shake, spring, stagger } from "../motion/presets";
import { Page, Section, Token } from "./doc-blocks";

const meta = {
  title: "Основа/Движение",
  parameters: { layout: "fullscreen" },
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

function Replay({ children }: { children: (key: number) => React.ReactNode }) {
  const [key, setKey] = useState(0);
  return (
    <div className="rounded-xl bg-surface p-5 shadow-sm">
      <div className="min-h-28">{children(key)}</div>
      <button
        type="button"
        onClick={() => setKey((k) => k + 1)}
        className="focus-ring t-label mt-4 rounded-full bg-ink-50 px-4 py-2 text-ink-700 transition-colors hover:bg-ink-100"
      >
        Повторить
      </button>
    </div>
  );
}

function SpringDemo({ name }: { name: keyof typeof spring }) {
  const [on, setOn] = useState(false);
  return (
    <button
      type="button"
      onClick={() => setOn((v) => !v)}
      className="focus-ring flex w-full flex-col gap-3 rounded-xl bg-surface p-5 text-left shadow-sm"
    >
      <span className="t-subheading text-fg-strong">{name}</span>
      <span className="relative h-10 rounded-full bg-surface-sunken inset-shadow-sunken">
        <m.span
          className="absolute top-1 left-1 size-8 rounded-full bg-grad-ink shadow-glow-ink"
          animate={{ x: on ? 180 : 0 }}
          transition={spring[name]}
        />
      </span>
      <Token>spring.{name} — нажми</Token>
    </button>
  );
}

export const Springs: Story = {
  name: "Пружины",
  render: () => (
    <Page
      title="Движение"
      lead="Анимации — на библиотеке Motion (motion.dev) в облегчённом режиме LazyMotion: компоненты используют m.*, фичи грузятся асинхронно. Всё движение — пружинное: оно ощущается физично и прерывается без рывков. При «уменьшить движение» в ОС смещения отключаются."
    >
      <Section title="Пружины" note="Четыре характера движения из ui/motion/presets.ts. Компоненты не придумывают свои кривые.">
        <div className="grid gap-4 sm:grid-cols-2">
          {(Object.keys(spring) as Array<keyof typeof spring>).map((name) => (
            <SpringDemo key={name} name={name} />
          ))}
        </div>
      </Section>

      <Section title="Отклик на нажатие" note="press — общий набор whileHover/whileTap для всего кликабельного.">
        <div className="flex gap-4">
          <m.button
            type="button"
            {...press}
            className="focus-ring t-label rounded-xl bg-surface px-6 py-5 text-fg-strong shadow-md"
          >
            Наведи и нажми
          </m.button>
        </div>
      </Section>
    </Page>
  ),
};

export const Choreography: Story = {
  name: "Хореография",
  render: () => (
    <Page title="Хореография" lead="Готовые варианты: появление карточек по очереди, «поп» наград и тряска при ошибке.">
      <div className="grid gap-5 sm:grid-cols-3">
        <Section title="stagger + fadeUp" note="Экран собирается сверху вниз.">
          <Replay>
            {(key) => (
              <m.ul key={key} variants={stagger(0.08)} initial="hidden" animate="show" className="flex flex-col gap-2">
                {["bg-grad-dawn", "bg-grad-sunset", "bg-grad-dusk"].map((g) => (
                  <m.li key={g} variants={fadeUp} className={`h-7 rounded-sm ${g}`} />
                ))}
              </m.ul>
            )}
          </Replay>
        </Section>

        <Section title="pop" note="Награды и верный ответ.">
          <Replay>
            {(key) => (
              <div className="flex h-28 items-center justify-center">
                <m.div
                  key={key}
                  variants={pop}
                  initial="hidden"
                  animate="show"
                  className="grain flex size-20 items-center justify-center rounded-2xl bg-grad-gold shadow-glow-gold"
                >
                  <span className="t-heading text-gold-950">+10</span>
                </m.div>
              </div>
            )}
          </Replay>
        </Section>

        <Section title="shake" note="Неверный ответ: коротко, без драмы.">
          <Replay>
            {(key) => (
              <div className="flex h-28 items-center justify-center">
                <m.div
                  key={key}
                  animate={key ? shake : undefined}
                  className="t-verb rounded-md bg-berry-50 px-5 py-3 text-xl text-berry-700 ring-1 ring-berry-200"
                >
                  goed
                </m.div>
              </div>
            )}
          </Replay>
        </Section>
      </div>
    </Page>
  ),
};

export const Presence: Story = {
  name: "Появление и исчезновение",
  render: function Render() {
    const [show, setShow] = useState(true);
    return (
      <Page title="AnimatePresence" lead="Элементы уходят так же красиво, как появляются: подсказки, тосты, листы снизу.">
        <div className="flex flex-col items-start gap-4">
          <button
            type="button"
            onClick={() => setShow((v) => !v)}
            className="focus-ring t-label rounded-full bg-ink-600 px-5 py-2.5 text-white shadow-press-ink active:translate-y-1 active:shadow-none"
          >
            {show ? "Скрыть" : "Показать"}
          </button>
          <div className="h-24">
            <AnimatePresence>
              {show && (
                <m.div
                  initial={{ opacity: 0, y: 20, scale: 0.96 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 10, scale: 0.96, filter: "blur(4px)" }}
                  transition={spring.gentle}
                  className="glass rounded-xl px-5 py-4 shadow-float"
                >
                  <p className="t-subheading text-fg-strong">Отлично! 🎯</p>
                  <p className="t-body-sm text-fg-muted">Ещё 3 глагола до цели дня</p>
                </m.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </Page>
    );
  },
};
