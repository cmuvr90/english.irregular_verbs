"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { signIn, signUp } from "@/lib/auth-client";
import { authErrorMessages } from "@/lib/auth-errors";

type Mode = "sign-in" | "sign-up";

const copy = {
  "sign-in": {
    submit: "Войти",
    pending: "Входим…",
    hint: "Нет аккаунта?",
    hintLink: "Создать аккаунт",
    hintHref: "/sign-up",
  },
  "sign-up": {
    submit: "Создать аккаунт",
    pending: "Создаём…",
    hint: "Уже есть аккаунт?",
    hintLink: "Войти",
    hintHref: "/",
  },
} satisfies Record<Mode, Record<string, string>>;

/** Карточка входа/регистрации стартового экрана: поля с иконками, пароль с «глазом». */
export function AuthCard({ mode }: { mode: Mode }) {
  const t = copy[mode];
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPending(true);
    setError(null);

    const form = new FormData(event.currentTarget);
    const email = String(form.get("email") ?? "");
    const password = String(form.get("password") ?? "");

    const result =
      mode === "sign-up"
        ? await signUp.email({
            email,
            password,
            name: String(form.get("name") ?? ""),
          })
        : await signIn.email({ email, password });

    if (result.error) {
      const code = result.error.code;
      setError(
        (code && authErrorMessages[code]) ??
          result.error.message ??
          "Что-то пошло не так, попробуйте ещё раз",
      );
      setPending(false);
      return;
    }

    // refresh, чтобы серверные компоненты увидели свежую сессию
    router.push("/dashboard");
    router.refresh();
  }

  return (
    <div className="w-full rounded-3xl border border-line/60 bg-white p-5 shadow-[0_16px_48px_rgba(59,130,246,0.10)] sm:p-6">
      <form onSubmit={handleSubmit} className="space-y-4">
        {mode === "sign-up" && (
          <Field name="name" type="text" autoComplete="name" placeholder="Имя" required icon={<UserIcon />} />
        )}

        <Field name="email" type="email" autoComplete="email" placeholder="Email" required icon={<MailIcon />} />

        <label className="relative block">
          <span className="sr-only">Пароль</span>
          <span className="pointer-events-none absolute inset-y-0 left-4 flex items-center text-subtle">
            <LockIcon />
          </span>
          <input
            name="password"
            type={showPassword ? "text" : "password"}
            autoComplete={mode === "sign-up" ? "new-password" : "current-password"}
            placeholder="Пароль"
            minLength={8}
            required
            className="w-full rounded-2xl border border-line bg-transparent py-3.5 pr-12 pl-12 text-base outline-none transition-colors placeholder:text-subtle/70 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
          />
          <button
            type="button"
            onClick={() => setShowPassword((v) => !v)}
            aria-label={showPassword ? "Скрыть пароль" : "Показать пароль"}
            className="absolute inset-y-0 right-4 flex items-center text-subtle transition-colors hover:text-foreground"
          >
            {showPassword ? <EyeOffIcon /> : <EyeIcon />}
          </button>
        </label>

        {error && (
          <p
            role="alert"
            className="rounded-2xl border border-red-500/30 bg-red-500/10 px-4 py-2.5 text-sm text-red-600 dark:text-red-400"
          >
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={pending}
          className="w-full rounded-2xl bg-blue-600 py-3.5 text-base font-medium text-white transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {pending ? t.pending : t.submit}
        </button>
      </form>

      <p className="mt-5 text-center text-sm">
        <span className="text-subtle">{t.hint} </span>
        <Link
          href={t.hintHref}
          className="font-medium text-blue-600 hover:underline dark:text-blue-400"
        >
          {t.hintLink}
        </Link>
      </p>
    </div>
  );
}

function Field({
  icon,
  name,
  placeholder,
  ...props
}: { icon: React.ReactNode } & React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <label className="relative block">
      <span className="sr-only">{placeholder}</span>
      <span className="pointer-events-none absolute inset-y-0 left-4 flex items-center text-subtle">
        {icon}
      </span>
      <input
        name={name}
        placeholder={placeholder}
        className="w-full rounded-2xl border border-line bg-transparent py-3.5 pr-4 pl-12 text-base outline-none transition-colors placeholder:text-subtle/70 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
        {...props}
      />
    </label>
  );
}

function UserIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden>
      <circle cx="12" cy="8" r="3.5" stroke="currentColor" strokeWidth="1.7" />
      <path d="M5 19.5c1.2-3 3.8-4.5 7-4.5s5.8 1.5 7 4.5" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
    </svg>
  );
}

function MailIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden>
      <rect x="3" y="5" width="18" height="14" rx="2.5" stroke="currentColor" strokeWidth="1.7" />
      <path d="m4 7 8 6 8-6" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function LockIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden>
      <rect x="5" y="10" width="14" height="10" rx="2.5" stroke="currentColor" strokeWidth="1.7" />
      <path d="M8 10V7.5a4 4 0 0 1 8 0V10" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
      <circle cx="12" cy="15" r="1.4" fill="currentColor" />
    </svg>
  );
}

function EyeIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M2.5 12S6 5.5 12 5.5 21.5 12 21.5 12 18 18.5 12 18.5 2.5 12 2.5 12Z"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinejoin="round"
      />
      <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="1.7" />
    </svg>
  );
}

function EyeOffIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M4 4l16 16M9.9 6.1A9.6 9.6 0 0 1 12 5.5c6 0 9.5 6.5 9.5 6.5a17.6 17.6 0 0 1-3.2 3.9M6 8a17 17 0 0 0-3.5 4S6 18.5 12 18.5c1 0 2-.2 2.8-.5M10 10.1a3 3 0 0 0 4 4.2"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
