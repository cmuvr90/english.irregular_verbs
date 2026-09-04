import { config } from "dotenv";

// Сид запускается вне Next.js — .env.local нужно подгрузить самим,
// причём до импорта prisma-клиента (он читает DATABASE_URL при загрузке).
config({ path: [".env.local", ".env"], quiet: true });

import { validateSentence } from "../src/lib/sentence-options";
import { groups } from "./seed-data/groups";
import { sentences } from "./seed-data/sentences";
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
  // form1 → id: предложения ссылаются на глагол первой формой. Одна form1 при
  // разных тройках допустима (см. комментарий у @@unique в schema.prisma:
  // lie – lay – lain и lie – lied – lied), поэтому дубль сам по себе не
  // ошибка — ошибка только ссылка из sentences.ts на такую форму: непонятно,
  // какой из глаголов имелся в виду. Копим коллизии и разбираем ниже.
  const verbIdByForm1 = new Map<string, string>();
  const ambiguousForm1 = new Set<string>();
  for (const verb of verbs) {
    const [form1, form2, form3] = verb.forms;
    const row = await prisma.verb.upsert({
      where: { form1_form2_form3: { form1, form2, form3 } },
      create: { form1, form2, form3, translation: verb.translation },
      update: { translation: verb.translation },
    });

    if (verbIdByForm1.has(form1)) ambiguousForm1.add(form1);
    verbIdByForm1.set(form1, row.id);

    for (const key of verb.groups) {
      const verbGroupId = groupIdByKey.get(key);
      if (!verbGroupId) throw new Error(`Глагол ${form1}: неизвестная группа "${key}"`);
      links.push({ verbId: row.id, verbGroupId });
    }
  }

  // Связи глаголов с группами перестраиваются целиком: состав групп задаётся
  // только сидом, точечно его не обновить. Шаг по умолчанию выключен — он
  // разовый по смыслу (состав меняется редко), а на проде снос всей таблицы
  // на секунду показывает живым пользователям пустые группы.
  //
  // Включать, когда в verbs.ts добавились глаголы или поменялись их группы:
  //   SEED_VERB_GROUP_LINKS=1 npm run db:seed
  const rebuildLinks = process.env.SEED_VERB_GROUP_LINKS === "1";
  if (rebuildLinks) {
    // Транзакция закрывает то самое окно: снаружи таблица пустой не бывает.
    await prisma.$transaction([
      prisma.verbGroupLink.deleteMany(),
      prisma.verbGroupLink.createMany({ data: links }),
    ]);
  }

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

  // Предложения тренажёра «Выбери форму». Валидатор тот же, что дёрнет
  // будущая админка: формат пропусков описан в одном месте, а не в двух.
  //
  // Сид только добавляет и обновляет: sentences.ts пополняется от прогона к
  // прогону, а чистка чужого удалять не берётся. Плата за это — правка text
  // (upsert идёт по паре verb_id + text) оставляет в базе старую строку;
  // убирать её нужно руками или из админки.
  for (const sentence of sentences) {
    const problems = validateSentence(sentence.text, sentence.options);
    if (problems.length > 0) {
      throw new Error(`Предложение "${sentence.text}": ${problems.join("; ")}`);
    }

    const verbId = verbIdByForm1.get(sentence.verb);
    if (!verbId) {
      throw new Error(`Предложение "${sentence.text}": неизвестный глагол "${sentence.verb}"`);
    }
    if (ambiguousForm1.has(sentence.verb)) {
      throw new Error(
        `Предложение "${sentence.text}": форма "${sentence.verb}" в verbs.ts принадлежит ` +
          `нескольким глаголам — непонятно, к какому привязывать. Уточните ссылку.`,
      );
    }

    const data = {
      options: sentence.options,
      translation: sentence.translation,
      explanation: sentence.explanation,
      level: sentence.level,
    };

    await prisma.verbSentence.upsert({
      where: { verbId_text: { verbId, text: sentence.text } },
      // Контент из сида вычитан, поэтому сразу published: черновики — это то,
      // что заведут через админку.
      create: { verbId, text: sentence.text, ...data, status: "published" },
      // status в update намеренно нет: снятое с ротации предложение (archived)
      // должно таким и остаться, иначе сид молча вернёт его студентам.
      update: data,
    });
  }

  console.log(
    `Сид завершён: групп — ${groups.length}, глаголов — ${verbs.length}, ` +
      `тренажёров — ${trainers.length}, предложений — ${sentences.length}. ` +
      (rebuildLinks
        ? `Связи перестроены — ${links.length}.`
        : "Связи глаголов с группами не трогали (SEED_VERB_GROUP_LINKS=1, чтобы перестроить)."),
  );
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
