/**
 * Вспомогательная вёрстка для страниц «Основа» в Storybook: заголовки
 * разделов и сетки образцов. В приложение не попадает.
 */

export function Page({ title, lead, children }: { title: string; lead: string; children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-canvas px-6 py-10 sm:px-10">
      <div className="mx-auto max-w-5xl">
        <p className="t-overline text-ink-600">Дизайн-система</p>
        <h1 className="t-display mt-3 text-fg-strong">{title}</h1>
        <p className="t-body mt-3 max-w-2xl text-fg-muted">{lead}</p>
        <div className="mt-12 flex flex-col gap-14">{children}</div>
      </div>
    </div>
  );
}

export function Section({ title, note, children }: { title: string; note?: string; children: React.ReactNode }) {
  return (
    <section>
      <h2 className="t-heading text-fg-strong">{title}</h2>
      {note && <p className="t-body-sm mt-1.5 max-w-2xl text-fg-muted">{note}</p>}
      <div className="mt-5">{children}</div>
    </section>
  );
}

/** Подпись токена моноширинным шрифтом. */
export function Token({ children }: { children: React.ReactNode }) {
  return <code className="font-mono text-[11px] text-fg-muted">{children}</code>;
}
