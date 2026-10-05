"use client";

import { X } from "lucide-react";
import { useState } from "react";

import { AudioField, audioFileName, CountdownToggle, useCountdown } from "./verb-audio-form";

import type { FormNumber } from "@/lib/admin-actions";

/**
 * Три кнопки «1 2 3» в списке глаголов — озвучка каждой формы. Синяя —
 * файл есть, бледная — нет. Клик открывает попап с тем же блоком записи,
 * что на странице глагола: прослушать, записать, загрузить — не уходя
 * из списка.
 */
export function VerbAudioButtons({
  verbId,
  infinitive,
  label,
  forms,
}: {
  verbId: string;
  /** Первая форма — по ней называются файлы: read_1.mp3. */
  infinitive: string;
  /** Подпись попапа: «become – became – become». */
  label: string;
  /** Три формы по порядку: текст и URL файла (null — не озвучена). */
  forms: { text: string; audioUrl: string | null }[];
}) {
  const [open, setOpen] = useState<FormNumber | null>(null);

  return (
    <>
      <span className="flex items-center justify-center gap-1">
        {forms.map(({ text, audioUrl }, i) => (
          <button
            key={i}
            type="button"
            onClick={() => setOpen((i + 1) as FormNumber)}
            aria-label={`Озвучка «${text}»${audioUrl ? "" : " — нет файла"}`}
            title={audioUrl ? text : `«${text}» без озвучки`}
            className={`flex size-6 items-center justify-center rounded-full text-xs font-semibold tabular-nums transition-colors ${
              audioUrl
                ? "bg-blue-50 text-blue-700 hover:bg-blue-100"
                : "font-normal text-subtle ring-1 ring-line ring-inset hover:bg-muted"
            }`}
          >
            {i + 1}
          </button>
        ))}
      </span>

      {open && (
        <AudioDialog
          verbId={verbId}
          infinitive={infinitive}
          label={label}
          form={open}
          slot={forms[open - 1]}
          onClose={() => setOpen(null)}
        />
      )}
    </>
  );
}

/**
 * Попап одной формы. Монтируется только открытым: закрытие посреди записи
 * размонтирует блок, и он сам выключит микрофон и выбросит запись.
 */
function AudioDialog({
  verbId,
  infinitive,
  label,
  form,
  slot,
  onClose,
}: {
  verbId: string;
  infinitive: string;
  label: string;
  form: FormNumber;
  slot: { text: string; audioUrl: string | null };
  onClose: () => void;
}) {
  const countdown = useCountdown();

  return (
    <dialog
      // Нативный модальный dialog: Esc, фокус и затемнение — браузер.
      ref={(dialog) => {
        if (dialog && !dialog.open) dialog.showModal();
      }}
      onClose={onClose}
      // Клик по затемнению (сам dialog, а не его содержимое) закрывает.
      onClick={(event) => {
        if (event.target === event.currentTarget) event.currentTarget.close();
      }}
      aria-label={`Озвучка: ${slot.text}`}
      className="m-auto w-[min(24rem,calc(100vw-2rem))] rounded-xl bg-white p-0 text-sm ring-1 ring-foreground/10 backdrop:bg-black/40"
    >
      <div className="flex flex-col gap-3 p-4">
        <div className="flex items-start justify-between gap-2">
          <div>
            <p className="font-semibold">Озвучка</p>
            <p className="text-xs text-subtle">{label}</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Закрыть"
            className="-m-1 rounded-full p-1.5 text-subtle hover:bg-muted hover:text-foreground [&_svg]:size-4"
          >
            <X />
          </button>
        </div>

        <CountdownToggle countdown={countdown} />
        <AudioField
          verbId={verbId}
          form={form}
          fileName={audioFileName(infinitive, form)}
          countdown={countdown}
          {...slot}
        />
      </div>
    </dialog>
  );
}
