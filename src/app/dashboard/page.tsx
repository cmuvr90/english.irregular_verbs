import type { Metadata } from "next";
import Link from "next/link";

import { LanguageSwitcher } from "@/components/language-switcher";
import { Mascot } from "@/components/mascot";
import { SignOutButton } from "@/components/sign-out-button";
import { getDictionary } from "@/lib/dictionaries";
import { getLocale, interpolate } from "@/lib/i18n";
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
  const goalPercent = Math.round((demo.goalDone / demo.goalTotal) * 100);

  const stats = [
    {
      icon: <BookIcon />,
      chip: "bg-emerald-100 text-emerald-600",
      value: String(demo.verbs),
      valueClass: "text-emerald-600",
      label: t.statVerbs,
    },
    {
      icon: <FlameIcon />,
      chip: "bg-orange-100 text-orange-500",
      value: String(demo.streak),
      valueClass: "text-orange-500",
      label: t.statDays,
    },
    {
      icon: <CalendarIcon />,
      chip: "bg-blue-100 text-blue-600",
      value: String(demo.sessions),
      valueClass: "text-blue-600",
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
    { icon: <ChartIcon />, label: t.navProgress, href: "/coming-soon", active: false },
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
              <span className="text-orange-500">
                <FlameIcon />
              </span>
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
                <span className={`text-2xl font-bold ${s.valueClass}`}>{s.value}</span>
                <span className="text-[11px] leading-tight text-subtle">{s.label}</span>
              </li>
            ))}
            <li className="flex flex-col items-center gap-1.5 px-1 text-center">
              <span className="flex size-11 items-center justify-center rounded-2xl bg-violet-100 text-violet-600">
                <ChartIcon />
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
              <TargetSmallIcon />
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
              <p className="mt-2 text-sm text-subtle">
                {interpolate(t.remaining, { count: demo.goalTotal - demo.goalDone })}
              </p>
            </div>
            <TargetIcon />
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
              <span className="text-subtle">
                <ChevronIcon />
              </span>
            </Link>
          ))}
        </div>

        {/* язык интерфейса */}
        <div className="mt-4 flex items-center justify-between gap-3 rounded-3xl border border-line/60 bg-white px-5 py-4">
          <span className="flex items-center gap-2.5 text-sm font-medium">
            <span className="text-subtle">
              <GlobeIcon />
            </span>
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

/* ---------- иконки ---------- */

function BookIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M12 6.5C10.8 4.9 8.4 4.2 4.5 4.5a1 1 0 0 0-.9 1v11.6a1 1 0 0 0 1.1 1c3.4-.2 5.5.4 7.3 1.9 1.8-1.5 3.9-2.1 7.3-1.9a1 1 0 0 0 1.1-1V5.5a1 1 0 0 0-.9-1c-3.9-.3-6.3.4-7.5 2Z"
        fill="currentColor"
      />
      <path d="M12 6.5V20" stroke="#fff" strokeWidth="1.4" strokeLinecap="round" opacity="0.6" />
    </svg>
  );
}

function FlameIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M12 3s1 2.4 1 4.2c1.1-.6 2-1.7 2-1.7 2.4 2 4 4.6 4 7.5a7 7 0 0 1-14 0c0-4.4 4-6.5 7-10Z"
        fill="currentColor"
      />
      <path
        d="M12 19.5a3 3 0 0 1-3-3c0-1.7 1.6-2.7 3-4 1.4 1.3 3 2.3 3 4a3 3 0 0 1-3 3Z"
        fill="#fff"
        opacity="0.5"
      />
    </svg>
  );
}

function CalendarIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden>
      <rect x="3.5" y="5" width="17" height="15.5" rx="3" stroke="currentColor" strokeWidth="1.8" />
      <path d="M3.5 9.5h17M8 3v3.5M16 3v3.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
      <path d="m9.5 14.5 2 2 3.5-3.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function ChartIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden>
      <rect x="4" y="12" width="4" height="8" rx="1.2" fill="currentColor" />
      <rect x="10" y="8" width="4" height="12" rx="1.2" fill="currentColor" />
      <rect x="16" y="4" width="4" height="16" rx="1.2" fill="currentColor" />
    </svg>
  );
}

