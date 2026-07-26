"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import { SignOutIcon } from "@/components/icons";
import { signOut } from "@/lib/auth-client";

/** Круглая иконка-кнопка выхода для шапки кабинета. */
export function SignOutButton({ label }: { label: string }) {
  const router = useRouter();
  const [pending, setPending] = useState(false);

  return (
    <button
      type="button"
      disabled={pending}
      aria-label={label}
      title={label}
      onClick={async () => {
        setPending(true);
        await signOut();
        router.push("/");
        router.refresh();
      }}
      className="flex size-11 items-center justify-center rounded-full border border-line/60 bg-white text-subtle shadow-sm transition-colors hover:text-red-500 disabled:opacity-50"
    >
      <SignOutIcon />
    </button>
  );
}
