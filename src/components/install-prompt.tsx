"use client";

import { useEffect, useState } from "react";

import type { Dictionary } from "@/lib/dictionaries/en";

/**
 * Плашка «Установить приложение».
 *
 * Android/Chrome даёт событие beforeinstallprompt — перехватываем его и по
 * кнопке открываем родной диалог установки. На iOS такого API нет, поэтому
 * показываем короткую инструкцию (Поделиться → На экран «Домой»).
 *
 * Плашка не показывается внутри уже установленного приложения (standalone)
 * и после закрытия крестиком (запоминаем в localStorage).
 */

// beforeinstallprompt не описан в стандартных типах TS
interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

const DISMISSED_KEY = "install-prompt-dismissed";

export function InstallPrompt({ dict }: { dict: Dictionary["install"] }) {
  const [installEvent, setInstallEvent] = useState<BeforeInstallPromptEvent | null>(null);
  const [showIOSHint, setShowIOSHint] = useState(false);

  useEffect(() => {
    // Уже открыто как приложение или пользователь закрывал плашку — молчим.
    const standalone =
      window.matchMedia("(display-mode: standalone)").matches ||
      ("standalone" in navigator && (navigator as { standalone?: boolean }).standalone);
    if (standalone || localStorage.getItem(DISMISSED_KEY)) return;

    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
    if (isIOS) {
      // Отложенно: синхронный setState в эффекте вызывает каскадный ререндер.
      const t = setTimeout(() => setShowIOSHint(true), 0);
      return () => clearTimeout(t);
    }

    const onPrompt = (e: Event) => {
      e.preventDefault(); // не даём Chrome показать свою мини-плашку
      setInstallEvent(e as BeforeInstallPromptEvent);
    };
    const onInstalled = () => setInstallEvent(null);

    window.addEventListener("beforeinstallprompt", onPrompt);
    window.addEventListener("appinstalled", onInstalled);
    return () => {
      window.removeEventListener("beforeinstallprompt", onPrompt);
      window.removeEventListener("appinstalled", onInstalled);
    };
  }, []);

  if (!installEvent && !showIOSHint) return null;

  const dismiss = () => {
    localStorage.setItem(DISMISSED_KEY, "1");
    setInstallEvent(null);
    setShowIOSHint(false);
  };

  return (
    // В потоке страницы, а не fixed: плавающая плашка перекрывала ссылки
    // внизу экрана на мобильных.
    <div className="w-full pt-4 pb-[max(0px,env(safe-area-inset-bottom))]">
      <div className="mx-auto flex max-w-md items-center gap-3 rounded-xl border border-line bg-white p-4 shadow-lg">
        <div className="min-w-0 flex-1">
          <p className="text-sm font-medium">{dict.title}</p>
          {installEvent ? (
            <p className="mt-0.5 text-xs text-subtle">{dict.subtitle}</p>
          ) : (
            <p className="mt-0.5 text-xs text-subtle">
              <ShareIcon /> {dict.iosHint}
            </p>
          )}
        </div>

        {installEvent && (
          <button
            type="button"
            onClick={async () => {
              await installEvent.prompt();
              const { outcome } = await installEvent.userChoice;
              if (outcome === "dismissed") localStorage.setItem(DISMISSED_KEY, "1");
              setInstallEvent(null);
            }}
            className="shrink-0 rounded-lg bg-blue-600 px-3 py-1.5 text-sm font-medium text-white transition-colors hover:bg-blue-700"
          >
            {dict.action}
          </button>
        )}

        <button
          type="button"
          onClick={dismiss}
          aria-label={dict.dismiss}
          className="shrink-0 rounded-lg p-1.5 text-subtle transition-colors hover:bg-muted"
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden>
            <path d="M4 4l8 8m0-8l-8 8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
        </button>
      </div>
    </div>
  );
}

/** Значок «Поделиться» из iOS — чтобы инструкция узнавалась визуально. */
function ShareIcon() {
  return (
    <svg
      className="inline-block align-[-2px]"
      width="14"
      height="14"
      viewBox="0 0 16 16"
      fill="none"
      aria-hidden
    >
      <path
        d="M8 1v9M5 3.5L8 1l3 2.5M3.5 7H3a1 1 0 0 0-1 1v6a1 1 0 0 0 1 1h10a1 1 0 0 0 1-1V8a1 1 0 0 0-1-1h-.5"
        stroke="currentColor"
        strokeWidth="1.3"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
