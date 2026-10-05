"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";

import { cn } from "../cn";
import { IconSparkle } from "../icons";
import { type Tone, toneSoft } from "../tones";

export type IllustrationProps = {
  /** Путь к картинке (обычно /images/app/*.webp). */
  src: string;
  alt: string;
  /** Подпись заглушки, пока картинки нет: имя файла или что на ней будет. */
  placeholder?: string;
  tone?: Tone;
  width: number;
  height: number;
  /**
   * Что показать, пока файла нет. В приложении сюда передают рабочую замену
   * (SVG-маскот, иконку), чтобы пользователь не видел техническую заглушку.
   */
  fallback?: React.ReactNode;
  /** Картинка первого экрана: грузить сразу и с высоким приоритетом. */
  eager?: boolean;
  className?: string;
};

/**
 * Иллюстрация с аккуратной заглушкой. Пока файл не сгенерирован (404),
 * вместо битой картинки рисуется плашка в тоне с подписью — макеты
 * в Storybook остаются цельными, а файл подхватится, как только появится.
 */
export function Illustration({ src, alt, placeholder, tone = "ink", width, height, fallback, eager, className }: IllustrationProps) {
  const [failed, setFailed] = useState(false);
  const imgRef = useRef<HTMLImageElement>(null);

  // Картинка из SSR-разметки могла упасть до гидрации — тогда onError уже не
  // придёт. Догоняем: загрузка завершена, а размеров нет — значит, ошибка.
  useEffect(() => {
    const img = imgRef.current;
    if (img?.complete && img.naturalWidth === 0) setFailed(true);
  }, []);

  if (failed && fallback) return <>{fallback}</>;

  if (failed) {
    return (
      <div
        role="img"
        aria-label={alt}
        className={cn("bg-dots flex flex-col items-center justify-center gap-1.5 rounded-xl text-center", toneSoft[tone], className)}
        style={{ aspectRatio: `${width} / ${height}` }}
      >
        <IconSparkle size={22} weight="duotone" aria-hidden />
        <span className="max-w-[90%] truncate font-mono text-[10px] opacity-70">{placeholder ?? src.split("/").pop()}</span>
      </div>
    );
  }

  return (
    <Image
      ref={imgRef}
      src={src}
      alt={alt}
      width={width}
      height={height}
      loading={eager ? "eager" : "lazy"}
      fetchPriority={eager ? "high" : undefined}
      onError={() => setFailed(true)}
      className={cn("object-contain select-none", className)}
      draggable={false}
    />
  );
}