function CardsIcon() {
  return (
    <svg width="26" height="26" viewBox="0 0 24 24" fill="none" aria-hidden>
      <rect x="3" y="5" width="13" height="11" rx="2" fill="currentColor" />
      <path d="M6.5 9h6M6.5 12h4" stroke="#fff" strokeWidth="1.5" strokeLinecap="round" />
      <path
        d="M18.5 8.5h1.5a1 1 0 0 1 1 1V18a1 1 0 0 1-1 1h-9a1 1 0 0 1-1-1v-.5"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
      />
      <path d="M18 12.5v3M16.5 14h3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

function ChevronIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path d="m9 5 7 7-7 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function TargetSmallIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden>
      <circle cx="12" cy="12" r="8.5" stroke="currentColor" strokeWidth="1.8" />
      <circle cx="12" cy="12" r="4.5" stroke="currentColor" strokeWidth="1.8" />
      <circle cx="12" cy="12" r="1.4" fill="currentColor" />
    </svg>
  );
}

/** Мишень со стрелой для карточки «Сегодня». */
function TargetIcon() {
  return (
    <svg width="92" height="92" viewBox="0 0 96 96" className="shrink-0" aria-hidden>
      <ellipse cx="48" cy="86" rx="26" ry="5" fill="#93c5fd" opacity="0.4" />
      <path d="M20 82 q6 -8 12 -4" stroke="#86d3b2" strokeWidth="5" strokeLinecap="round" fill="none" />
      <path d="M76 82 q-6 -8 -12 -4" stroke="#86d3b2" strokeWidth="5" strokeLinecap="round" fill="none" />
      <circle cx="48" cy="48" r="34" fill="#3b82f6" />
      <circle cx="48" cy="48" r="26" fill="#ffffff" />
      <circle cx="48" cy="48" r="18" fill="#60a5fa" />
      <circle cx="48" cy="48" r="10" fill="#ffffff" />
      <circle cx="48" cy="48" r="4.5" fill="#2563eb" />
      <path d="M48 48 76 20" stroke="#1e40af" strokeWidth="4" strokeLinecap="round" />
      <path d="M76 20 88 17 79 8 76 20Z" fill="#f59e0b" />
    </svg>
  );
}

function HomeIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M4 10.5 12 4l8 6.5V19a1 1 0 0 1-1 1h-4.5v-5h-5v5H5a1 1 0 0 1-1-1v-8.5Z"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinejoin="round"
        fill="currentColor"
        fillOpacity="0.15"
      />
    </svg>
  );
}

function DumbbellIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path d="M8.5 12h7" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
      <rect x="4.5" y="8" width="3" height="8" rx="1.2" fill="currentColor" />
      <rect x="16.5" y="8" width="3" height="8" rx="1.2" fill="currentColor" />
      <rect x="2" y="10" width="2" height="4" rx="0.9" fill="currentColor" />
      <rect x="20" y="10" width="2" height="4" rx="0.9" fill="currentColor" />
    </svg>
  );
}

function ListIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden>
      <circle cx="5.5" cy="6.5" r="1.4" fill="currentColor" />
      <circle cx="5.5" cy="12" r="1.4" fill="currentColor" />
      <circle cx="5.5" cy="17.5" r="1.4" fill="currentColor" />
      <path d="M10 6.5h9M10 12h9M10 17.5h9" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" />
    </svg>
  );
}

function RepeatIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path d="M17.5 7.5a7 7 0 1 0 2 5" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" />
      <path d="M17.5 3.5v4h-4" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function GearIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M12 2.8 14 4.5l2.6-.5 1.4 2.3 2.5.9v2.7l1.7 2.1-1.7 2.1v2.7l-2.5.9-1.4 2.3-2.6-.5-2 1.7-2-1.7-2.6.5-1.4-2.3-2.5-.9v-2.7L1.8 12l1.7-2.1V7.2l2.5-.9 1.4-2.3 2.6.5 2-1.7Z"
        fill="currentColor"
        opacity="0.9"
      />
      <circle cx="12" cy="12" r="3.4" fill="#fff" />
    </svg>
  );
}

function UserIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden>
      <circle cx="12" cy="8" r="3.5" stroke="currentColor" strokeWidth="1.8" />
      <path d="M5 19.5c1.2-3 3.8-4.5 7-4.5s5.8 1.5 7 4.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}

function GlobeIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden>
      <circle cx="12" cy="12" r="8.5" stroke="currentColor" strokeWidth="1.7" />
      <path
        d="M3.5 12h17M12 3.5c2.2 2.3 3.4 5.3 3.4 8.5s-1.2 6.2-3.4 8.5c-2.2-2.3-3.4-5.3-3.4-8.5S9.8 5.8 12 3.5Z"
        stroke="currentColor"
        strokeWidth="1.7"
      />
    </svg>
  );
}
