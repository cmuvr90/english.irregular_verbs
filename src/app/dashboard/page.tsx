import type { Metadata } from "next";

import { AdminLink } from "@/components/admin-link";
import { BottomNav } from "@/components/bottom-nav";
import { LanguageSwitcher } from "@/components/language-switcher";
import { Mascot } from "@/components/mascot";
import { SignOutButton } from "@/components/sign-out-button";
import { getDashboardStats, type WeekDay } from "@/dal/dashboard";
import { getDictionary } from "@/lib/dictionaries";
import { getLocale } from "@/lib/i18n";
import { interpolate, pickLocalized, plural } from "@/lib/locales";
import { requireSession } from "@/lib/session";
import { getTimeZone } from "@/lib/time-zone-server";
import { ContinueCard } from "@/ui/composites/continue-card";
import { DailyGoalCard } from "@/ui/composites/daily-goal-card";
import { GreetingHero } from "@/ui/composites/greeting-hero";
import { QuickAction } from "@/ui/composites/quick-action";
import { SectionHeader } from "@/ui/composites/section-header";
import { StatsStrip } from "@/ui/composites/stat-tile";
import { type StreakDay, StreakCard } from "@/ui/composites/streak-card";
import { TopBar } from "@/ui/composites/top-bar";
import {
  IconCalendar,
  IconLanguage,
  IconProgress,
  IconReview,
  IconSettings,
  IconStreak,
  IconTrainers,
  IconVerbs,
} from "@/ui/icons";
import { Badge } from "@/ui/primitives/badge";
import { Card } from "@/ui/primitives/card";
import { trainerLook } from "@/ui/trainer-icons";

export async function generateMetadata(): Promise<Metadata> {
  const dict = await getDictionary(await getLocale());
  return { title: dict.meta.dashboard };
}

/** Подписи дней недели — из Intl, чтобы не держать их в словарях: «Пн», «Вт»… */
function weekLabels(locale: string, week: WeekDay[]): StreakDay[] {
  const format = new Intl.DateTimeFormat(locale, { weekday: "short", timeZone: "UTC" });
  return week.map(({ day, state }) => {
    const label = format.format(new Date(`${day}T12:00:00Z`)).replace(".", "");
    return { label: label.charAt(0).toUpperCase() + label.slice(1, 2), state };
  });
}

export default async function DashboardPage() {
  const session = await requireSession();
  const locale = await getLocale();
  const dict = await getDictionary(locale);
  const t = dict.dashboard;

  const firstName = (session.user.name || session.user.email).split(" ")[0];
  const stats = await getDashboardStats(session.user.id, await getTimeZone());
  const goalLeft = Math.max(0, stats.today.goal - stats.today.done);

  // «Продолжить» ведёт в последний тренажёр; новичку — первый по порядку.
  const next = stats.continueWith;
  const nextProgress = next && next.total > 0 ? Math.round((next.learned / next.total) * 100) : 0;

  // Подсказка под неделей: цель дня закрыта — «до завтра»; занимался, но цель
  // не добил — молчим (серия уже в безопасности); не занимался — зовём.
  const streakNote =
    stats.today.done >= stats.today.goal
      ? t.streakDoneToday
      : stats.today.active
        ? undefined
        : stats.streak > 0
          ? t.streakKeep
          : t.streakStart;

  return (
    <main className="flex-1 bg-canvas">
      <TopBar
        title={dict.common.appName}
        subtitle={dict.common.tagline}
        actions={
          <>
            <Badge tone="v2" icon={IconStreak} className="h-9 px-3.5 text-sm">
              {stats.streak}
            </Badge>
            <AdminLink label={dict.common.admin} />
            <SignOutButton label={dict.auth.signOut} />
          </>
        }
      />

      {/* pt-24 освобождает место под фиксированную шапку, pb-32 — под таб-бар */}
      <div className="mx-auto flex w-full max-w-md flex-col gap-4 px-4 pt-24 pb-32">
        <GreetingHero
          badge={`${stats.level} · ${t.levels[stats.level]}`}
          greeting={interpolate(t.greeting, { name: firstName })}
          note={stats.answers > 0 ? t.greetingNote : t.greetingNoteNew}
          illustration={{ src: "/images/app/mascot-wave.webp", alt: "" }}
          fallback={<Mascot className="w-full" />}
        />

        <StatsStrip
          stats={[
            {
              icon: IconVerbs,
              tone: "v1",
              value: stats.learned,
              label: plural(locale, stats.learned, t.statVerbs),
            },
            {
              icon: IconStreak,
              tone: "v2",
              value: stats.streak,
              label: plural(locale, stats.streak, t.statDays),
            },
            {
              icon: IconCalendar,
              tone: "v3",
              value: stats.answers,
              label: plural(locale, stats.answers, t.statSessions),
            },
            { icon: IconProgress, tone: "ink", value: stats.level, label: t.statLevel },
          ]}
        />

        {next && (
          <ContinueCard
            title={next.started ? t.continueTitle : t.startTitle}
            subtitle={next.started ? t.continueSubtitle : t.startSubtitle}
            trainer={{
              name: pickLocalized(next.name, locale),
              kind: interpolate(t.continueProgress, { learned: next.learned, total: next.total }),
              icon: trainerLook(next.key).icon,
            }}
            progress={nextProgress}
            action={{
              label: next.started ? t.continueAction : t.startAction,
              href: `/trainers/${next.key}`,
            }}
          />
        )}

        <DailyGoalCard
          title={t.todayTitle}
          subtitle={t.todayGoal}
          done={stats.today.done}
          total={stats.today.goal}
          unit={t.verbs}
          remaining={plural(locale, goalLeft, t.remaining)}
          completeText={t.goalDone}
          changeGoal={{ label: t.changeGoal, href: "/coming-soon" }}
        />

        <StreakCard
          days={stats.streak}
          caption={plural(locale, stats.streak, t.statDays)}
          week={weekLabels(locale, stats.week)}
          note={streakNote}
        />

        <section className="mt-3">
          <SectionHeader title={t.quickAccess} />
          <div className="mt-3 grid grid-cols-2 gap-3">
            <QuickAction icon={IconTrainers} tone="ink" label={t.trainers} href="/trainers" />
            <QuickAction icon={IconVerbs} tone="v1" label={t.verbList} href="/verbs" />
            <QuickAction icon={IconReview} tone="v3" label={t.review} href="/coming-soon" />
            <QuickAction icon={IconSettings} tone="mist" label={t.settings} href="/coming-soon" />
          </div>
        </section>

        {/* язык интерфейса */}
        <Card padding="sm" className="flex flex-wrap items-center justify-between gap-3">
          <span className="t-label flex items-center gap-2.5 text-fg">
            <IconLanguage size={20} weight="duotone" className="text-fg-muted" aria-hidden />
            {dict.common.language}
          </span>
          <LanguageSwitcher current={locale} label={dict.common.language} />
        </Card>
      </div>

      <BottomNav
        labels={{
          home: t.navHome,
          trainers: t.navTrainers,
          progress: t.navProgress,
          profile: t.navProfile,
        }}
      />
    </main>
  );
}
