import type { Metadata } from "next";
import Link from "next/link";

import { BottomNav } from "@/components/bottom-nav";
import { LanguageSwitcher } from "@/components/language-switcher";
import { SignOutButton } from "@/components/sign-out-button";
import { getProfileStats, type ProfileStats, type ProfileVerb } from "@/dal/profile";
import { getDictionary, type Dictionary } from "@/lib/dictionaries";
import { getLocale } from "@/lib/i18n";
import { interpolate, type Locale, pickLocalized, plural } from "@/lib/locales";
import { requireSession } from "@/lib/session";
import { getTimeZone } from "@/lib/time-zone-server";
import { cn } from "@/ui/cn";
import { SectionHeader } from "@/ui/composites/section-header";
import { StatsStrip } from "@/ui/composites/stat-tile";
import { TopBar } from "@/ui/composites/top-bar";
import { IconLanguage, IconProgress, IconStreak, IconTrophy, IconVerbs } from "@/ui/icons";
import { Avatar } from "@/ui/primitives/avatar";
import { Badge } from "@/ui/primitives/badge";
import { Card } from "@/ui/primitives/card";
import { IconTile } from "@/ui/primitives/icon-tile";
import { ProgressBar } from "@/ui/primitives/progress-bar";
import { ProgressRing } from "@/ui/primitives/progress-ring";
import { trainerLook } from "@/ui/trainer-icons";

import { ShowAll } from "./show-all";

export async function generateMetadata(): Promise<Metadata> {
  const dict = await getDictionary(await getLocale());
  return { title: dict.meta.profile };
}

/** Сколько глаголов списка видно сразу; остальные — под «Показать все». */
const VISIBLE_VERBS = 6;
const VISIBLE_LEARNED = 24;

