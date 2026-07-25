import path from "node:path";

import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Выше по дереву лежит чужой package-lock.json — фиксируем корень явно,
  // иначе Turbopack выбирает не ту директорию.
  turbopack: {
    root: path.resolve(__dirname),
  },
};

export default nextConfig;
