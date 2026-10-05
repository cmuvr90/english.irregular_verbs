import { Plus, Search } from "lucide-react";
import Link from "next/link";

/**
 * Разметка админки: шапка страницы, карточки, таблицы, кнопки, бейджи.
 * Без хуков — импортируется и серверными страницами, и клиентскими формами.
 */

// ── Кнопки и поля ───────────────────────────────────────────────────────────

const buttonBase =
  "inline-flex h-8 shrink-0 items-center justify-center gap-1.5 rounded-full px-3.5 text-sm font-semibold whitespace-nowrap transition-colors outline-none focus-visible:ring-3 focus-visible:ring-blue-500/40 disabled:pointer-events-none disabled:opacity-50 [&_svg]:size-4 [&_svg]:shrink-0";

export const buttonClass = {
  primary: `${buttonBase} bg-blue-600 text-white hover:bg-blue-600/85`,
  outline: `${buttonBase} border border-line bg-white hover:bg-muted`,
  destructive: `${buttonBase} bg-red-500/10 text-red-600 hover:bg-red-500/20`,
  /** Подтвердить готовый результат (загрузить запись) — рядом с primary-действием. */
  success: `${buttonBase} bg-emerald-600 text-white hover:bg-emerald-600/85`,
  link: "inline-flex items-center gap-1.5 text-sm font-medium text-blue-600 underline-offset-4 hover:underline [&_svg]:size-4",
};

export const inputClass =
  "h-8 w-full min-w-0 rounded-lg border border-line bg-white px-2.5 text-sm outline-none transition-colors placeholder:text-subtle focus-visible:border-blue-500 focus-visible:ring-3 focus-visible:ring-blue-500/30";

export const textareaClass =
  "w-full min-w-0 rounded-lg border border-line bg-white px-2.5 py-1.5 text-sm outline-none transition-colors placeholder:text-subtle focus-visible:border-blue-500 focus-visible:ring-3 focus-visible:ring-blue-500/30";

// ── Шапка страницы ──────────────────────────────────────────────────────────

/** Заголовок в стиле бренда: строчные буквы, одно слово выделено «пилюлей». */
export function PillTitle({ pre, pill, post }: { pre?: string; pill: string; post?: string }) {
  return (
    <h1 className="text-4xl leading-[0.95] font-extrabold tracking-tight text-balance lowercase">
      {pre && `${pre} `}
      <span className="mx-0.5 inline-block rounded-xl bg-gradient-to-r from-sky-400 via-blue-500 to-indigo-500 px-3 pb-1 leading-none text-white">
        {pill}
      </span>
      {post && ` ${post}`}
    </h1>
  );
}

/** Верх страницы: надзаголовок, заголовок, действия справа, описание, ниже — фильтры. */
export function PageHeader({
  overline = "Админка",
  title,
  description,
  actions,
  children,
}: {
  overline?: React.ReactNode;
  title: React.ReactNode;
  description?: React.ReactNode;
  actions?: React.ReactNode;
  children?: React.ReactNode;
}) {
  return (
    <header className="flex flex-col gap-4">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div className="flex flex-col gap-2">
          <div className="text-[11px] font-bold tracking-[0.28em] text-blue-600 uppercase">
            {overline}
          </div>
          {title}
        </div>
        {actions && <div className="flex items-center gap-2">{actions}</div>}
      </div>
      {description && <p className="max-w-2xl text-sm text-subtle">{description}</p>}
      {children}
    </header>
  );
}

/** Основное действие страницы — ссылка-кнопка «+ Новый …». */
export function NewLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link href={href} className={buttonClass.primary}>
      <Plus />
      {children}
    </Link>
  );
}

// ── Карточки ────────────────────────────────────────────────────────────────

const cardBase = "rounded-xl bg-white text-sm ring-1 ring-foreground/10";

export function Card({
  title,
  description,
  action,
  children,
  className = "",
}: {
  title?: React.ReactNode;
  description?: React.ReactNode;
  action?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <section className={`${cardBase} flex flex-col gap-4 py-4 ${className}`}>
      {(title || action) && (
        <div className="flex items-start justify-between gap-3 px-4">
          <div className="flex flex-col gap-1">
            {title && <h2 className="text-base leading-snug font-bold">{title}</h2>}
            {description && <p className="text-sm text-subtle">{description}</p>}
          </div>
          {action}
        </div>
      )}
      <div className="px-4">{children}</div>
    </section>
  );
}

