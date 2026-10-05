"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { signIn, signUp } from "@/lib/auth-client";
import type { Dictionary } from "@/lib/dictionaries/en";
import { IconHide, IconLock, IconMail, IconProfile, IconShow } from "@/ui/icons";
import { Button } from "@/ui/primitives/button";
import { Card } from "@/ui/primitives/card";
import { IconButton } from "@/ui/primitives/icon-button";
import { TextField } from "@/ui/primitives/text-field";

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
    <Card padding="lg" className="w-full shadow-lg">
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        {/* Подпись поля — плейсхолдер; для скринридера дублируем её в aria-label. */}
        {isSignUp && (
          <TextField
            name="name"
            type="text"
            autoComplete="name"
            placeholder={dict.namePlaceholder}
            aria-label={dict.namePlaceholder}
            required
            icon={IconProfile}
          />
        )}

        <TextField
          name="email"
          type="email"
          autoComplete="email"
          placeholder={dict.emailPlaceholder}
          aria-label={dict.emailPlaceholder}
          required
          icon={IconMail}
        />

        <TextField
          name="password"
          type={showPassword ? "text" : "password"}
          autoComplete={isSignUp ? "new-password" : "current-password"}
          placeholder={dict.passwordPlaceholder}
          aria-label={dict.passwordPlaceholder}
          minLength={8}
          required
          icon={IconLock}
          action={
            <IconButton
              icon={showPassword ? IconHide : IconShow}
              label={showPassword ? dict.hidePassword : dict.showPassword}
              variant="ghost"
              size="sm"
              onClick={() => setShowPassword((v) => !v)}
            />
          }
        />

        {error && (
          <p role="alert" className="t-body-sm rounded-md bg-berry-50 px-4 py-2.5 text-berry-700 ring-1 ring-berry-200">
            {error}
          </p>
        )}

        <Button type="submit" size="lg" block loading={pending} className="mt-1">
          {pending ? t.pending : t.submit}
        </Button>
      </form>

      <p className="t-body-sm mt-5 text-center">
        <span className="text-fg-muted">{t.hint} </span>
        <Link href={t.hintHref} className="font-semibold text-fg-link hover:underline">
          {t.hintLink}
        </Link>
      </p>
    </Card>
  );
}
