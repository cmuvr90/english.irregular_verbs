-- CreateTable
CREATE TABLE "trainer_mistakes" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "trainer_id" TEXT NOT NULL,
    "verb_id" TEXT NOT NULL,
    "sentence_id" TEXT,
    "chosen" TEXT,
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "trainer_mistakes_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "trainer_mistakes_user_id_created_at_idx" ON "trainer_mistakes"("user_id", "created_at");

-- CreateIndex
CREATE INDEX "trainer_mistakes_verb_id_idx" ON "trainer_mistakes"("verb_id");

-- CreateIndex
CREATE INDEX "trainer_mistakes_trainer_id_idx" ON "trainer_mistakes"("trainer_id");

-- CreateIndex
CREATE INDEX "trainer_mistakes_sentence_id_idx" ON "trainer_mistakes"("sentence_id");

-- AddForeignKey
ALTER TABLE "trainer_mistakes" ADD CONSTRAINT "trainer_mistakes_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "trainer_mistakes" ADD CONSTRAINT "trainer_mistakes_trainer_id_fkey" FOREIGN KEY ("trainer_id") REFERENCES "trainers"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "trainer_mistakes" ADD CONSTRAINT "trainer_mistakes_verb_id_fkey" FOREIGN KEY ("verb_id") REFERENCES "verbs"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "trainer_mistakes" ADD CONSTRAINT "trainer_mistakes_sentence_id_fkey" FOREIGN KEY ("sentence_id") REFERENCES "verb_sentences"("id") ON DELETE SET NULL ON UPDATE CASCADE;
