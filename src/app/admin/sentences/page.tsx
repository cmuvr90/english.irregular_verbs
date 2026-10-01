import type { Metadata } from "next";
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
import { listSentences, listVerbOptions } from "@/dal/admin";
import {
  isSentenceStatus,
  searchParam,
  sentenceStatuses,
  sentenceStatusLabels,
} from "@/lib/admin-form";
import { requireAdmin } from "@/lib/session";

export const metadata: Metadata = { title: "Предложения" };

type Props = {
  searchParams: Promise<{ q?: string | string[]; status?: string | string[]; verb?: string | string[] }>;
};

export default async function AdminSentencesPage({ searchParams }: Props) {
  await requireAdmin();
  const params = await searchParams;
  const q = searchParam(params.q);
  const status = searchParam(params.status);
  const verb = searchParam(params.verb);
  const statusFilter = isSentenceStatus(status) ? status : null;

  const [sentences, verbs] = await Promise.all([
    listSentences({ query: q, status: statusFilter, verbId: verb || null }),
    listVerbOptions(),
  ]);

  return (
    <>
      <PageHeader
        overline="Контент"
        title={<PillTitle pre="предложения" pill="с пропусками" />}
        description="Задания тренажёра «Выбери форму». Студенты видят только опубликованные."
        actions={
          <NewLink
            href={
              verb
                ? `/admin/sentences/new?${new URLSearchParams({ verb })}`
                : "/admin/sentences/new"
            }
          >
            Новое предложение
          </NewLink>
        }
      >
        <UsedBy section="sentences" />
        <FilterBar query={q} placeholder="Поиск по тексту" summary={`Найдено: ${sentences.length}`}>
          <select
            name="status"
            defaultValue={statusFilter ?? ""}
            aria-label="Статус"
            className={filterSelectClass}
          >
            <option value="">Все статусы</option>
            {sentenceStatuses.map((value) => (
              <option key={value} value={value}>
                {sentenceStatusLabels[value]}
              </option>
            ))}
          </select>
          <select name="verb" defaultValue={verb} aria-label="Глагол" className={filterSelectClass}>
            <option value="">Все глаголы</option>
            {verbs.map((v) => (
              <option key={v.id} value={v.id}>
                {v.form1} · {v.form2} · {v.form3}
              </option>
            ))}
          </select>
        </FilterBar>
      </PageHeader>

      <TableCard>
        <THead>
          <Th>Текст</Th>
          <Th>Глагол</Th>
          <Th className="text-right">Уровень</Th>
          <Th>Статус</Th>
        </THead>
        <TBody>
          {sentences.length === 0 ? (
            <EmptyRow colSpan={4}>Ничего не нашлось.</EmptyRow>
          ) : (
            sentences.map((sentence) => (
              <tr key={sentence.id}>
                <Td>
                  <Link href={`/admin/sentences/${sentence.id}`} className="hover:underline">
                    {sentence.text}
                  </Link>
                </Td>
                <Td className="font-semibold whitespace-nowrap text-blue-600">
                  {sentence.verb.form1}
                </Td>
                <Td className="text-right font-mono text-xs tabular-nums">{sentence.level}</Td>
                <Td>
                  <Badge tone={sentence.status}>{sentenceStatusLabels[sentence.status]}</Badge>
                </Td>
              </tr>
            ))
          )}
        </TBody>
      </TableCard>
    </>
  );
}