export default async function ProfilePage() {
  const session = await requireSession();
  const locale = await getLocale();
  const dict = await getDictionary(locale);
  const t = dict.profile;
  const timeZone = await getTimeZone();
  const stats = await getProfileStats(session.user.id, timeZone);

  const name = stats.user?.name || session.user.name || session.user.email;
  const memberSince = stats.user
    ? new Intl.DateTimeFormat(locale, { day: "numeric", month: "long", year: "numeric", timeZone })
        .format(stats.user.createdAt)
    : null;

  const { learned, learning, notStarted, hard } = stats.verbs;
  const share = (count: number) => (stats.totalVerbs > 0 ? (count / stats.totalVerbs) * 100 : 0);
  const learnedPercent = Math.round(share(learned.length));

  return (
    <main className="flex-1 bg-canvas">
      <TopBar
        title={t.title}
        actions={<SignOutButton label={dict.auth.signOut} />}
      />

      {/* pt-24 освобождает место под фиксированную шапку, pb-32 — под таб-бар */}
      <div className="mx-auto flex w-full max-w-md flex-col gap-4 px-4 pt-24 pb-32">
        {/* кто это */}
        <Card className="flex items-center gap-4">
          <Avatar name={name} src={stats.user?.image} size="lg" ring="gold" />
          <div className="min-w-0 flex-1">
            <h1 className="t-title truncate text-fg-strong">{name}</h1>
            <p className="t-body-sm truncate text-fg-muted">{stats.user?.email}</p>
            {memberSince && (
              <p className="t-caption mt-1 text-fg-faint">
                {interpolate(t.memberSince, { date: memberSince })}
              </p>
            )}
          </div>
          <Badge tone="v3" className="shrink-0">
            {stats.level} · {dict.dashboard.levels[stats.level]}
          </Badge>
        </Card>

        <StatsStrip
          stats={[
            {
              icon: IconVerbs,
              tone: "v1",
              value: learned.length,
              label: plural(locale, learned.length, dict.dashboard.statVerbs),
            },
            {
              icon: IconStreak,
              tone: "v2",
              value: stats.streak,
              label: plural(locale, stats.streak, dict.dashboard.statDays),
            },
            { icon: IconTrophy, tone: "gold", value: stats.bestStreak, label: t.bestStreak },
            {
              icon: IconProgress,
              tone: "success",
              value: stats.answers.accuracy === null ? "—" : `${stats.answers.accuracy}%`,
              label: t.accuracy,
            },
          ]}
        />

        {/* глаголы: выучено / изучаю / не начато */}
        <Card>
          <h2 className="t-heading text-fg-strong">{t.progressTitle}</h2>
          <p className="t-body-sm mt-0.5 text-fg-muted">
            {interpolate(t.progressCaption, { learned: learned.length, total: stats.totalVerbs })}
          </p>
          <div className="mt-5 flex items-center gap-5">
            <ProgressRing value={learnedPercent} tone="success" size={96} thickness={10} label={t.progressTitle}>
              <span className="t-stat text-2xl text-success-600">{learnedPercent}%</span>
            </ProgressRing>
            <ul className="flex min-w-0 flex-1 flex-col gap-2.5">
              <Legend color="bg-success-500" label={t.learned} value={learned.length} />
              <Legend color="bg-v2-400" label={t.learning} value={learning.length} />
              <Legend color="bg-hairline-strong" label={t.notStarted} value={notStarted} />
            </ul>
          </div>
          {/* та же картина полосой: доли трёх состояний; фон — «не начато», цвет как в легенде */}
          <div
            className="mt-5 flex h-2.5 overflow-hidden rounded-full bg-hairline-strong"
            aria-hidden
          >
            <span className="bg-success-500" style={{ width: `${share(learned.length)}%` }} />
            <span className="bg-v2-400" style={{ width: `${share(learning.length)}%` }} />
          </div>
        </Card>

        <ActivityCard stats={stats} dict={dict} locale={locale} />

        {/* по тренажёрам */}
        <section className="mt-3">
          <SectionHeader title={t.trainersTitle} />
          <Card padding="sm" className="mt-3">
            <ul className="flex flex-col divide-y divide-hairline">
              {stats.trainers.map((trainer) => {
                const look = trainerLook(trainer.key);
                const percent = trainer.total > 0 ? (trainer.learned / trainer.total) * 100 : 0;
                const trainerName = pickLocalized(trainer.name, locale);
                return (
                  <li key={trainer.id}>
                    <Link
                      href={`/trainers/${trainer.key}`}
                      className="focus-ring -mx-2 flex items-center gap-3 rounded-lg px-2 py-3 transition-colors hover:bg-surface-sunken"
                    >
                      <IconTile icon={look.icon} tone={look.tone} size="sm" />
                      <div className="min-w-0 flex-1">
                        <div className="flex items-baseline justify-between gap-2">
                          <span className="t-label truncate text-fg-strong">{trainerName}</span>
                          <span className="t-caption shrink-0 text-fg-muted">
                            {trainer.accuracy === null
                              ? t.trainerNew
                              : interpolate(t.trainerAccuracy, { value: trainer.accuracy })}
                          </span>
                        </div>
                        <ProgressBar value={percent} tone={look.tone} size="xs" className="mt-2" label={trainerName} />
                        <p className="t-caption mt-1.5 text-fg-faint">
                          {interpolate(t.trainerProgress, { learned: trainer.learned, total: trainer.total })}
                        </p>
                      </div>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </Card>
        </section>

        {/* трудные глаголы */}
        {hard.length > 0 && (
          <section className="mt-3">
            <SectionHeader title={t.hardTitle} />
            <p className="t-body-sm mt-1 text-fg-muted">{t.hardCaption}</p>
            <Card padding="sm" className="mt-3">
              <VerbList verbs={hard} locale={locale} />
            </Card>
          </section>
        )}

        {/* изучаю сейчас */}
        <section className="mt-3">
          <SectionHeader title={`${t.learningTitle} · ${learning.length}`} />
          <Card padding="sm" className="mt-3">
            {learning.length === 0 ? (
              <p className="t-body-sm py-2 text-fg-muted">{t.emptyLearning}</p>
            ) : (
              <>
                <VerbList verbs={learning.slice(0, VISIBLE_VERBS)} locale={locale} />
                {learning.length > VISIBLE_VERBS && (
                  <ShowAll label={interpolate(t.showAll, { count: learning.length })} hideLabel={t.showLess}>
                    <VerbList verbs={learning.slice(VISIBLE_VERBS)} locale={locale} />
                  </ShowAll>
                )}
              </>
            )}
          </Card>
        </section>

        {/* выученные */}
        <section className="mt-3">
          <SectionHeader title={`${t.learnedTitle} · ${learned.length}`} />
          <Card padding="sm" className="mt-3">
            {learned.length === 0 ? (
              <div className="flex flex-col items-start gap-3 py-2">
                <p className="t-body-sm text-fg-muted">{t.emptyLearned}</p>
                <Link
                  href="/trainers"
                  className="focus-ring t-label rounded-full bg-ink-50 px-3 py-1.5 text-ink-700 transition-colors hover:bg-ink-100"
                >
                  {t.startAction}
                </Link>
              </div>
            ) : (
              <>
                <VerbChips verbs={learned.slice(0, VISIBLE_LEARNED)} locale={locale} />
                {learned.length > VISIBLE_LEARNED && (
                  <ShowAll label={interpolate(t.showAll, { count: learned.length })} hideLabel={t.showLess}>
                    <VerbChips verbs={learned.slice(VISIBLE_LEARNED)} locale={locale} />
                  </ShowAll>
                )}
              </>
            )}
          </Card>
        </section>

        {/* язык интерфейса */}
        <Card padding="sm" className="mt-3 flex flex-wrap items-center justify-between gap-3">
          <span className="t-label flex items-center gap-2.5 text-fg">
            <IconLanguage size={20} weight="duotone" className="text-fg-muted" aria-hidden />
            {dict.common.language}
          </span>
          <LanguageSwitcher current={locale} label={dict.common.language} />
        </Card>
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

function Legend({ color, label, value }: { color: string; label: string; value: number }) {
  return (
    <li className="flex items-center gap-2.5">
      <span className={cn("size-2.5 shrink-0 rounded-full", color)} aria-hidden />
      <span className="t-body-sm flex-1 text-fg-muted">{label}</span>
      <span className="t-label tabular-nums text-fg-strong">{value}</span>
    </li>
  );
}

/** Ответы по дням за 4 недели столбиками и итоги под ними. */
function ActivityCard({
  stats,
  dict,
  locale,
}: {
  stats: ProfileStats;
  dict: Dictionary;
  locale: Locale;
}) {
  const t = dict.profile;
  const { days, activeDays, answersThisWeek, learnedThisWeek, perActiveDay } = stats.activity;
  const max = Math.max(1, ...days.map((day) => day.answers));
  const format = new Intl.DateTimeFormat(locale, { day: "numeric", month: "short", timeZone: "UTC" });
  const label = (day: string) => format.format(new Date(`${day}T12:00:00Z`));
  const empty = days.every((day) => day.answers === 0);

  return (
    <Card>
      <h2 className="t-heading text-fg-strong">{t.activityTitle}</h2>
      <p className="t-body-sm mt-0.5 text-fg-muted">{t.activityCaption}</p>

      {empty ? (
        <p className="t-body-sm mt-4 rounded-lg bg-surface-sunken p-4 text-fg-muted">{t.activityEmpty}</p>
      ) : (
        <>
          <div className="mt-5 flex h-28 items-end gap-[3px]" role="img" aria-label={t.activityCaption}>
            {days.map((day, i) => {
              const today = i === days.length - 1;
              return (
                <span
                  key={day.day}
                  title={`${label(day.day)}: ${day.answers}`}
                  className={cn(
                    "min-h-1 flex-1 rounded-t-[3px]",
                    day.answers === 0
                      ? "bg-surface-sunken"
                      : today
                        ? "bg-v2-500"
                        : "bg-v1-400",
                  )}
                  style={{ height: day.answers === 0 ? undefined : `${(day.answers / max) * 100}%` }}
                />
              );
            })}
          </div>
          <div className="t-caption mt-1.5 flex justify-between text-fg-faint">
            <span>{label(days[0].day)}</span>
            <span>{label(days[days.length - 1].day)}</span>
          </div>
        </>
      )}

      <ul className="mt-4 grid grid-cols-2 gap-2">
        <Fact>{plural(locale, answersThisWeek, t.answersWeek)}</Fact>
        <Fact>{plural(locale, learnedThisWeek, t.learnedWeek)}</Fact>
        <Fact>{plural(locale, activeDays, t.activeDays)}</Fact>
        <Fact>{plural(locale, stats.answers.total, t.answersTotal)}</Fact>
        {perActiveDay > 0 && (
          <Fact wide>{interpolate(t.perDay, { count: perActiveDay })}</Fact>
        )}
      </ul>
    </Card>
  );
}

function Fact({ children, wide }: { children: React.ReactNode; wide?: boolean }) {
  return (
    <li className={cn("t-body-sm rounded-lg bg-surface-sunken px-3 py-2 text-fg", wide && "col-span-2")}>
      {children}
    </li>
  );
}

/** Строки глаголов: три формы цветами «времени суток», перевод, точность. */
function VerbList({ verbs, locale }: { verbs: ProfileVerb[]; locale: Locale }) {
  return (
    <ul className="flex flex-col divide-y divide-hairline">
      {verbs.map((verb) => (
        <li key={verb.id} className="flex items-center gap-3 py-2.5">
          <div className="min-w-0 flex-1">
            <p className="t-verb truncate text-[0.95rem]">
              <span className="text-v1-700">{verb.form1}</span>
              <span className="text-fg-faint"> · </span>
              <span className="text-v2-600">{verb.form2}</span>
              <span className="text-fg-faint"> · </span>
              <span className="text-v3-600">{verb.form3}</span>
            </p>
            <p className="t-caption truncate text-fg-muted">{pickLocalized(verb.translation, locale)}</p>
          </div>
          {verb.accuracy !== null && (
            <Badge
              size="sm"
              tone={verb.accuracy >= 80 ? "success" : verb.accuracy >= 50 ? "gold" : "danger"}
              className="shrink-0 tabular-nums"
            >
              {verb.accuracy}%
            </Badge>
          )}
        </li>
      ))}
    </ul>
  );
}

/** Выученные — компактно: инфинитив, остальное в подсказке. */
function VerbChips({ verbs, locale }: { verbs: ProfileVerb[]; locale: Locale }) {
  return (
    <ul className="flex flex-wrap gap-1.5 py-1">
      {verbs.map((verb) => (
        <li
          key={verb.id}
          title={`${verb.form1} – ${verb.form2} – ${verb.form3}: ${pickLocalized(verb.translation, locale)}`}
          className="t-verb rounded-full bg-success-100 px-2.5 py-1 text-sm text-success-700"
        >
          {verb.form1}
        </li>
      ))}
    </ul>
  );
}
