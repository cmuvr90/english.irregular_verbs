import type { MetadataRoute } from "next";

/**
 * Web App Manifest — благодаря ему сайт ставится на домашний экран телефона
 * и открывается в отдельном окне без адресной строки (display: standalone).
 * Next.js отдаёт его по /manifest.webmanifest и сам подключает в <head>.
 */
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Irregular Verbs — английские неправильные глаголы",
    short_name: "Irregular Verbs",
    description:
      "Тренажёр английских неправильных глаголов: Next.js, Prisma, Better Auth",
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