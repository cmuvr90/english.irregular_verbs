"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import { signOut } from "@/lib/auth-client";

/** Круглая иконка-кнопка выхода для шапки кабинета. */
export function SignOutButton() {
  const router = useRouter();
  const [pending, setPending] = useState(false);

  return (
    <button
      type="button"
      disabled={pending}
      aria-label="Выйти"
      title="Выйти"
      onClick={async () => {
        setPending(true);
        await signOut();
        router.push("/");
        router.refresh();
      }}
      className="flex size-11 items-center justify-center rounded-full border border-line/60 bg-white text-subtle shadow-sm transition-colors hover:text-red-500 disabled:opacity-50"
    >
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden>
        <path
          d="M14 4h-7a1 1 0 0 0-1 1v14a1 1 0 0 0 1 1h7M10 12h11m0 0-3.5-3.5M21 12l-3.5 3.5"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </button>
  );
}
