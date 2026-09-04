-- CreateEnum
CREATE TYPE "sentence_status" AS ENUM ('draft', 'published', 'archived');

-- CreateTable
CREATE TABLE "verb_sentences" (
    "id" TEXT NOT NULL,
    "verb_id" TEXT NOT NULL,
    "text" TEXT NOT NULL,
    "options" JSONB NOT NULL,
    "explanation" JSONB,
    "translation" JSONB,
    "level" INTEGER NOT NULL DEFAULT 1,
    "status" "sentence_status" NOT NULL DEFAULT 'draft',
    "note" TEXT,
    "created_by_id" TEXT,
    "updated_by_id" TEXT,
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "verb_sentences_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "verb_sentences_verb_id_status_idx" ON "verb_sentences"("verb_id", "status");

-- CreateIndex
CREATE INDEX "verb_sentences_created_by_id_idx" ON "verb_sentences"("created_by_id");

-- CreateIndex
CREATE UNIQUE INDEX "verb_sentences_verb_id_text_key" ON "verb_sentences"("verb_id", "text");

-- AddForeignKey
ALTER TABLE "verb_sentences" ADD CONSTRAINT "verb_sentences_verb_id_fkey" FOREIGN KEY ("verb_id") REFERENCES "verbs"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "verb_sentences" ADD CONSTRAINT "verb_sentences_created_by_id_fkey" FOREIGN KEY ("created_by_id") REFERENCES "user"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "verb_sentences" ADD CONSTRAINT "verb_sentences_updated_by_id_fkey" FOREIGN KEY ("updated_by_id") REFERENCES "user"("id") ON DELETE SET NULL ON UPDATE CASCADE;
