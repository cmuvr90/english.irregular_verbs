import type { Metadata } from "next";
import { ImageOff } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

import {
  Badge,
  EmptyRow,
  FilterBar,
  filterSelectClass,
  NewLink,
  PageHeader,
  PillTitle,
  TableCard,
  TBody,
  Td,
  Th,
  THead,
} from "@/components/admin/ui";
import { ImageZoom } from "@/components/admin/image-zoom";
import { UsedBy } from "@/components/admin/used-by";
import { VerbAudioButtons } from "@/components/admin/verb-audio-buttons";
import { listVerbs, type ImageFilter } from "@/dal/admin";
import { searchParam } from "@/lib/admin-form";
import { isPrecompressedImage } from "@/lib/image-compression";
import { pickLocalized } from "@/lib/locales";
import { requireAdmin } from "@/lib/session";

export const metadata: Metadata = { title: "Глаголы" };

const thumbClass =
  "flex h-9 w-12 items-center justify-center overflow-hidden rounded-md bg-slate-50 ring-1 ring-line";

type Props = { searchParams: Promise<{ q?: string | string[]; image?: string | string[] }> };

export default async function AdminVerbsPage({ searchParams }: Props) {
  await requireAdmin();
  const params = await searchParams;
  const q = searchParam(params.q);
  const imageParam = searchParam(params.image);
  const image: ImageFilter =
    imageParam === "with" || imageParam === "without" ? imageParam : null;
  const verbs = await listVerbs(q, image);

  return (
    <>
      <PageHeader
        overline="Контент"
        title={<PillTitle pre="неправильные" pill="глаголы" />}
        description="Три формы, переводы и группы. Удаление глагола уносит его предложения и прогресс студентов."
        actions={<NewLink href="/admin/verbs/new">Новый глагол</NewLink>}
      >
        <UsedBy section="verbs" />
        <FilterBar query={q} placeholder="Поиск по любой форме" summary={`Найдено: ${verbs.length}`}>
          <select
            name="image"
            defaultValue={image ?? ""}
            aria-label="Картинка"
            className={filterSelectClass}
          >
            <option value="">С картинкой и без</option>
            <option value="with">С картинкой</option>
            <option value="without">Без картинки</option>
          </select>
        </FilterBar>
      </PageHeader>

      <TableCard>
        <THead>
          <Th className="w-0">
            <span className="sr-only">Картинка</span>
          </Th>
          <Th>Формы</Th>
          <Th>Перевод (RU)</Th>
          <Th>Группы</Th>
          <Th className="text-center">Озвучка</Th>
          <Th className="text-right">Предложений</Th>
        </THead>
        <TBody>
          {verbs.length === 0 ? (
            <EmptyRow colSpan={6}>{q ? "Ничего не нашлось." : "Глаголов пока нет."}</EmptyRow>
          ) : (
            verbs.map((verb) => (
              <tr key={verb.id}>
                <Td className="py-1.5 pr-0">
                  {verb.imageUrl ? (
                    <ImageZoom
                      src={verb.imageUrl}
                      alt={`${verb.form1} – ${verb.form2} – ${verb.form3}`}
                      className={`${thumbClass} transition-opacity hover:opacity-80`}
                    >
                      <Image
                        src={verb.imageUrl}
                        alt=""
                        width={48}
                        height={36}
                        unoptimized={isPrecompressedImage(verb.imageUrl)}
                        className="size-full object-cover"
                      />
                    </ImageZoom>
                  ) : (
                    <span className={thumbClass}>
                      <ImageOff className="size-3.5 text-subtle/50" />
                    </span>
                  )}
                </Td>
                <Td className="whitespace-nowrap">
                  <Link href={`/admin/verbs/${verb.id}`} className="font-semibold hover:underline">
                    <span className="text-blue-600">{verb.form1}</span> · {verb.form2} · {verb.form3}
                  </Link>
                </Td>
                <Td className="text-subtle">{pickLocalized(verb.translation, "ru")}</Td>
                <Td>
                  <span className="flex flex-wrap gap-1">
                    {verb.groups.map((link) => (
                      <Badge key={link.group.key} tone="mono">
                        {link.group.key}
                      </Badge>
                    ))}
                  </span>
                </Td>
                <Td>
                  <VerbAudioButtons
                    verbId={verb.id}
                    infinitive={verb.form1}
                    label={`${verb.form1} – ${verb.form2} – ${verb.form3}`}
                    forms={[
                      { text: verb.form1, audioUrl: verb.audio1Url },
                      { text: verb.form2, audioUrl: verb.audio2Url },
                      { text: verb.form3, audioUrl: verb.audio3Url },
                    ]}
                  />
                </Td>
                <Td className="text-right font-mono text-xs tabular-nums">{verb._count.sentences}</Td>
              </tr>
            ))
          )}
        </TBody>
      </TableCard>
    </>
  );
}
