"use client";

import { X } from "lucide-react";
import { useRef } from "react";

/**
 * Кнопка, открывающая картинку на весь экран. Внутри кнопки — что угодно
 * (миниатюра, или ничего, если кнопка накрывает превью поверх).
 *
 * Нативный модальный dialog: Esc, фокус и затемнение фона браузер делает
 * сам. Закрывается кликом в любое место или крестиком. Показываем исходный
 * файл, а не копию из оптимизатора — в нём все детали.
 */
export function ImageZoom({
  src,
  alt,
  className = "",
  children,
}: {
  src: string;
  alt: string;
  className?: string;
  children?: React.ReactNode;
}) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const close = () => dialogRef.current?.close();

  return (
    <>
      <button
        type="button"
        onClick={() => dialogRef.current?.showModal()}
        aria-label={`Открыть картинку крупно: ${alt}`}
        title="Открыть крупно"
        className={`cursor-zoom-in focus-visible:ring-3 focus-visible:ring-blue-500/40 focus-visible:outline-none ${className}`}
      >
        {children}
      </button>

      <dialog
        ref={dialogRef}
        onClick={close}
        aria-label={alt}
        className="m-0 h-dvh max-h-none w-dvw max-w-none cursor-zoom-out border-0 bg-transparent p-0 backdrop:bg-black/85"
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={src} alt={alt} className="size-full object-contain p-4 sm:p-10" />
        <button
          type="button"
          onClick={close}
          aria-label="Закрыть"
          className="fixed top-4 right-4 rounded-full bg-white/10 p-2 text-white hover:bg-white/20 [&_svg]:size-5"
        >
          <X />
        </button>
      </dialog>
    </>
  );
}
