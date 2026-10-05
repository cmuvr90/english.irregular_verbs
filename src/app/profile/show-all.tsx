"use client";

import { useId, useState } from "react";

/**
 * Остаток длинного списка: раскрывается кнопкой под списком и сворачивается
 * ею же — кнопка остаётся внизу, листать обратно к ней не нужно.
 */
export function ShowAll({
  label,
  hideLabel,
  children,
}: {
  label: string;
  hideLabel: string;
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const id = useId();

  return (
    <>
      <div id={id} hidden={!open}>
        {children}
      </div>
      <button
        type="button"
        aria-expanded={open}
        aria-controls={id}
        onClick={() => setOpen((value) => !value)}
        className="focus-ring t-label mt-1 rounded-lg py-2 text-fg-link"
      >
        {open ? hideLabel : label}
      </button>
    </>
  );
}
