import path from "node:path";

import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Dev-сервер блокирует cross-origin запросы к /_next/* — без этого страница,
  // открытая по LAN-адресу, не гидрируется и интерфейс не реагирует.
  // Шаблон покрывает любой адрес домашней сети, IP выдаётся по DHCP.
  allowedDevOrigins: ["192.168.*.*"],
  // Выше по дереву лежит чужой package-lock.json — фиксируем корень явно,
  // иначе Turbopack выбирает не ту директорию.
  turbopack: {
    root: path.resolve(__dirname),
  },
  // Картинки глаголов лежат в Vercel Blob. Новые (verbs/images/) админка
  // сжимает ещё в браузере, и они идут мимо оптимизатора (unoptimized, см.
  // isPrecompressedImage) — шаблон им не нужен. Оптимизатор пережимает только
  // старые verbs/<имя>-<суффикс>.png, загруженные без сжатия; шаблон уйдёт
  // вместе с ними, когда все картинки заменят.
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "*.public.blob.vercel-storage.com",
        port: "",
        pathname: "/verbs/*",
        search: "",
      },
    ],
  },
  experimental: {
    serverActions: {
      // Загрузка картинки и озвучки глагола идёт через server action. Картинка —
      // до 2 МБ, озвучка — три файла по 1 МБ (MAX_IMAGE_BYTES и MAX_AUDIO_BYTES
      // в admin-actions.ts), сверху запас на multipart-разметку. На Vercel тело
      // запроса функции всё равно ограничено 4,5 МБ, поэтому крупнее не поднимаем.
      bodySizeLimit: "4mb",
    },
  },
};

export default nextConfig;
