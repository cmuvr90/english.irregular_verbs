import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import { IconFlashcards, IconProgress, IconReview, IconSettings, IconStreak, IconVerbs, IconCalendar, IconTrainers } from "../icons";
import { ContinueCard } from "./continue-card";
import { DailyGoalCard } from "./daily-goal-card";
import { images, week } from "./fixtures";
import { GreetingHero } from "./greeting-hero";
import { QuickAction } from "./quick-action";
import { SectionHeader } from "./section-header";
import { StatsStrip } from "./stat-tile";
import { StreakCard } from "./streak-card";

const meta = {
  title: "Композиты/Дашборд",
  parameters: { layout: "padded" },
  decorators: [(Story) => <div className="mx-auto w-full max-w-md"><Story /></div>],
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

export const Greeting: Story = {
  name: "GreetingHero",
  render: () => (
    <GreetingHero
      badge="B1 · Intermediate"
      greeting="Привет, Женя!"
      note="Сегодня отличный день, чтобы выучить пару новых глаголов."
      illustration={{ src: images.mascotWave, alt: "Маскот машет рукой" }}
    />
  ),
};

export const Stats: Story = {
  name: "StatsStrip",
  render: () => (
    <StatsStrip
      stats={[
        { icon: IconVerbs, tone: "v1", value: 152, label: "глагола выучено" },
        { icon: IconStreak, tone: "v2", value: 7, label: "дней подряд" },
        { icon: IconCalendar, tone: "v3", value: 23, label: "сессии" },
        { icon: IconProgress, tone: "ink", value: "B1", label: "уровень" },
      ]}
    />
  ),
};

export const Continue: Story = {
  name: "ContinueCard",
  render: () => (
    <ContinueCard
      title="Продолжить обучение"
      subtitle="Ты остановился на 13-м глаголе"
      trainer={{ name: "Карточки", kind: "Тренажёр · 20 глаголов", icon: IconFlashcards }}
      progress={65}
      action={{ label: "Продолжить", href: "#continue" }}
    />
  ),
};

export const Goal: Story = {
  name: "DailyGoalCard",
  render: () => (
    <div className="flex flex-col gap-4">
      <DailyGoalCard
        title="Сегодня"
        subtitle="Цель дня — 20 глаголов"
        done={12}
        total={20}
        unit="глаголов"
        remaining="Осталось 8 глаголов"
        completeText="Цель выполнена! 🎉"
        changeGoal={{ label: "Цель", href: "#goal" }}
      />
      <DailyGoalCard
        title="Сегодня"
        subtitle="Цель дня — 20 глаголов"
        done={20}
        total={20}
        unit="глаголов"
        remaining=""
        completeText="Цель выполнена! Так держать 🎉"
      />
    </div>
  ),
};

export const Streak: Story = {
  name: "StreakCard",
  render: () => <StreakCard days={7} caption="дней подряд" week={week} note="Позанимайся сегодня, чтобы не потерять серию." />,
};

export const QuickActions: Story = {
  name: "QuickAction",
  render: () => (
    <div>
      <SectionHeader title="Быстрый доступ" action={{ label: "Все", href: "#all" }} />
      <div className="mt-3 grid grid-cols-2 gap-3">
        <QuickAction icon={IconTrainers} tone="ink" label="Тренажёры" hint="6 режимов" href="#t" />
        <QuickAction icon={IconVerbs} tone="v1" label="Глаголы" hint="152 в словаре" href="#v" />
        <QuickAction icon={IconReview} tone="v3" label="Повторение" hint="14 на сегодня" href="#r" />
        <QuickAction icon={IconSettings} tone="mist" label="Настройки" href="#s" />
      </div>
    </div>
  ),
};
