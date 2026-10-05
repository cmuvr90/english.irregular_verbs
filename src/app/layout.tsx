import type { Metadata, Viewport } from "next";
import "./globals.css";

import { TimeZoneSync } from "@/components/time-zone-sync";
import { getDictionary } from "@/lib/dictionaries";
import { getLocale } from "@/lib/i18n";
import { MotionProvider } from "@/ui/motion/provider";

import { fontVariables } from "./fonts";

export async function generateMetadata(): Promise<Metadata> {
  const dict = await getDictionary(await getLocale());

  return {
    title: {
      default: dict.meta.title,
      template: dict.meta.titleTemplate,
    },
    description: dict.meta.description,
    applicationName: dict.common.appName,
    // iOS не читает manifest полностью — режим «как приложение» включается этими метатегами.
    appleWebApp: {
      capable: true,
      title: dict.common.appName,
      statusBarStyle: "black-translucent",
    },
  };
}

// Приложение всегда светлое — системные панели браузера/ОС красим в белый.
export const viewport: Viewport = {
  themeColor: "#ffffff",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const locale = await getLocale();

  return (
    <html
      lang={locale}
      className={`${fontVariables} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col">
        <MotionProvider>{children}</MotionProvider>
        <TimeZoneSync />
      </body>
    </html>
  );
}
