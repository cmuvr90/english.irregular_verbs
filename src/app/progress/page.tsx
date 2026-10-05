import type { Metadata } from "next";

import { AdminLink } from "@/components/admin-link";
import { BottomNav } from "@/components/bottom-nav";
import { type AchievementView, getAchievements } from "@/dal/achievements";
import { ACHIEVEMENT_KINDS, type AchievementKind } from "@/lib/achievements";
import { getDictionary, type Dictionary } from "@/lib/dictionaries";
import { getLocale } from "@/lib/i18n";
import { interpolate, type Locale, plural } from "@/lib/locales";
import { requireSession } from "@/lib/session";
import { getTimeZone } from "@/lib/time-zone-server";
import { cn } from "@/ui/cn";
import { SectionHeader } from "@/ui/composites/section-header";
import { TopBar } from "@/ui/composites/top-bar";
import { type Icon, IconGoal, IconRocket, IconStreak, IconTrophy, IconVerbs } from "@/ui/icons";
import { Card } from "@/ui/primitives/card";
import { IconTile } from "@/ui/primitives/icon-tile";
import { ProgressBar } from "@/ui/primitives/progress-bar";
import type { Tone } from "@/ui/tones";

export async function generateMetadata(): Promise<Metadata> {
  const dict = await getDictionary(await getLocale());
  return { title: dict.meta.progress };
}

/** Облик линейки наград: иконка и цвет полученного кубка. */
const kindLook: Record<AchievementKind, { icon: Icon; tone: Tone }> = {
  streak: { icon: IconStreak, tone: "gold" },
  run: { icon: IconGoal, tone: "success" },
  learned: { icon: IconVerbs, tone: "v1" },
};

export default async function ProgressPage() {
  const session = await requireSession();
  const locale = await getLocale();
  const dict = await getDictionary(locale);
  const t = dict.achievements;
  const timeZone = await getTimeZone();
  const data = await getAchievements(session.user.id, timeZone);

  const total = data.achievements.length;
  const formatDate = new Intl.DateTimeFormat(locale, {
    day: "numeric",
    month: "short",
    year: "numeric",
    timeZone,
  });
  const nowValue: Record<AchievementKind, number> = {
    streak: data.current.streak,
    run: data.current.run,
    learned: data.learned,
  };

  return (
    <main className="flex-1 bg-canvas">
      <TopBar title={t.title} actions={<AdminLink label={dict.common.admin} />} />

      {/* pt-24 освобождает место под фиксированную шапку, pb-32 — под таб-бар */}
      <div className="mx-auto flex w-full max-w-md flex-col gap-4 px-4 pt-24 pb-32">
        <Card className="flex items-center gap-4">
          <IconTile icon={IconTrophy} tone="gold" variant="solid" size="xl" className="shrink-0" />
          <div className="min-w-0 flex-1">
            <h1 className="t-heading text-fg-strong">
              {interpolate(t.summary, { earned: data.earned, total })}
            </h1>
            <ProgressBar
              value={total > 0 ? (data.earned / total) * 100 : 0}
              tone="gold"
              size="sm"
              className="mt-3"
              label={t.title}
            />
            <p className="t-caption mt-2 text-fg-muted">{t.caption}</p>
          </div>
        </Card>

        {ACHIEVEMENT_KINDS.map((kind) => {
          const items = data.achievements.filter((achievement) => achievement.kind === kind);
          const earned = items.filter((achievement) => achievement.earnedAt).length;
          return (
            <section key={kind} className="mt-3">
              <SectionHeader title={`${t.kinds[kind]} · ${earned}/${items.length}`} />
              <p className="t-body-sm mt-1 text-fg-muted">
                {interpolate(t.now, { count: nowValue[kind] })}
              </p>
              <Card padding="sm" className="mt-3">
                <ul className="flex flex-col divide-y divide-hairline">
                  {items.map((achievement) => (
                    <AchievementRow
                      key={achievement.key}
                      achievement={achievement}
                      dict={dict}
                      locale={locale}
                      earnedText={
                        achievement.earnedAt
                          ? interpolate(t.earnedOn, { date: formatDate.format(achievement.earnedAt) })
                          : null
                      }
                    />
                  ))}
                </ul>
              </Card>
            </section>
          );
        })}
      </div>

      <BottomNav
        labels={{
          home: dict.dashboard.navHome,
          trainers: dict.dashboard.navTrainers,
          progress: dict.dashboard.navProgress,
          profile: dict.dashboard.navProfile,
        }}
      />
    </main>
  );
}

/** Строка награды: полученная — цветная с датой, остальные — серые с прогрессом. */
function AchievementRow({
  achievement,
  dict,
  locale,
  earnedText,
}: {
  achievement: AchievementView;
  dict: Dictionary;
  locale: Locale;
  earnedText: string | null;
}) {
  const t = dict.achievements;
  const look = kindLook[achievement.kind];
  const earned = earnedText !== null;
  const title = t.titles[achievement.key as keyof typeof t.titles] ?? achievement.key;

  return (
    <li className="flex items-center gap-3 py-3">
      <IconTile
        icon={achievement.key === "streak-1" ? IconRocket : look.icon}
        tone={earned ? look.tone : "mist"}
        variant={earned ? "solid" : "soft"}
        size="md"
        className={cn("shrink-0", !earned && "opacity-60")}
      />
      <div className="min-w-0 flex-1">
        <p className={cn("t-label", earned ? "text-fg-strong" : "text-fg-muted")}>{title}</p>
        <p className="t-caption text-fg-faint">{describe(achievement, dict, locale)}</p>
        {earned ? (
          <p className="t-caption mt-1 font-semibold text-success-600">{earnedText}</p>
        ) : (
          <div className="mt-2 flex items-center gap-2">
            <ProgressBar
              value={(achievement.value / achievement.goal) * 100}
              tone={look.tone}
              size="xs"
              className="flex-1"
              label={title}
            />
            <span className="t-caption shrink-0 tabular-nums text-fg-muted">
              {achievement.value}/{achievement.goal}
            </span>
          </div>
        )}
      </div>
    </li>
  );
}

function describe(achievement: AchievementView, dict: Dictionary, locale: Locale) {
  const t = dict.achievements;
  if (achievement.key === "streak-1") return t.streakStart;
  if (achievement.key === "learned-all") return t.learnedAll;
  return plural(locale, achievement.goal, t[achievement.kind]);
}
