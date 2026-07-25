"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import { signOut } from "@/lib/auth-client";

export function SignOutButton() {
  const router = useRouter();
  const [pending, setPending] = useState(false);

  return (
    <button
      type="button"
      disabled={pending}
      onClick={async () => {
        setPending(true);
        await signOut();
        router.push("/");
        router.refresh();
      }}
      className="rounded-lg border border-line px-3 py-1.5 text-sm font-medium transition-colors hover:bg-muted disabled:opacity-50"
    >
      {pending ? "Выходим…" : "Выйти"}
    </button>
  );
}
