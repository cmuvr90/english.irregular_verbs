import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import * as m from "motion/react-m";

import { ContinueCard } from "../composites/continue-card";
import { DailyGoalCard } from "../composites/daily-goal-card";
import { images, tabs, trainers, week } from "../composites/fixtures";
import { GreetingHero } from "../composites/greeting-hero";
import { QuickAction } from "../composites/quick-action";
import { SectionHeader } from "../composites/section-header";
import { StatsStrip } from "../composites/stat-tile";
import { StreakCard } from "../composites/streak-card";
import { TabBar } from "../composites/tab-bar";
import { TopBar } from "../composites/top-bar";
import { TrainerCard } from "../composites/trainer-card";
import {
  IconBell,
  IconCalendar,
  IconFlashcards,
  IconProgress,
  IconReview,
  IconSettings,
  IconStreak,
  IconTrainers,
  IconVerbs,
} from "../icons";
import { fadeUp, stagger } from "../motion/presets";
import { Avatar } from "../primitives/avatar";
import { Badge } from "../primitives/badge";
import { IconButton } from "../primitives/icon-button";

const meta = {
  title: "Экраны/Дашборд",
  parameters: { layout: "fullscreen" },
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * Черновик нового дашборда, собранный только из композитов дизайн-системы.
 * Данные демо — экран показывает ритм, иерархию и движение.
 */
export const Dashboard: Story = {
  name: "Дашборд",
  render: () => (
    <div className="min-h-screen bg-canvas">
      <TopBar
        title="Irregular Verbs"
        actions={
          <>
            <Badge tone="v2" icon={IconStreak} className="h-9 px-3.5 text-sm">
              7
            </Badge>
            <IconButton icon={IconBell} label="Уведомления" badge={2} />
            <Avatar name="Eugene S" />
          </>
        }
      />

      <m.main
        variants={stagger(0.07, 0.05)}
        initial="hidden"
        animate="show"
        className="mx-auto flex w-full max-w-md flex-col gap-4 px-4 pt-20 pb-32"
      >
        <m.div variants={fadeUp}>
          <GreetingHero
            badge="B1 · Intermediate"
            greeting="Привет, Женя!"
            note="Сегодня отличный день, чтобы выучить пару новых глаголов."
            illustration={{ src: images.mascotWave, alt: "Маскот машет рукой" }}
          />
        </m.div>

        <m.div variants={fadeUp}>
          <StatsStrip
            stats={[
              { icon: IconVerbs, tone: "v1", value: 152, label: "глагола" },
              { icon: IconStreak, tone: "v2", value: 7, label: "дней подряд" },
              { icon: IconCalendar, tone: "v3", value: 23, label: "сессии" },
              { icon: IconProgress, tone: "ink", value: "B1", label: "уровень" },
            ]}
          />
        </m.div>

        <m.div variants={fadeUp}>
          <ContinueCard
            title="Продолжить обучение"
            subtitle="Ты остановился на 13-м глаголе"
            trainer={{ name: "Карточки", kind: "Тренажёр · 20 глаголов", icon: IconFlashcards }}
            progress={65}
            action={{ label: "Продолжить", href: "#continue" }}
          />
        </m.div>

        <m.div variants={fadeUp} className="grid gap-4">
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
          <StreakCard days={7} caption="дней подряд" week={week} note="Позанимайся сегодня, чтобы не потерять серию." />
        </m.div>

        <m.section variants={fadeUp} className="mt-3">
          <SectionHeader title="Быстрый доступ" />
          <div className="mt-3 grid grid-cols-2 gap-3">
            <QuickAction icon={IconTrainers} tone="ink" label="Тренажёры" hint="6 режимов" href="#t" />
            <QuickAction icon={IconVerbs} tone="v1" label="Глаголы" hint="152 в словаре" href="#v" />
            <QuickAction icon={IconReview} tone="v3" label="Повторение" hint="14 на сегодня" href="#r" />
            <QuickAction icon={IconSettings} tone="mist" label="Настройки" href="#s" />
          </div>
        </m.section>

        <m.section variants={fadeUp} className="mt-3">
          <SectionHeader title="Тренажёры" action={{ label: "Все", href: "#trainers" }} />
          <div className="mt-3 flex flex-col gap-3">
            {trainers.slice(0, 3).map((t) => (
              <TrainerCard key={t.href} {...t} />
            ))}
          </div>
        </m.section>
      </m.main>

      <TabBar items={tabs} active="home" />
    </div>
  ),
};
