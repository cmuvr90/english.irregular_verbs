"use client";

import { ImageOff, ImageUp, LoaderCircle, Trash2 } from "lucide-react";
import Image from "next/image";
import { useEffect, useState, useTransition } from "react";

import { FormFooter, useAdminForm } from "./form-fields";
import { buttonClass, Card } from "./ui";

import { removeVerbImage, uploadVerbImage } from "@/lib/admin-actions";

/**
 * Картинка глагола для тренажёра «Подбери глагол к картинке». Файл уходит
 * в Vercel Blob через server action; до загрузки показываем локальное превью,
 * чтобы админ видел, что именно заменяет.
 */
export function VerbImageForm({
  verbId,
  imageUrl,
  verbLabel,
}: {
  verbId: string;
  imageUrl: string | null;
  verbLabel: string;
}) {
  const { state, pending, onSubmit } = useAdminForm(uploadVerbImage.bind(null, verbId));
  const [preview, setPreview] = useState<string | null>(null);
  const [removing, startRemoving] = useTransition();

  // Превью — object URL; освобождаем, когда он больше не нужен.
  useEffect(() => {
    return () => {
      if (preview) URL.revokeObjectURL(preview);
    };
  }, [preview]);

  // После загрузки страница получает новый imageUrl, и родитель пересоздаёт
  // форму по key — превью сбрасывается само, без эффекта.
  const shown = preview ?? imageUrl;

  return (
    <Card
      title="Картинка"
      description="Для тренажёра «Подбери глагол к картинке». Глагол без картинки в него не попадает."
    >
      <form onSubmit={onSubmit} className="flex flex-col gap-4">
        <div className="relative flex aspect-[4/3] w-full items-center justify-center overflow-hidden rounded-lg bg-slate-50 ring-1 ring-line">
          {shown ? (
            preview && shown === preview ? (
              // Локальный blob: URL — next/image его не оптимизирует, и не нужно.
              // eslint-disable-next-line @next/next/no-img-element
              <img src={preview} alt="" className="size-full object-contain" />
            ) : (
              <Image
                src={shown}
                alt={verbLabel}
                fill
                sizes="20rem"
                className="object-contain"
              />
            )
          ) : (
            <span className="flex flex-col items-center gap-1 text-subtle">
              <ImageOff className="size-6" />
              <span className="text-xs">Картинки нет</span>
            </span>
          )}
        </div>

        <input
          type="file"
          name="image"
          accept="image/png,image/jpeg,image/webp,image/avif"
          required
          onChange={(event) => {
            const file = event.target.files?.[0];
            setPreview(file ? URL.createObjectURL(file) : null);
          }}
          className="text-sm file:mr-3 file:rounded-full file:border-0 file:bg-blue-50 file:px-3 file:py-1.5 file:text-sm file:font-semibold file:text-blue-700 hover:file:bg-blue-100"
        />
        <p className="text-xs text-subtle">
          PNG, JPEG, WebP или AVIF до 2 МБ. Лучше квадрат или 4:3 с одним понятным действием.
        </p>

        <FormFooter state={state} pending={pending}>
          <ImageUp />
          {imageUrl ? "Заменить" : "Загрузить"}
        </FormFooter>
      </form>

      {imageUrl && (
        <button
          type="button"
          disabled={removing}
          onClick={() => {
            if (!window.confirm("Удалить картинку? Глагол выпадет из тренажёра с картинками.")) return;
            setPreview(null);
            startRemoving(() => removeVerbImage(verbId));
          }}
          className={`${buttonClass.destructive} mt-3`}
        >
          {removing ? <LoaderCircle className="animate-spin" /> : <Trash2 />}
          Удалить картинку
        </button>
      )}
    </Card>
  );
}
