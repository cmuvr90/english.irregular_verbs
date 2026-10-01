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
  // Картинки глаголов лежат в Vercel Blob; разрешаем next/image только наш
  // путь verbs/ на поддоменах хранилища — чужие URL оптимизатор не возьмёт.
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "*.public.blob.vercel-storage.com",
        port: "",
        pathname: "/verbs/**",
        search: "",
      },
    ],
  },
  experimental: {
    serverActions: {
      // Загрузка картинки глагола идёт через server action. Сама картинка —
      // до 2 МБ (MAX_IMAGE_BYTES в admin-actions.ts), сверху запас на
      // multipart-разметку. На Vercel тело запроса функции всё равно
      // ограничено 4,5 МБ, поэтому крупнее не поднимаем.
      bodySizeLimit: "3mb",
    },
  },
};

export default nextConfig;
