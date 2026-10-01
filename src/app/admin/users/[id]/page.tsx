import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { BackLink } from "@/components/admin/back-link";
import { DailyChart } from "@/components/admin/daily-chart";
import { TrainerIcon } from "@/components/admin/trainer-icon";
import {
  Badge,
  Card,
  EmptyRow,
  PageHeader,
  PillTitle,
  Stat,
  TableCard,
  TBody,
  Td,
  Th,
  THead,
} from "@/components/admin/ui";
import { getUserStats, STATS_DAYS, STATS_TIME_ZONE } from "@/dal/admin";
import { accuracy, fillDays } from "@/lib/admin-stats";
import { pickLocalized } from "@/lib/locales";
import { firstCorrectAnswer, splitSentence } from "@/lib/sentence-options";
import { requireAdmin } from "@/lib/session";

export const metadata: Metadata = { title: "Статистика пользователя" };

type Props = { params: Promise<{ id: string }> };

/**
 * Цвета прошли валидатор палитры (скилл dataviz): синий и оранжевый различимы
 * при всех типах дальтонизма, в отличие от пары зелёный/красный.
 */
const COLOR_LEARNED = "#2563eb";
const COLOR_REPEAT = "#ea580c";
const COLOR_NONE = "#d4d4d8";

const dateFormat = new Intl.DateTimeFormat("ru", {
  dateStyle: "medium",
  timeZone: STATS_TIME_ZONE,
});
const dateTimeFormat = new Intl.DateTimeFormat("ru", {
  dateStyle: "short",
  timeStyle: "short",
  timeZone: STATS_TIME_ZONE,
});

const statusLabels = { learned: "выучен", repeat: "на повторении", none: "не оценён" } as const;
const statusTones = { learned: "admin", repeat: "draft", none: "student" } as const;

/** Предложение с пропуском, где на месте [a] стоит ответ студента. */
function Filled({ text, chosen }: { text: string; chosen: string | null }) {
  return (
    <>
      {splitSentence(text, {}).map((part, index) =>
        part.kind === "text" ? (
          <span key={index}>{part.value}</span>
        ) : (
          <span
            key={index}
            className="mx-0.5 rounded bg-orange-100 px-1 font-semibold text-orange-800 line-through decoration-orange-400"
          >
            {chosen ?? "?"}
          </span>
        ),
      )}
    </>
  );
}

