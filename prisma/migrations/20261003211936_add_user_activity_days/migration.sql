-- CreateTable
CREATE TABLE "user_activity_days" (
    "user_id" TEXT NOT NULL,
    "day" DATE NOT NULL,
    "answers" INTEGER NOT NULL DEFAULT 0,
    "correct" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "user_activity_days_pkey" PRIMARY KEY ("user_id","day")
);

-- AddForeignKey
ALTER TABLE "user_activity_days" ADD CONSTRAINT "user_activity_days_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Заполняем историю из того, что уже есть. Полного журнала ответов раньше не
-- было, поэтому это нижняя оценка: каждая ошибка — неверный ответ в свой
-- день, первое выучивание глагола — верный ответ в свой день. Часового пояса
-- студента тогда не знали — берём пояс статистики админки (STATS_TIME_ZONE).
INSERT INTO "user_activity_days" ("user_id", "day", "answers", "correct")
SELECT "user_id", "day", SUM("answers"), SUM("correct")
FROM (
    SELECT "user_id", ("created_at" AT TIME ZONE 'Europe/Bratislava')::date AS "day",
           COUNT(*) AS "answers", 0 AS "correct"
    FROM "trainer_mistakes"
    GROUP BY 1, 2
    UNION ALL
    SELECT "user_id", ("learned_at" AT TIME ZONE 'Europe/Bratislava')::date AS "day",
           COUNT(*) AS "answers", COUNT(*) AS "correct"
    FROM "trainer_verb_progress"
    WHERE "learned_at" IS NOT NULL
    GROUP BY 1, 2
) AS "history"
GROUP BY "user_id", "day";
