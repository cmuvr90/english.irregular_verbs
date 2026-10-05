/**
 * Сжатие картинки глагола прямо в браузере админки, до загрузки в Blob.
 *
 * Картинка в тренажёре — до 448 CSS-пикселей в ширину (picture-match-trainer),
 * на ретине это ~900 физических. Уменьшаем до 960 по длинной стороне и
 * кодируем в WebP: иллюстрация весит десятки килобайт вместо мегабайт.
 * Поэтому такие картинки отдаём без оптимизатора next/image — он не тратит
 * лимит Vercel и не нужен (см. isPrecompressedImage).
 */

const MAX_SIDE = 960;
const QUALITY = 0.8;

/**
 * Любая картинка, которую декодирует браузер (PNG, JPEG, WebP, AVIF, HEIC
 * в Safari…) → WebP не больше MAX_SIDE. Safari до 17 не кодирует WebP —
 * тогда JPEG на белом фоне (у JPEG нет прозрачности, иначе фон станет чёрным).
 */
export async function compressImage(file: Blob, baseName: string): Promise<File> {
  const bitmap = await createImageBitmap(file);
  try {
    const scale = Math.min(1, MAX_SIDE / Math.max(bitmap.width, bitmap.height));
    const width = Math.max(1, Math.round(bitmap.width * scale));
    const height = Math.max(1, Math.round(bitmap.height * scale));
    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    const context = canvas.getContext("2d");
    if (!context) throw new Error("canvas 2d unavailable");
    context.imageSmoothingQuality = "high";

    context.drawImage(bitmap, 0, 0, width, height);
    const webp = await toBlob(canvas, "image/webp");
    if (webp?.type === "image/webp") {
      return new File([webp], `${baseName}.webp`, { type: "image/webp" });
    }

    context.fillStyle = "#fff";
    context.fillRect(0, 0, width, height);
    context.drawImage(bitmap, 0, 0, width, height);
    const jpeg = await toBlob(canvas, "image/jpeg");
    if (!jpeg) throw new Error("image encoding failed");
    return new File([jpeg], `${baseName}.jpg`, { type: "image/jpeg" });
  } finally {
    bitmap.close();
  }
}

function toBlob(canvas: HTMLCanvasElement, type: string) {
  return new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, type, QUALITY));
}

/**
 * Картинка из новой папки verbs/images/ — уже сжата в админке, её отдаём
 * как есть (next/image с unoptimized). Старые verbs/<имя>-<суффикс>.png
 * загружались без сжатия — их по-прежнему пережимает оптимизатор.
 */
export function isPrecompressedImage(url: string) {
  try {
    return new URL(url).pathname.startsWith("/verbs/images/");
  } catch {
    return false;
  }
}
