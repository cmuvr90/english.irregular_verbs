"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import { signOut } from "@/lib/auth-client";
import { IconSignOut } from "@/ui/icons";
import { IconButton } from "@/ui/primitives/icon-button";

/** Круглая иконка-кнопка выхода для шапки кабинета. */
export function SignOutButton({ label }: { label: string }) {
  const router = useRouter();
  const [pending, setPending] = useState(false);

  return (
    <IconButton
      icon={IconSignOut}
      label={label}
      disabled={pending}
      onClick={async () => {
        setPending(true);
        await signOut();
        router.push("/");
        router.refresh();
      }}
      className="hover:text-berry-600 disabled:opacity-50"
    />
  );
}
