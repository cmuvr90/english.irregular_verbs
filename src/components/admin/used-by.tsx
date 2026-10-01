import Link from "next/link";

import { TrainerIcon } from "./trainer-icon";

import { listTrainers } from "@/dal/admin";
import { trainersUsing, type ContentSection } from "@/lib/admin-trainers";
import { pickLocalized } from "@/lib/locales";

/**
 * Плашка над разделом контента: какие тренажёры читают эти данные и что
 * именно берут. Редактор видит последствия правки до того, как её сделал.
 */
export async function UsedBy({ section }: { section: ContentSection }) {
  const using = trainersUsing(section);
  const trainers = await listTrainers();
  const byKey = new Map(trainers.map((trainer) => [trainer.key, trainer]));

  const items = using.filter((item) => byKey.has(item.key));
  if (items.length === 0) return null;

  return (
    <div className="flex flex-col gap-2 rounded-xl bg-blue-50 p-3 ring-1 ring-blue-500/15">
      <span className="text-xs font-semibold text-blue-700">Используется в тренажёрах</span>
      <ul className="flex flex-col gap-1.5">
        {items.map(({ key, source }) => (
          <li key={key} className="flex flex-wrap items-center gap-x-2 gap-y-0.5 text-sm">
            <Link
              href={`/admin/trainers/${encodeURIComponent(key)}`}
              className="inline-flex items-center gap-1.5 font-semibold text-blue-700 hover:underline"
            >
              <TrainerIcon trainerKey={key} className="size-4" />
              {pickLocalized(byKey.get(key)!.name, "ru")}
            </Link>
            <span className="text-subtle">— {source.what}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
