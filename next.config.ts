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
};

export default nextConfig;
