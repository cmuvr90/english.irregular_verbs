-- «Заполни пропуски»: какую форму глагола спрашивали (1, 2 или 3).
-- Колонка отдельной миграцией: add_trainer_mistakes уже закоммичена и могла
-- быть применена, менять её нельзя.
ALTER TABLE "trainer_mistakes" ADD COLUMN "form" INTEGER;

-- Prisma не описывает CHECK в схеме, поэтому ограничение живёт только здесь.
ALTER TABLE "trainer_mistakes"
  ADD CONSTRAINT "trainer_mistakes_form_check" CHECK ("form" BETWEEN 1 AND 3);
