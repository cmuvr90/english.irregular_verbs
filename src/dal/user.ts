import "server-only";

import { prisma } from "@/lib/prisma";

/**
 * Слой доступа к данным (Data Access Layer).
 *
 * Все запросы к базе живут здесь, а не в компонентах страниц: когда моделей
 * станет больше, это единственное место, которое придётся править при смене
 * схемы, и единственное, что нужно покрывать тестами.
 *
 * `server-only` гарантирует ошибку сборки, если этот модуль случайно
 * импортируют в клиентский компонент и утащат подключение к базе в браузер.
 */

export async function getUserById(id: string) {
  return prisma.user.findUnique({
    where: { id },
    select: {
      id: true,
      name: true,
      email: true,
      emailVerified: true,
      createdAt: true,
    },
  });
}

