"use client";

import { useState } from "react";

import { plural, type PluralForms } from "@/lib/locales";

export type ChartDay = {
  /** YYYY-MM-DD. */
  day: string;
  count: number;
};

const dayFormat = new Intl.DateTimeFormat("ru", { day: "numeric", month: "short", timeZone: "UTC" });

/** День из ключа YYYY-MM-DD. Ключ уже посчитан в нужном поясе — форматируем как UTC, без сдвига. */
function formatDay(day: string) {
  return dayFormat.format(new Date(`${day}T00:00:00Z`));
}

/** Круглые деления оси: 0, 1, 2… или 0, 5, 10… — не больше пяти. Шаг целый: считаем штуки. */
function ticksFor(max: number) {
  if (max <= 0) return [0, 1];
  const raw = max / 4;
  const magnitude = 10 ** Math.floor(Math.log10(raw));
  const step = Math.max(1, [1, 2, 5, 10].map((m) => m * magnitude).find((s) => s >= raw) ?? raw);
  const ticks: number[] = [];
  for (let value = 0; value <= max + step * 0.001; value += step) ticks.push(value);
  if (ticks[ticks.length - 1] < max) ticks.push(ticks[ticks.length - 1] + step);
  return ticks;
}

/**
 * Столбики по дням, одна серия. Цвет — у столбика, текст — в цветах текста.
 * Подсказка по наведению на всю колонку дня (зона больше самого столбика),
 * таблица под спойлером — для тех, кто не различает цвет или читает с экрана.
 */
export function DailyChart({
  days,
  color,
  unit,
  label,
}: {
  days: ChartDay[];
  /** Цвет столбиков (проверен валидатором палитры на контраст и дальтонизм). */
  color: string;
  /** Подпись значения в подсказке по формам числа: «{count} ошибка / ошибки / ошибок». */
  unit: PluralForms;
  /** Для скринридера и заголовка таблицы. */
  label: string;
}) {
  const [hovered, setHovered] = useState<number | null>(null);
  const max = Math.max(0, ...days.map((d) => d.count));
  const ticks = ticksFor(max);
  const top = ticks[ticks.length - 1];
  const total = days.reduce((sum, d) => sum + d.count, 0);
  const active = hovered === null ? null : days[hovered];

  return (
    <figure className="flex flex-col gap-2">
      <div className="relative flex h-40 gap-2" role="img" aria-label={`${label}: всего ${total}`}>
        {/* ось Y */}
        <div className="relative w-6 shrink-0 text-right font-mono text-[11px] text-subtle tabular-nums">
          {ticks.map((tick) => (
            <span
              key={tick}
              className="absolute right-0 translate-y-1/2"
              style={{ bottom: `${(tick / top) * 100}%` }}
            >
              {tick}
            </span>
          ))}
        </div>

        <div className="relative flex-1">
          {/* сетка: тонкая, сплошная, на шаг светлее данных */}
          {ticks.map((tick) => (
            <div
              key={tick}
              className={`absolute inset-x-0 h-px ${tick === 0 ? "bg-zinc-300" : "bg-zinc-100"}`}
              style={{ bottom: `${(tick / top) * 100}%` }}
            />
          ))}

          <div className="absolute inset-0 flex items-end">
            {days.map((d, index) => (
              <div
                key={d.day}
                onMouseEnter={() => setHovered(index)}
                onMouseLeave={() => setHovered(null)}
                className={`flex h-full flex-1 items-end justify-center px-px ${hovered === index ? "bg-zinc-100/70" : ""}`}
              >
                {d.count > 0 && (
                  <div
                    className="w-full max-w-6 rounded-t"
                    style={{ height: `${(d.count / top) * 100}%`, backgroundColor: color }}
                  />
                )}
              </div>
            ))}
          </div>

          {active && hovered !== null && (
            <div
              role="status"
              className="pointer-events-none absolute -top-2 z-10 -translate-x-1/2 -translate-y-full rounded-lg bg-white px-2.5 py-1.5 text-xs whitespace-nowrap shadow-md ring-1 ring-foreground/10"
              style={{
                left: `${((hovered + 0.5) / days.length) * 100}%`,
              }}
            >
              <span className="block text-subtle">{formatDay(active.day)}</span>
              <span className="flex items-center gap-1.5 font-semibold">
                <span className="size-2 rounded-full" style={{ backgroundColor: color }} />
                {plural("ru", active.count, unit)}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* ось X: первый, средний и последний день — остальное в подсказке */}
      <div className="ml-8 flex justify-between font-mono text-[11px] text-subtle">
        <span>{formatDay(days[0].day)}</span>
        <span>{formatDay(days[Math.floor(days.length / 2)].day)}</span>
        <span>{formatDay(days[days.length - 1].day)}</span>
      </div>

      <details className="text-xs">
        <summary className="cursor-pointer text-subtle hover:text-foreground">Таблица</summary>
        <table className="mt-2 w-full max-w-xs">
          <caption className="sr-only">{label}</caption>
          <tbody>
            {days
              .filter((d) => d.count > 0)
              .map((d) => (
                <tr key={d.day} className="border-b border-line last:border-0">
                  <td className="py-1 text-subtle">{formatDay(d.day)}</td>
                  <td className="py-1 text-right font-mono tabular-nums">{d.count}</td>
                </tr>
              ))}
            {total === 0 && (
              <tr>
                <td className="py-1 text-subtle">Нет данных за период</td>
              </tr>
            )}
          </tbody>
        </table>
      </details>
    </figure>
  );
}
