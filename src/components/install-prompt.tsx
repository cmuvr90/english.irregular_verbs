"use client";

import { useEffect, useState } from "react";

import type { Dictionary } from "@/lib/dictionaries/en";
import { IconClose, IconRocket } from "@/ui/icons";
import { Button } from "@/ui/primitives/button";
import { Card } from "@/ui/primitives/card";
import { IconButton } from "@/ui/primitives/icon-button";
import { IconTile } from "@/ui/primitives/icon-tile";

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
      <Card variant="glass" padding="sm" className="mx-auto flex max-w-md items-center gap-3">
        <IconTile icon={IconRocket} tone="ink" variant="solid" size="md" />
        <div className="min-w-0 flex-1">
          <p className="t-label font-semibold text-fg-strong">{dict.title}</p>
          <p className="t-caption mt-0.5 text-fg-muted">{installEvent ? dict.subtitle : dict.iosHint}</p>
        </div>

        {installEvent && (
          <Button
            size="sm"
            onClick={async () => {
              await installEvent.prompt();
              const { outcome } = await installEvent.userChoice;
              if (outcome === "dismissed") localStorage.setItem(DISMISSED_KEY, "1");
              setInstallEvent(null);
            }}
          >
            {dict.action}
          </Button>
        )}

        <IconButton icon={IconClose} label={dict.dismiss} variant="ghost" size="sm" onClick={dismiss} />
      </Card>
    </div>
  );
}
