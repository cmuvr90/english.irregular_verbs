import type { Metadata } from "next";
import Link from "next/link";

import {
  BookIcon,
  CalendarIcon,
  CardsIcon,
  ChartIcon,
  ChevronIcon,
  DumbbellIcon,
  FlameIcon,
  GearIcon,
  GlobeIcon,
  HomeIcon,
  ListIcon,
  RepeatIcon,
  TargetBoard,
  TargetIcon,
  UserIcon,
} from "@/components/icons";
import { LanguageSwitcher } from "@/components/language-switcher";
import { Mascot } from "@/components/mascot";
import { SignOutButton } from "@/components/sign-out-button";
import { getDictionary } from "@/lib/dictionaries";
import { getLocale } from "@/lib/i18n";
import { interpolate, plural } from "@/lib/locales";
import { requireSession } from "@/lib/session";

export async function generateMetadata(): Promise<Metadata> {
  const dict = await getDictionary(await getLocale());
  return { title: dict.meta.dashboard };
}

// Демо-режим: цифры и прогресс захардкожены, разделы ведут на /coming-soon.
const demo = {
  verbs: 152,
  streak: 7,
  sessions: 23,
  level: "B1",
  trainerProgress: 65,
  goalDone: 12,
  goalTotal: 20,
};

export default async function DashboardPage() {
  const session = await requireSession();
  const locale = await getLocale();
  const dict = await getDictionary(locale);
  const t = dict.dashboard;

  const firstName = (session.user.name || session.user.email).split(" ")[0];
  const goalLeft = demo.goalTotal - demo.goalDone;
  const goalPercent = Math.round((demo.goalDone / demo.goalTotal) * 100);

  const stats = [
    {
      icon: <BookIcon />,
      chip: "bg-emerald-100 text-emerald-600",
      value: demo.verbs,
      color: "text-emerald-600",
      label: t.statVerbs,
    },
    {
      icon: <FlameIcon size={20} />,
      chip: "bg-orange-100 text-orange-500",
      value: demo.streak,
      color: "text-orange-500",
      label: t.statDays,
    },
    {
      icon: <CalendarIcon />,
      chip: "bg-blue-100 text-blue-600",
      value: demo.sessions,
      color: "text-blue-600",
      label: t.statSessions,
    },
  ];

  const quickAccess = [
    { icon: <DumbbellIcon />, chip: "bg-blue-100 text-blue-600", label: t.trainers },
    { icon: <ListIcon />, chip: "bg-emerald-100 text-emerald-600", label: t.verbList },
    { icon: <RepeatIcon />, chip: "bg-violet-100 text-violet-600", label: t.review },
    { icon: <GearIcon />, chip: "bg-zinc-100 text-zinc-500", label: t.settings },
  ];

  const navItems = [
    { icon: <HomeIcon />, label: t.navHome, href: "/dashboard", active: true },
    { icon: <DumbbellIcon />, label: t.navTrainers, href: "/coming-soon", active: false },
    { icon: <ChartIcon size={20} />, label: t.navProgress, href: "/coming-soon", active: false },
    { icon: <UserIcon />, label: t.navProfile, href: "/coming-soon", active: false },
  ];

  return (
    <main className="flex-1 bg-white">
      <div className="mx-auto w-full max-w-md px-5 pt-8 pb-28">
        {/* шапка */}
        <div className="flex items-start justify-between gap-3">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">{dict.common.appName}</h1>
            <p className="mt-1 text-sm text-subtle">{dict.common.tagline}</p>
          </div>
          <div className="flex shrink-0 items-center gap-2">
            <span className="flex items-center gap-1.5 rounded-full border border-line/60 bg-white py-2.5 pr-4 pl-3 shadow-sm">
              <FlameIcon size={20} className="text-orange-500" />
              <span className="font-semibold text-blue-600">{demo.streak}</span>
            </span>
            <SignOutButton label={dict.auth.signOut} />
          </div>
        </div>

        {/* приветствие */}
        <section className="mt-5 flex items-center overflow-hidden rounded-3xl border border-line/60 bg-gradient-to-r from-white to-blue-100">
          <div className="min-w-0 flex-1 p-6">
            <h2 className="text-2xl font-bold tracking-tight">
              {interpolate(t.greeting, { name: firstName })}
            </h2>
            <p className="mt-2 text-subtle">{t.greetingNote}</p>
          </div>
          <Mascot className="-mr-4 w-44 shrink-0" />
        </section>

        {/* статистика */}
        <section className="mt-4 rounded-3xl border border-line/60 bg-white p-4">
          <ul className="grid grid-cols-4 divide-x divide-line/60">
            {stats.map((s) => (
              <li key={s.label} className="flex flex-col items-center gap-1.5 px-1 text-center">
                <span className={`flex size-11 items-center justify-center rounded-2xl ${s.chip}`}>
                  {s.icon}
                </span>
                <span className={`text-2xl font-bold ${s.color}`}>{s.value}</span>
                <span className="text-[11px] leading-tight text-subtle">{s.label}</span>
              </li>
            ))}
            <li className="flex flex-col items-center gap-1.5 px-1 text-center">
              <span className="flex size-11 items-center justify-center rounded-2xl bg-violet-100 text-violet-600">
                <ChartIcon size={20} />
              </span>
              <span className="text-[11px] text-subtle">{t.statLevel}</span>
              <span className="text-2xl leading-none font-bold text-violet-600">{demo.level}</span>
              <span className="text-[11px] leading-tight text-subtle">{t.statLevelName}</span>
            </li>
          </ul>
        </section>

        {/* продолжить обучение */}
        <section className="mt-4 rounded-3xl bg-gradient-to-br from-blue-500 to-blue-700 p-6 text-white">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h2 className="text-xl font-bold">{t.continueTitle}</h2>
              <p className="mt-1 text-sm text-blue-100">{t.continueSubtitle}</p>
            </div>
            <ProgressRing value={demo.trainerProgress} />
          </div>

          <div className="mt-4 flex items-center gap-4">
            <span className="flex size-14 shrink-0 items-center justify-center rounded-2xl bg-white/95 text-violet-600">
              <CardsIcon />
            </span>
            <div className="min-w-0">
              <p className="text-lg font-bold">{t.trainerName}</p>
              <p className="text-sm text-blue-100">{t.trainerKind}</p>
            </div>
          </div>

          <Link
            href="/coming-soon"
            className="mt-5 flex items-center justify-center gap-2 rounded-2xl bg-white py-3.5 font-medium text-blue-600 transition-opacity hover:opacity-90"
          >
            {t.continueAction}
            <ChevronIcon />
          </Link>
        </section>

        {/* сегодня */}
        <section className="mt-4 rounded-3xl border border-line/60 bg-white p-6">
          <div className="flex items-center justify-between gap-3">
            <h2 className="text-xl font-bold">{t.todayTitle}</h2>
            <Link
              href="/coming-soon"
              className="flex items-center gap-1.5 rounded-full bg-blue-50 px-3.5 py-2 text-sm font-medium text-blue-600 transition-colors hover:bg-blue-100"
            >
              <TargetIcon />
              {t.changeGoal}
            </Link>
          </div>
          <p className="mt-1 text-sm text-subtle">{t.todayGoal}</p>

          <div className="mt-4 flex items-center gap-4">
            <div className="min-w-0 flex-1">
              <p className="text-lg">
                <span className="text-3xl font-bold text-blue-600">{demo.goalDone}</span>
                <span className="text-subtle"> / {demo.goalTotal}</span>
              </p>
              <p className="text-sm text-subtle">{t.verbs}</p>
              <div className="mt-3 h-2.5 w-full overflow-hidden rounded-full bg-line/60">
                <div
                  className="h-full rounded-full bg-emerald-500"
                  style={{ width: `${goalPercent}%` }}
                />
              </div>
              <p className="mt-2 text-sm text-subtle">{plural(locale, goalLeft, t.remaining)}</p>
            </div>
            <TargetBoard />
          </div>
        </section>

        {/* быстрый доступ */}
        <h2 className="mt-7 text-xl font-bold">{t.quickAccess}</h2>
        <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-4">
          {quickAccess.map((item) => (
            <Link
              key={item.label}
              href="/coming-soon"
              className="flex flex-col items-center gap-2.5 rounded-3xl border border-line/60 bg-white p-4 pt-5 text-center transition-shadow hover:shadow-md"
            >
              <span className={`flex size-14 items-center justify-center rounded-2xl ${item.chip}`}>
                {item.icon}
              </span>
              <span className="text-sm font-medium">{item.label}</span>
              <ChevronIcon className="text-subtle" />
            </Link>
          ))}
        </div>

        {/* язык интерфейса */}
        <div className="mt-4 flex items-center justify-between gap-3 rounded-3xl border border-line/60 bg-white px-5 py-4">
          <span className="flex items-center gap-2.5 text-sm font-medium">
            <GlobeIcon className="text-subtle" />
            {dict.common.language}
          </span>
          <LanguageSwitcher current={locale} />
        </div>
      </div>

      {/* нижняя навигация */}
      <nav className="fixed inset-x-0 bottom-0 border-t border-line/60 bg-white/95 backdrop-blur">
        <div className="mx-auto grid w-full max-w-md grid-cols-4 pb-[max(0px,env(safe-area-inset-bottom))]">
          {navItems.map((item) => (
            <Link
              key={item.label}
              href={item.href}
              aria-current={item.active ? "page" : undefined}
              className={`relative flex flex-col items-center gap-1 pt-3 pb-2.5 text-[11px] ${
                item.active
                  ? "font-semibold text-blue-600"
                  : "text-subtle transition-colors hover:text-foreground"
              }`}
            >
              {item.active && (
                <span className="absolute top-0 h-1 w-10 rounded-b-full bg-blue-600" />
              )}
              {item.icon}
              {item.label}
            </Link>
          ))}
        </div>
      </nav>
    </main>
  );
}

/** Кольцо прогресса: полный круг 2πr, закрашиваем value% через stroke-dasharray. */
function ProgressRing({ value }: { value: number }) {
  const r = 30;
  const c = 2 * Math.PI * r;
  return (
    <svg width="76" height="76" viewBox="0 0 76 76" className="shrink-0" aria-hidden>
      <circle cx="38" cy="38" r={r} fill="none" stroke="rgba(255,255,255,0.25)" strokeWidth="7" />
      <circle
        cx="38"
        cy="38"
        r={r}
        fill="none"
        stroke="#34d399"
        strokeWidth="7"
        strokeLinecap="round"
        strokeDasharray={`${(c * value) / 100} ${c}`}
        transform="rotate(-90 38 38)"
      />
      <text
        x="38"
        y="43"
        textAnchor="middle"
        fill="#fff"
        fontSize="17"
        fontWeight="bold"
        fontFamily="inherit"
      >
        {value}%
      </text>
    </svg>
  );
}
