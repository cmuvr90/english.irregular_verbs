-- CreateTable
CREATE TABLE "verbs" (
    "id" TEXT NOT NULL,
    "form_1" TEXT NOT NULL,
    "form_2" TEXT NOT NULL,
    "form_3" TEXT NOT NULL,
    "translation" JSONB NOT NULL,
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "verbs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "verb_groups" (
    "id" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "name" JSONB NOT NULL,
    "description" JSONB NOT NULL,
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "verb_groups_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "verb_group_links" (
    "verb_id" TEXT NOT NULL,
    "verb_group_id" TEXT NOT NULL,

    CONSTRAINT "verb_group_links_pkey" PRIMARY KEY ("verb_id","verb_group_id")
);

-- CreateIndex
CREATE UNIQUE INDEX "verb_groups_key_key" ON "verb_groups"("key");

-- CreateIndex
CREATE INDEX "verb_group_links_verb_group_id_idx" ON "verb_group_links"("verb_group_id");

-- AddForeignKey
ALTER TABLE "verb_group_links" ADD CONSTRAINT "verb_group_links_verb_id_fkey" FOREIGN KEY ("verb_id") REFERENCES "verbs"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "verb_group_links" ADD CONSTRAINT "verb_group_links_verb_group_id_fkey" FOREIGN KEY ("verb_group_id") REFERENCES "verb_groups"("id") ON DELETE CASCADE ON UPDATE CASCADE;
