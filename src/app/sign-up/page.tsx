import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { AuthCard } from "@/components/auth-card";
import { BookLogo } from "@/components/book-logo";
import { getSession } from "@/lib/session";

export const metadata: Metadata = { title: "Регистрация" };

export default async function SignUpPage() {
  const session = await getSession();
  if (session) redirect("/dashboard");

  return (
    <main className="flex-1 bg-white">
      <div className="mx-auto flex w-full max-w-md flex-col items-center px-5 pt-12 pb-8">
        <BookLogo />

        <h1 className="mt-5 text-center text-4xl font-bold tracking-tight">
          Создать аккаунт
        </h1>
        <p className="mt-2 max-w-64 text-center text-lg leading-snug text-subtle">
          Регистрируйтесь и учите глаголы каждый день
        </p>

        <div className="mt-8 w-full">
          <AuthCard mode="sign-up" />
        </div>
      </div>
    </main>
  );
}
