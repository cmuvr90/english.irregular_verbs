import { redirect } from "next/navigation";

import { AuthCard } from "@/components/auth-card";
import { BookLogo } from "@/components/book-logo";
import { InstallPrompt } from "@/components/install-prompt";
import { Mascot } from "@/components/mascot";
import { getSession } from "@/lib/session";

const features = [
  {
    icon: <CalendarIcon />,
    chip: "bg-green-100 text-green-600 dark:bg-green-500/15 dark:text-green-400",
    label: "Ежедневная практика",
  },
  {
    icon: <FlameIcon />,
    chip: "bg-orange-100 text-orange-500 dark:bg-orange-500/15 dark:text-orange-400",
    label: "Улучшайте серию",
  },
  {
    icon: <ChartIcon />,
    chip: "bg-violet-100 text-violet-600 dark:bg-violet-500/15 dark:text-violet-400",
    label: "Отмечайте прогресс",
  },
];

export default async function Home() {
  // Авторизованным стартовый экран не нужен — сразу в кабинет.
  const session = await getSession();
  if (session) redirect("/dashboard");

  return (
    <main className="flex-1 bg-white">
      <div className="mx-auto flex w-full max-w-md flex-col items-center px-5 pt-12 pb-8">
        <BookLogo />

        <h1 className="mt-5 text-center text-4xl font-bold tracking-tight">
          Irregular Verbs
        </h1>
        <p className="mt-2 max-w-60 text-center text-lg leading-snug text-subtle">
          Изучение английских неправильных глаголов
        </p>

        <Mascot className="mt-2 w-full max-w-sm" />

        <AuthCard mode="sign-in" />

        {/* преимущества */}
        <div className="mt-5 w-full rounded-3xl border border-line/60 bg-white p-5">
          <ul className="grid grid-cols-3 divide-x divide-line/70">
            {features.map((f) => (
              <li key={f.label} className="flex flex-col items-center gap-2 px-2 text-center">
                <span className={`flex size-11 items-center justify-center rounded-2xl ${f.chip}`}>
                  {f.icon}
                </span>
                <span className="text-xs leading-tight text-foreground/80">{f.label}</span>
              </li>
            ))}
          </ul>
          <p className="mt-5 flex items-center justify-center gap-2 text-sm text-subtle">
            <HeartIcon />
            Учите неправильные глаголы каждый день
          </p>
        </div>

        <InstallPrompt />
      </div>
    </main>
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

function FlameIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M12 3s1 2.4 1 4.2c1.1-.6 2-1.7 2-1.7 2.4 2 4 4.6 4 7.5a7 7 0 0 1-14 0c0-4.4 4-6.5 7-10Z"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinejoin="round"
      />
      <path d="M12 19.5a3 3 0 0 1-3-3c0-1.7 1.6-2.7 3-4 1.4 1.3 3 2.3 3 4a3 3 0 0 1-3 3Z" fill="currentColor" />
    </svg>
  );
}

function ChartIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden>
      <rect x="4" y="12" width="4" height="8" rx="1.2" fill="currentColor" />
      <rect x="10" y="8" width="4" height="12" rx="1.2" fill="currentColor" />
      <rect x="16" y="4" width="4" height="16" rx="1.2" fill="currentColor" />
    </svg>
  );
}

function HeartIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M12 20.5S3.5 15.5 3.5 9.7A4.7 4.7 0 0 1 12 7a4.7 4.7 0 0 1 8.5 2.7c0 5.8-8.5 10.8-8.5 10.8Z"
        fill="#3b82f6"
      />
    </svg>
  );
}
