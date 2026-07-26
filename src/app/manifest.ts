import type { MetadataRoute } from "next";

/**
 * Web App Manifest — благодаря ему сайт ставится на домашний экран телефона
 * и открывается в отдельном окне без адресной строки (display: standalone).
 * Next.js отдаёт его по /manifest.webmanifest и сам подключает в <head>.
 *
 * Манифест статичный и запрашивается браузером без cookie, поэтому он всегда
 * на языке по умолчанию (английском) — интерфейс внутри приложения при этом
 * переводится (см. src/lib/i18n.ts).
 */
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Irregular Verbs — learn English irregular verbs",
    short_name: "Irregular Verbs",
    description: "Learn English irregular verbs",
    start_url: "/",
    display: "standalone",
    background_color: "#ffffff",
    theme_color: "#ffffff",
    icons: [
      { src: "/icon-192.png", sizes: "192x192", type: "image/png" },
      { src: "/icon-512.png", sizes: "512x512", type: "image/png" },
      {
        src: "/icon-maskable-192.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "maskable",
      },
      {
        src: "/icon-maskable-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],
  };
}