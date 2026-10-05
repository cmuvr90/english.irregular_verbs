"use client";

import { ImageOff, ImageUp, LoaderCircle, Trash2, Upload } from "lucide-react";
import Image from "next/image";
import { useEffect, useRef, useState, useTransition } from "react";

import { ImageZoom } from "./image-zoom";
import { buttonClass, Card } from "./ui";

import { removeVerbImage, uploadVerbImage } from "@/lib/admin-actions";
import { compressImage, isPrecompressedImage } from "@/lib/image-compression";

/** Готовая к загрузке картинка: сжатый файл и object URL для превью. */
type Draft = { file: File; url: string };

/**
 * Картинка глагола для тренажёра «Подбери глагол к картинке». Выбранный файл
 * ещё в браузере уменьшается и сжимается в WebP (compressImage); превью
 * показывает, что именно уйдёт в Vercel Blob, и сколько оно весит.
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
  const [draft, setDraft] = useState<Draft | null>(null);
  // Только что загруженная картинка: показываем её из памяти, а не с CDN —
  // сразу после перезаписи файла CDN может ещё не отдавать его по новому
  // адресу. После перезагрузки страницы показывается уже imageUrl.
  const [uploadedUrl, setUploadedUrl] = useState<string | null>(null);
  const [compressing, setCompressing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [uploading, startUploading] = useTransition();
  const [removing, startRemoving] = useTransition();

  // Object URL черновиков живут, пока открыта страница: черновик становится
  // загруженной картинкой, и его URL нужен дальше. Освобождаем при уходе.
  const objectUrls = useRef<string[]>([]);
  useEffect(() => {
    const urls = objectUrls.current;
    return () => urls.forEach((url) => URL.revokeObjectURL(url));
  }, []);

  async function choose(file: File | undefined) {
    if (!file) return;
    setError(null);
    setCompressing(true);
    try {
      const compressed = await compressImage(file, "image");
      const url = URL.createObjectURL(compressed);
      objectUrls.current.push(url);
      setDraft({ file: compressed, url });
    } catch (e) {
      console.error("image compression failed:", e);
      setError("Не удалось прочитать картинку — подойдёт PNG, JPEG, WebP или AVIF");
    } finally {
      setCompressing(false);
    }
  }

  function upload(take: Draft) {
    setError(null);
    startUploading(async () => {
      const formData = new FormData();
      formData.set("image", take.file);
      const result = await uploadVerbImage(verbId, {}, formData);
      if (result.error) return setError(result.error);
      setUploadedUrl(take.url);
      setDraft(null);
    });
  }

  const localUrl = draft?.url ?? uploadedUrl;
  const current = uploadedUrl ?? imageUrl;
  const zoomUrl = localUrl ?? imageUrl;

  return (
    <Card
      title="Картинка"
      description="Для тренажёра «Подбери глагол к картинке». Глагол без картинки в него не попадает."
    >
      <div className="flex flex-col gap-4">
        <div className="relative flex aspect-[4/3] w-full items-center justify-center overflow-hidden rounded-lg bg-slate-50 ring-1 ring-line">
          {zoomUrl && !compressing && (
            <ImageZoom src={zoomUrl} alt={verbLabel} className="absolute inset-0 z-10" />
          )}
          {compressing ? (
            <LoaderCircle className="size-6 animate-spin text-subtle" />
          ) : localUrl ? (
            // Локальный blob: URL — next/image его не оптимизирует, и не нужно.
            // eslint-disable-next-line @next/next/no-img-element
            <img src={localUrl} alt="" className="size-full object-contain" />
          ) : imageUrl ? (
            <Image
              src={imageUrl}
              alt={verbLabel}
              fill
              sizes="20rem"
              unoptimized={isPrecompressedImage(imageUrl)}
              className="object-contain"
            />
          ) : (
            <span className="flex flex-col items-center gap-1 text-subtle">
              <ImageOff className="size-6" />
              <span className="text-xs">Картинки нет</span>
            </span>
          )}
        </div>

        {draft && (
          <p className="text-xs text-subtle">
            Сжато до {formatSize(draft.file.size)} — так она и уйдёт в тренажёр.
          </p>
        )}

        <div className="flex flex-wrap items-center gap-2">
          {draft ? (
            <>
              <button
                type="button"
                disabled={uploading}
                onClick={() => upload(draft)}
                className={buttonClass.success}
              >
                {uploading ? <LoaderCircle className="animate-spin" /> : <Upload />}
                Загрузить
              </button>
              <button
                type="button"
                disabled={uploading}
                onClick={() => setDraft(null)}
                className="rounded-full px-2 py-1.5 text-sm font-medium text-subtle hover:bg-muted hover:text-foreground disabled:opacity-50"
              >
                Отмена
              </button>
            </>
          ) : (
            <>
              <label
                className={`${buttonClass.primary} cursor-pointer ${compressing ? "pointer-events-none opacity-50" : ""}`}
              >
                <ImageUp />
                {current ? "Заменить" : "Выбрать картинку"}
                <input
                  type="file"
                  accept="image/*"
                  className="sr-only"
                  disabled={compressing}
                  onChange={(event) => {
                    void choose(event.target.files?.[0]);
                    event.target.value = "";
                  }}
                />
              </label>
              {current && (
                <button
                  type="button"
                  disabled={removing}
                  onClick={() => {
                    if (!window.confirm("Удалить картинку? Глагол выпадет из тренажёра с картинками."))
                      return;
                    startRemoving(async () => {
                      await removeVerbImage(verbId);
                      setUploadedUrl(null);
                    });
                  }}
                  className={buttonClass.destructive}
                >
                  {removing ? <LoaderCircle className="animate-spin" /> : <Trash2 />}
                  Удалить
                </button>
              )}
            </>
          )}
        </div>

        <p className="text-xs text-subtle">
          Любой формат — перед загрузкой картинка уменьшится до 960 px и сожмётся в WebP. Лучше
          квадрат или 4:3 с одним понятным действием.
        </p>
        {error && <p className="text-xs text-red-600">{error}</p>}
      </div>
    </Card>
  );
}

function formatSize(bytes: number) {
  return bytes < 1024 * 1024
    ? `${Math.max(1, Math.round(bytes / 1024))} КБ`
    : `${(bytes / 1024 / 1024).toFixed(1)} МБ`;
}
