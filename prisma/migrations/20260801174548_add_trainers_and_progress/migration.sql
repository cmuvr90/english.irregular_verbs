-- CreateEnum
CREATE TYPE "trainer_verb_status" AS ENUM ('none', 'repeat', 'learned');

-- CreateTable
CREATE TABLE "trainers" (
    "id" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "name" JSONB NOT NULL,
    "description" JSONB NOT NULL,
    "settings" JSONB NOT NULL,
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "trainers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "trainer_verb_progress" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "verb_id" TEXT NOT NULL,
    "trainer_id" TEXT NOT NULL,
    "status" "trainer_verb_status" NOT NULL DEFAULT 'none',
    "count" INTEGER NOT NULL DEFAULT 0,
    "count_know" INTEGER NOT NULL DEFAULT 0,
    "count_repeat" INTEGER NOT NULL DEFAULT 0,
    "learned_at" TIMESTAMPTZ(3),
    "last_view_at" TIMESTAMPTZ(3),
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "trainer_verb_progress_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "trainers_key_key" ON "trainers"("key");

-- CreateIndex
CREATE INDEX "trainer_verb_progress_user_id_trainer_id_idx" ON "trainer_verb_progress"("user_id", "trainer_id");

-- CreateIndex
CREATE UNIQUE INDEX "trainer_verb_progress_user_id_verb_id_trainer_id_key" ON "trainer_verb_progress"("user_id", "verb_id", "trainer_id");

-- AddForeignKey
ALTER TABLE "trainer_verb_progress" ADD CONSTRAINT "trainer_verb_progress_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "trainer_verb_progress" ADD CONSTRAINT "trainer_verb_progress_verb_id_fkey" FOREIGN KEY ("verb_id") REFERENCES "verbs"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "trainer_verb_progress" ADD CONSTRAINT "trainer_verb_progress_trainer_id_fkey" FOREIGN KEY ("trainer_id") REFERENCES "trainers"("id") ON DELETE CASCADE ON UPDATE CASCADE;

