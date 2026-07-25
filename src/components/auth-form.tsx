"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { signIn, signUp } from "@/lib/auth-client";

type Mode = "sign-in" | "sign-up";

const copy = {
  "sign-in": {
    title: "Вход в кабинет",
    submit: "Войти",
    pending: "Входим…",
    hint: "Нет аккаунта?",
    hintLink: "Зарегистрироваться",
    hintHref: "/sign-up",
  },
  "sign-up": {
    title: "Регистрация",
    submit: "Создать аккаунт",
    pending: "Создаём…",
    hint: "Уже есть аккаунт?",
    hintLink: "Войти",
    hintHref: "/sign-in",
  },
} satisfies Record<Mode, Record<string, string>>;

/** Better Auth отдаёт сообщения на английском — переводим по коду ошибки. */
const errorMessages: Record<string, string> = {
  INVALID_EMAIL_OR_PASSWORD: "Неверная почта или пароль",
  USER_ALREADY_EXISTS: "Пользователь с такой почтой уже зарегистрирован",
  USER_ALREADY_EXISTS_USE_ANOTHER_EMAIL:
    "Пользователь с такой почтой уже зарегистрирован",
  PASSWORD_TOO_SHORT: "Пароль слишком короткий — минимум 8 символов",
  PASSWORD_TOO_LONG: "Пароль слишком длинный",
  INVALID_EMAIL: "Некорректный адрес почты",
  EMAIL_NOT_VERIFIED: "Почта не подтверждена",
};

export function AuthForm({ mode }: { mode: Mode }) {
  const t = copy[mode];
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

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
        (code && errorMessages[code]) ??
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
    <div className="w-full max-w-sm">
      <h1 className="text-2xl font-semibold tracking-tight">{t.title}</h1>
      <p className="mt-2 text-sm text-subtle">
        {mode === "sign-up"
          ? "Пароль — минимум 8 символов."
          : "Введите почту и пароль, указанные при регистрации."}
      </p>

      <form onSubmit={handleSubmit} className="mt-8 space-y-4">
        {mode === "sign-up" && (
          <Field
            label="Имя"
            name="name"
            type="text"
            autoComplete="name"
            placeholder="Иван Иванов"
            required
          />
        )}

        <Field
          label="Почта"
          name="email"
          type="email"
          autoComplete="email"
          placeholder="you@example.com"
          required
        />

        <Field
          label="Пароль"
          name="password"
          type="password"
          autoComplete={mode === "sign-up" ? "new-password" : "current-password"}
          placeholder="••••••••"
          minLength={8}
          required
        />

        {error && (
          <p
            role="alert"
            className="rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-600 dark:text-red-400"
          >
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={pending}
          className="w-full rounded-lg bg-foreground px-4 py-2.5 text-sm font-medium text-background transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {pending ? t.pending : t.submit}
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-subtle">
        {t.hint}{" "}
        <Link href={t.hintHref} className="font-medium text-foreground underline underline-offset-4">
          {t.hintLink}
        </Link>
      </p>
    </div>
  );
}

function Field({
  label,
  name,
  ...props
}: { label: string; name: string } & React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <div className="space-y-1.5">
      <label htmlFor={name} className="block text-sm font-medium">
        {label}
      </label>
      <input
        id={name}
        name={name}
        className="w-full rounded-lg border border-line bg-card px-3 py-2 text-sm outline-none transition-colors placeholder:text-subtle/60 focus:border-foreground/40 focus:ring-2 focus:ring-foreground/10"
        {...props}
      />
    </div>
  );
}