export default async function UserStatsPage({ params }: Props) {
  await requireAdmin();
  const { id } = await params;
  const stats = await getUserStats(id);
  if (!stats) notFound();

  const { user } = stats;

  // Сводка по тренажёрам из прогресса: статусы глаголов и счётчики ответов.
  const perTrainer = stats.trainers.map((trainer) => {
    const rows = stats.progress.filter((row) => row.trainerId === trainer.id);
    const count = (status: string) =>
      rows.find((row) => row.status === status)?._count._all ?? 0;
    const know = rows.reduce((sum, row) => sum + (row._sum.countKnow ?? 0), 0);
    const repeat = rows.reduce((sum, row) => sum + (row._sum.countRepeat ?? 0), 0);
    const last = rows.reduce<Date | null>(
      (max, row) => (row._max.lastViewAt && (!max || row._max.lastViewAt > max) ? row._max.lastViewAt : max),
      null,
    );
    return {
      trainer,
      learned: count("learned"),
      repeating: count("repeat"),
      none: count("none"),
      know,
      repeat,
      last,
    };
  });

  const totalLearned = perTrainer.reduce((sum, t) => sum + t.learned, 0);
  const totalKnow = perTrainer.reduce((sum, t) => sum + t.know, 0);
  const totalRepeat = perTrainer.reduce((sum, t) => sum + t.repeat, 0);
  const lastActive = perTrainer.reduce<Date | null>(
    (max, t) => (t.last && (!max || t.last > max) ? t.last : max),
    null,
  );
  const overallAccuracy = accuracy(totalKnow, totalRepeat);

  const mistakeDays = fillDays(stats.mistakesDaily, STATS_DAYS, STATS_TIME_ZONE);
  const learnedDays = fillDays(stats.learnedDaily, STATS_DAYS, STATS_TIME_ZONE);
  const mistakes30 = mistakeDays.reduce((sum, d) => sum + d.count, 0);
  const learned30 = learnedDays.reduce((sum, d) => sum + d.count, 0);

  const sentenceById = new Map(stats.sentences.map((s) => [s.id, s]));
  const typedVerbById = new Map(stats.typedVerbs.map((v) => [v.id, v]));

  return (
    <>
      <PageHeader
        overline={<BackLink href="/admin/users">Пользователи</BackLink>}
        title={<PillTitle pre="статистика" pill={user.name || user.email} />}
        description={`${user.email} · зарегистрирован ${dateFormat.format(user.createdAt)}`}
        actions={<Badge tone={user.role}>{user.role}</Badge>}
      />

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <Stat label="Выучено глаголов" value={totalLearned} note="по всем тренажёрам" />
        <Stat
          label="Точность"
          value={overallAccuracy === null ? "—" : `${overallAccuracy}%`}
          note={`«знаю» ${totalKnow} · «повторить» ${totalRepeat}`}
        />
        <Stat
          label={`Ошибок за ${STATS_DAYS} дней`}
          value={mistakes30}
          note={`выучено за период: ${learned30}`}
        />
        <Stat
          label="Последнее занятие"
          value={lastActive ? dateFormat.format(lastActive) : "—"}
        />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card
          title="Ошибки по дням"
          description={`Неверные ответы и «Повторить» за ${STATS_DAYS} дней`}
        >
          <DailyChart days={mistakeDays} color={COLOR_REPEAT} unit={{ one: "{count} ошибка", few: "{count} ошибки", many: "{count} ошибок", other: "{count} ошибки" }} label="Ошибки по дням" />
        </Card>
        <Card
          title="Выучено по дням"
          description="Глаголы, впервые отмеченные как выученные"
        >
          <DailyChart days={learnedDays} color={COLOR_LEARNED} unit={{ one: "{count} глагол", few: "{count} глагола", many: "{count} глаголов", other: "{count} глагола" }} label="Выучено по дням" />
        </Card>
      </div>

      <Card title="Прогресс по тренажёрам" description="Глаголы, которые студент хотя бы раз видел">
        <div className="flex flex-col divide-y divide-line">
          {perTrainer.map(({ trainer, learned, repeating, none, know, repeat, last }) => {
            const seen = learned + repeating + none;
            const acc = accuracy(know, repeat);
            const segments = [
              { value: learned, color: COLOR_LEARNED, label: "выучено" },
              { value: repeating, color: COLOR_REPEAT, label: "на повторении" },
              { value: none, color: COLOR_NONE, label: "без оценки" },
            ];
            return (
              <div key={trainer.id} className="flex flex-col gap-2 py-3 first:pt-0 last:pb-0">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <Link
                    href={`/admin/trainers/${encodeURIComponent(trainer.key)}`}
                    className="flex items-center gap-2 font-semibold hover:underline"
                  >
                    <TrainerIcon trainerKey={trainer.key} className="size-4 text-blue-600" />
                    {pickLocalized(trainer.name, "ru")}
                  </Link>
                  <span className="text-xs text-subtle">
                    {seen === 0
                      ? "не занимался"
                      : `видел ${seen} · точность ${acc === null ? "—" : `${acc}%`} · последнее ${last ? dateTimeFormat.format(last) : "—"}`}
                  </span>
                </div>
                {seen > 0 && (
                  <>
                    {/* сегменты разделены зазором цвета фона, а не обводкой */}
                    <div className="flex h-2.5 gap-0.5 overflow-hidden rounded-full">
                      {segments
                        .filter((s) => s.value > 0)
                        .map((s) => (
                          <div
                            key={s.label}
                            title={`${s.label}: ${s.value}`}
                            style={{ flexGrow: s.value, backgroundColor: s.color }}
                          />
                        ))}
                    </div>
                    <ul className="flex flex-wrap gap-x-4 gap-y-1 text-xs">
                      {segments.map((s) => (
                        <li key={s.label} className="flex items-center gap-1.5">
                          <span className="size-2 rounded-full" style={{ backgroundColor: s.color }} />
                          <span className="text-subtle">{s.label}</span>
                          <span className="font-mono font-semibold tabular-nums">{s.value}</span>
                        </li>
                      ))}
                    </ul>
                  </>
                )}
              </div>
            );
          })}
        </div>
      </Card>

      <section className="flex flex-col gap-3">
        <div>
          <h2 className="text-base font-bold">Типичные ошибки</h2>
          <p className="text-sm text-subtle">
            «Выбери форму»: какой неверный вариант студент выбирал чаще всего
          </p>
        </div>
        <TableCard>
          <THead>
            <Th>Предложение и ответ студента</Th>
            <Th>Верно</Th>
            <Th className="text-right">Раз</Th>
            <Th>Последний</Th>
          </THead>
          <TBody>
            {stats.mistakes.length === 0 ? (
              <EmptyRow colSpan={4}>Ошибок в предложениях пока нет.</EmptyRow>
            ) : (
              stats.mistakes.map((row) => {
                const sentence = row.sentenceId ? sentenceById.get(row.sentenceId) : undefined;
                return (
                  <tr key={`${row.sentenceId}:${row.chosen}`}>
                    <Td>
                      {sentence ? (
                        <Link href={`/admin/sentences/${sentence.id}`} className="hover:underline">
                          <Filled text={sentence.text} chosen={row.chosen} />
                        </Link>
                      ) : (
                        <span className="text-subtle">предложение удалено</span>
                      )}
                    </Td>
                    <Td className="font-semibold whitespace-nowrap text-blue-700">
                      {sentence ? (firstCorrectAnswer(sentence.text, sentence.options) ?? "—") : "—"}
                    </Td>
                    <Td className="text-right font-mono text-xs tabular-nums">{row._count._all}</Td>
                    <Td className="whitespace-nowrap text-subtle">
                      {row._max.createdAt ? dateTimeFormat.format(row._max.createdAt) : "—"}
                    </Td>
                  </tr>
                );
              })
            )}
          </TBody>
        </TableCard>
      </section>

      <section className="flex flex-col gap-3">
        <div>
          <h2 className="text-base font-bold">Ошибки в написании форм</h2>
          <p className="text-sm text-subtle">
            «Заполни пропуски»: какую форму студент писал неверно и как именно
          </p>
        </div>
        <TableCard>
          <THead>
            <Th>Глагол</Th>
            <Th>Форма</Th>
            <Th>Написал</Th>
            <Th>Верно</Th>
            <Th className="text-right">Раз</Th>
            <Th>Последний</Th>
          </THead>
          <TBody>
            {stats.typedMistakes.length === 0 ? (
              <EmptyRow colSpan={6}>Ошибок в написании пока нет.</EmptyRow>
            ) : (
              stats.typedMistakes.map((row) => {
                const verb = typedVerbById.get(row.verbId);
                const form = row.form ?? 1;
                return (
                  <tr key={`${row.verbId}:${row.form}:${row.chosen}`}>
                    <Td className="whitespace-nowrap">
                      {verb ? (
                        <Link href={`/admin/verbs/${verb.id}`} className="font-semibold hover:underline">
                          <span className="text-blue-600">{verb.form1}</span>
                        </Link>
                      ) : (
                        <span className="text-subtle">удалён</span>
                      )}
                    </Td>
                    <Td>
                      <Badge tone="mono">V{form}</Badge>
                    </Td>
                    <Td className="font-semibold text-orange-800 line-through decoration-orange-400">
                      {row.chosen}
                    </Td>
                    <Td className="font-semibold text-blue-700">
                      {verb ? [verb.form1, verb.form2, verb.form3][form - 1] : "—"}
                    </Td>
                    <Td className="text-right font-mono text-xs tabular-nums">{row._count._all}</Td>
                    <Td className="whitespace-nowrap text-subtle">
                      {row._max.createdAt ? dateTimeFormat.format(row._max.createdAt) : "—"}
                    </Td>
                  </tr>
                );
              })
            )}
          </TBody>
        </TableCard>
      </section>

      <section className="flex flex-col gap-3">
        <div>
          <h2 className="text-base font-bold">Трудные глаголы</h2>
          <p className="text-sm text-subtle">
            Чаще всего уходили на повторение — за всё время занятий
          </p>
        </div>
        <TableCard>
          <THead>
            <Th>Глагол</Th>
            <Th>Тренажёр</Th>
            <Th className="text-right">«Повторить»</Th>
            <Th className="text-right">«Знаю»</Th>
            <Th>Сейчас</Th>
          </THead>
          <TBody>
            {stats.problemVerbs.length === 0 ? (
              <EmptyRow colSpan={5}>Трудных глаголов нет.</EmptyRow>
            ) : (
              stats.problemVerbs.map((row) => (
                <tr key={row.id}>
                  <Td className="whitespace-nowrap">
                    <Link href={`/admin/verbs/${row.verb.id}`} className="font-semibold hover:underline">
                      <span className="text-blue-600">{row.verb.form1}</span> · {row.verb.form2} ·{" "}
                      {row.verb.form3}
                    </Link>
                  </Td>
                  <Td className="text-subtle">{pickLocalized(row.trainer.name, "ru")}</Td>
                  <Td className="text-right font-mono text-xs font-semibold tabular-nums">
                    {row.countRepeat}
                  </Td>
                  <Td className="text-right font-mono text-xs tabular-nums">{row.countKnow}</Td>
                  <Td>
                    <Badge tone={statusTones[row.status]}>{statusLabels[row.status]}</Badge>
                  </Td>
                </tr>
              ))
            )}
          </TBody>
        </TableCard>
      </section>

      <section className="flex flex-col gap-3">
        <div>
          <h2 className="text-base font-bold">Последние ошибки</h2>
          <p className="text-sm text-subtle">Журнал ведётся с 1 октября 2026 — более ранних записей нет</p>
        </div>
        <TableCard>
          <THead>
            <Th>Когда</Th>
            <Th>Тренажёр</Th>
            <Th>Глагол</Th>
            <Th>Ошибка</Th>
          </THead>
          <TBody>
            {stats.recent.length === 0 ? (
              <EmptyRow colSpan={4}>Ошибок пока нет.</EmptyRow>
            ) : (
              stats.recent.map((row) => (
                <tr key={row.id}>
                  <Td className="whitespace-nowrap text-subtle">{dateTimeFormat.format(row.createdAt)}</Td>
                  <Td className="whitespace-nowrap">{pickLocalized(row.trainer.name, "ru")}</Td>
                  <Td className="font-semibold whitespace-nowrap text-blue-600">{row.verb.form1}</Td>
                  <Td>
                    {row.sentence ? (
                      <>
                        <Filled text={row.sentence.text} chosen={row.chosen} />{" "}
                        <span className="text-xs text-subtle">
                          → верно: {firstCorrectAnswer(row.sentence.text, row.sentence.options) ?? "—"}
                        </span>
                      </>
                    ) : row.form && row.chosen ? (
                      <>
                        <Badge tone="mono">V{row.form}</Badge>{" "}
                        <span className="font-semibold text-orange-800 line-through decoration-orange-400">
                          {row.chosen}
                        </span>{" "}
                        <span className="text-xs text-subtle">
                          → верно: {[row.verb.form1, row.verb.form2, row.verb.form3][row.form - 1]}
                        </span>
                      </>
                    ) : row.chosen ? (
                      <span>выбрал «{row.chosen}»</span>
                    ) : (
                      <span className="text-subtle">нажал «Повторить»</span>
                    )}
                  </Td>
                </tr>
              ))
            )}
          </TBody>
        </TableCard>
      </section>
    </>
  );
}
