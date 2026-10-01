import type { Metadata } from "next";
import { Image as ImageIcon } from "lucide-react";
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
import { UsedBy } from "@/components/admin/used-by";
import { listVerbs, type ImageFilter } from "@/dal/admin";
import { searchParam } from "@/lib/admin-form";
import { pickLocalized } from "@/lib/locales";
import { requireAdmin } from "@/lib/session";

export const metadata: Metadata = { title: "Глаголы" };

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
          <Th>Формы</Th>
          <Th>Перевод (RU)</Th>
          <Th>Группы</Th>
          <Th className="text-right">Предложений</Th>
          <Th className="text-center">Картинка</Th>
        </THead>
        <TBody>
          {verbs.length === 0 ? (
            <EmptyRow colSpan={5}>{q ? "Ничего не нашлось." : "Глаголов пока нет."}</EmptyRow>
          ) : (
            verbs.map((verb) => (
              <tr key={verb.id}>
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
                <Td className="text-right font-mono text-xs tabular-nums">{verb._count.sentences}</Td>
                <Td className="text-center">
                  {verb.imageUrl ? (
                    <ImageIcon aria-label="есть" className="mx-auto size-4 text-blue-600" />
                  ) : (
                    <span className="text-subtle">—</span>
                  )}
                </Td>
              </tr>
            ))
          )}
        </TBody>
      </TableCard>
    </>
  );
}
