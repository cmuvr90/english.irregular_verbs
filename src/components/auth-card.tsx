"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { EyeIcon, EyeOffIcon, LockIcon, MailIcon, UserIcon } from "@/components/icons";
import { signIn, signUp } from "@/lib/auth-client";
import type { Dictionary } from "@/lib/dictionaries/en";

type Mode = "sign-in" | "sign-up";

/** Карточка входа/регистрации стартового экрана: поля с иконками, пароль с «глазом». */
export function AuthCard({ mode, dict }: { mode: Mode; dict: Dictionary["auth"] }) {
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);

  const isSignUp = mode === "sign-up";
  const t = {
    submit: isSignUp ? dict.signUp : dict.signIn,
    pending: isSignUp ? dict.signingUp : dict.signingIn,
    hint: isSignUp ? dict.haveAccount : dict.noAccount,
    hintLink: isSignUp ? dict.signIn : dict.signUp,
    hintHref: isSignUp ? "/" : "/sign-up",
  };

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPending(true);
    setError(null);

    const form = new FormData(event.currentTarget);
    const email = String(form.get("email") ?? "");
    const password = String(form.get("password") ?? "");

    const result = isSignUp
      ? await signUp.email({ email, password, name: String(form.get("name") ?? "") })
      : await signIn.email({ email, password });

    if (result.error) {
      // Коды приходят строками: незнакомый код падает на сообщение библиотеки.
      const translated: Record<string, string | undefined> = dict.errors;
      setError(
        translated[result.error.code ?? ""] ?? result.error.message ?? dict.errors.generic,
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
        {isSignUp && (
          <Field
            name="name"
            type="text"
            autoComplete="name"
            placeholder={dict.namePlaceholder}
            required
            icon={<UserIcon size={20} />}
          />
        )}

        <Field
          name="email"
          type="email"
          autoComplete="email"
          placeholder={dict.emailPlaceholder}
          required
          icon={<MailIcon size={20} />}
        />

        <Field
          name="password"
          type={showPassword ? "text" : "password"}
          autoComplete={isSignUp ? "new-password" : "current-password"}
          placeholder={dict.passwordPlaceholder}
          minLength={8}
          required
          icon={<LockIcon size={20} />}
          action={
            <button
              type="button"
              onClick={() => setShowPassword((v) => !v)}
              aria-label={showPassword ? dict.hidePassword : dict.showPassword}
              className="absolute inset-y-0 right-4 flex items-center text-subtle transition-colors hover:text-foreground"
            >
              {showPassword ? <EyeOffIcon size={20} /> : <EyeIcon size={20} />}
            </button>
          }
        />

        {error && (
          <p
            role="alert"
            className="rounded-2xl border border-red-500/30 bg-red-500/10 px-4 py-2.5 text-sm text-red-600"
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
        <Link href={t.hintHref} className="font-medium text-blue-600 hover:underline">
          {t.hintLink}
        </Link>
      </p>
    </div>
  );
}

/** Поле с иконкой слева и опциональной кнопкой справа (переключатель пароля). */
function Field({
  icon,
  action,
  placeholder,
  ...props
}: {
  icon: React.ReactNode;
  action?: React.ReactNode;
} & React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <label className="relative block">
      <span className="sr-only">{placeholder}</span>
      <span className="pointer-events-none absolute inset-y-0 left-4 flex items-center text-subtle">
        {icon}
      </span>
      <input
        placeholder={placeholder}
        className={`w-full rounded-2xl border border-line bg-transparent py-3.5 pl-12 text-base outline-none transition-colors placeholder:text-subtle/70 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 ${
          action ? "pr-12" : "pr-4"
        }`}
        {...props}
      />
      {action}
    </label>
  );
}
