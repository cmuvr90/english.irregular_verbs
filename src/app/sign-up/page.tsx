import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { AuthForm } from "@/components/auth-form";
import { SiteHeader } from "@/components/site-header";
import { getSession } from "@/lib/session";

export const metadata: Metadata = { title: "Регистрация" };

export default async function SignUpPage() {
  const session = await getSession();
  if (session) redirect("/dashboard");

  return (
    <>
      <SiteHeader />
      <main className="flex flex-1 items-center justify-center px-6 py-16">
        <AuthForm mode="sign-up" />
      </main>
    </>
  );
}
