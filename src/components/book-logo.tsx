/** Логотип приложения: синяя книга в белом скруглённом квадрате. */
export function BookLogo({ className }: { className?: string }) {
  return (
    <div
      className={`flex size-20 items-center justify-center rounded-[22px] bg-white shadow-sm dark:bg-card dark:ring-1 dark:ring-line ${className ?? ""}`}
    >
      <svg width="40" height="40" viewBox="0 0 24 24" fill="none" aria-hidden>
        <path
          d="M12 6.5C10.8 4.9 8.4 4.2 4.5 4.5a1 1 0 0 0-.9 1v11.6a1 1 0 0 0 1.1 1c3.4-.2 5.5.4 7.3 1.9 1.8-1.5 3.9-2.1 7.3-1.9a1 1 0 0 0 1.1-1V5.5a1 1 0 0 0-.9-1c-3.9-.3-6.3.4-7.5 2Z"
          fill="#3b82f6"
        />
        <path d="M12 6.5V20" stroke="#eff6ff" strokeWidth="1.6" strokeLinecap="round" />
      </svg>
    </div>
  );
}