/** Одна крупная цифра в карточке. */
export function Stat({
  label,
  value,
  note,
  href,
}: {
  label: string;
  value: React.ReactNode;
  note?: string;
  href?: string;
}) {
  const body = (
    <>
      <span className="text-xs font-medium text-subtle">{label}</span>
      <span className="text-3xl leading-tight font-extrabold tracking-tight tabular-nums">
        {value}
      </span>
      {note && <span className="text-xs text-subtle">{note}</span>}
    </>
  );
  const className = `${cardBase} flex flex-col gap-1 p-3`;
  return href ? (
    <Link href={href} className={`${className} transition-shadow hover:shadow-md`}>
      {body}
    </Link>
  ) : (
    <div className={className}>{body}</div>
  );
}

// ── Таблица в карточке ──────────────────────────────────────────────────────

export function TableCard({ children }: { children: React.ReactNode }) {
  return (
    <div className={`${cardBase} overflow-x-auto`}>
      <table className="w-full text-sm">{children}</table>
    </div>
  );
}

export function THead({ children }: { children: React.ReactNode }) {
  return (
    <thead className="[&_tr]:border-b [&_tr]:border-line">
      <tr>{children}</tr>
    </thead>
  );
}

export function Th({ children, className = "" }: { children?: React.ReactNode; className?: string }) {
  return (
    <th
      className={`h-10 px-3 text-left align-middle text-xs font-medium whitespace-nowrap text-subtle ${className}`}
    >
      {children}
    </th>
  );
}

export function TBody({ children }: { children: React.ReactNode }) {
  return (
    <tbody className="[&_tr]:border-b [&_tr]:border-line [&_tr:last-child]:border-0 [&_tr]:transition-colors [&_tr:hover]:bg-muted">
      {children}
    </tbody>
  );
}

export function Td({ children, className = "" }: { children?: React.ReactNode; className?: string }) {
  return <td className={`px-3 py-2 align-middle ${className}`}>{children}</td>;
}

/** Пустая таблица: строка на всю ширину. */
export function EmptyRow({ colSpan, children }: { colSpan: number; children: React.ReactNode }) {
  return (
    <tr>
      <td colSpan={colSpan} className="py-10 text-center text-subtle">
        {children}
      </td>
    </tr>
  );
}

// ── Фильтры ─────────────────────────────────────────────────────────────────

/** GET-форма: поиск, фильтры и сводка. Фильтр живёт в адресе, страница остаётся серверной. */
export function FilterBar({
  query,
  placeholder,
  summary,
  children,
}: {
  query: string;
  placeholder: string;
  summary?: React.ReactNode;
  children?: React.ReactNode;
}) {
  return (
    <form className="flex flex-col gap-3">
      <label className="relative max-w-md">
        <span className="sr-only">{placeholder}</span>
        <Search
          size={16}
          className="pointer-events-none absolute top-1/2 left-2.5 -translate-y-1/2 text-subtle"
        />
        <input
          type="search"
          name="q"
          defaultValue={query}
          placeholder={placeholder}
          className={`${inputClass} pl-8`}
        />
      </label>
      <div className="flex flex-wrap items-center gap-2">
        {children}
        <button type="submit" className={buttonClass.outline}>
          Применить
        </button>
      </div>
      {summary && <p className="text-xs text-subtle">{summary}</p>}
    </form>
  );
}

export const filterSelectClass =
  "h-8 max-w-56 rounded-full border border-line bg-white px-3 text-sm outline-none focus-visible:ring-3 focus-visible:ring-blue-500/30";

// ── Бейджи ──────────────────────────────────────────────────────────────────

const badgeTones: Record<string, string> = {
  draft: "bg-amber-100 text-amber-700",
  published: "bg-emerald-100 text-emerald-700",
  archived: "bg-muted text-foreground ring-1 ring-line",
  admin: "bg-blue-100 text-blue-700",
  student: "bg-muted text-foreground ring-1 ring-line",
  mono: "bg-muted font-mono font-medium text-subtle",
};

export function Badge({ tone, children }: { tone: string; children: React.ReactNode }) {
  return (
    <span
      className={`inline-flex h-5 w-fit shrink-0 items-center rounded-full px-2 text-xs font-semibold whitespace-nowrap ${badgeTones[tone] ?? badgeTones.student}`}
    >
      {children}
    </span>
  );
}
