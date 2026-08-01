import { config } from "dotenv";

// Сид запускается вне Next.js — .env.local нужно подгрузить самим,
// причём до импорта prisma-клиента (он читает DATABASE_URL при загрузке).
config({ path: [".env.local", ".env"], quiet: true });

import { groups } from "./seed-data/groups";
import { trainers } from "./seed-data/trainers";
import { verbs } from "./seed-data/verbs";

async function main() {
  const { prisma } = await import("../src/lib/prisma");

  // Группы: upsert по key — сид можно запускать многократно.
  const groupIdByKey = new Map<string, string>();
  for (const group of groups) {
    const row = await prisma.verbGroup.upsert({
      where: { key: group.key },
      create: { key: group.key, name: group.name, description: group.description },
      update: { name: group.name, description: group.description },
    });
    groupIdByKey.set(group.key, row.id);
  }

  // Глаголы: upsert по уникальной тройке форм.
  const links: { verbId: string; verbGroupId: string }[] = [];
  for (const verb of verbs) {
    const [form1, form2, form3] = verb.forms;
    const row = await prisma.verb.upsert({
      where: { form1_form2_form3: { form1, form2, form3 } },
      create: { form1, form2, form3, translation: verb.translation },
      update: { translation: verb.translation },
    });

    for (const key of verb.groups) {
      const verbGroupId = groupIdByKey.get(key);
      if (!verbGroupId) throw new Error(`Глагол ${form1}: неизвестная группа "${key}"`);
      links.push({ verbId: row.id, verbGroupId });
    }
  }

  // Связи перестраиваем целиком: состав групп задаётся только сидом.
  await prisma.verbGroupLink.deleteMany();
  await prisma.verbGroupLink.createMany({ data: links });

  // Тренажёры: upsert по key, прогресс студентов не трогаем.
  for (const trainer of trainers) {
    await prisma.trainer.upsert({
      where: { key: trainer.key },
      create: {
        key: trainer.key,
        name: trainer.name,
        description: trainer.description,
        settings: trainer.settings,
      },
      update: {
        name: trainer.name,
        description: trainer.description,
        settings: trainer.settings,
      },
    });
  }

  console.log(
    `Сид завершён: групп — ${groups.length}, глаголов — ${verbs.length}, связей — ${links.length}, тренажёров — ${trainers.length}.`,
  );
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
