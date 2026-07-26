import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin", "cyrillic"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "Irregular Verbs — английские неправильные глаголы",
    template: "%s — Irregular Verbs",
  },
  description: "Изучение английских неправильных глаголов",
  applicationName: "Irregular Verbs",
  // iOS не читает manifest полностью — режим «как приложение» включается этими метатегами.
  appleWebApp: {
    capable: true,
    title: "Irregular Verbs",
    statusBarStyle: "black-translucent",
  },
};

// Приложение всегда светлое — системные панели браузера/ОС красим в белый.
export const viewport: Viewport = {
  themeColor: "#ffffff",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="ru"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col">{children}</body>
    </html>
  );
}
