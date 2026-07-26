/**
 * Единая палитра иконок приложения.
 *
 * Все иконки декоративные (`aria-hidden`) и рисуются `currentColor`, поэтому
 * цвет задаётся классом на родителе, а размер — пропом `size`.
 */

type IconProps = {
  size?: number;
  className?: string;
};

function svgProps({ size = 22, className }: IconProps) {
  return {
    width: size,
    height: size,
    viewBox: "0 0 24 24",
    fill: "none" as const,
    className,
    "aria-hidden": true,
  };
}

export function BookIcon(props: IconProps) {
  return (
    <svg {...svgProps(props)}>
      <path
        d="M12 6.5C10.8 4.9 8.4 4.2 4.5 4.5a1 1 0 0 0-.9 1v11.6a1 1 0 0 0 1.1 1c3.4-.2 5.5.4 7.3 1.9 1.8-1.5 3.9-2.1 7.3-1.9a1 1 0 0 0 1.1-1V5.5a1 1 0 0 0-.9-1c-3.9-.3-6.3.4-7.5 2Z"
        fill="currentColor"
      />
      <path d="M12 6.5V20" stroke="#fff" strokeWidth="1.5" strokeLinecap="round" opacity="0.7" />
    </svg>
  );
}

export function FlameIcon(props: IconProps) {
  return (
    <svg {...svgProps(props)}>
      <path
        d="M12 3s1 2.4 1 4.2c1.1-.6 2-1.7 2-1.7 2.4 2 4 4.6 4 7.5a7 7 0 0 1-14 0c0-4.4 4-6.5 7-10Z"
        fill="currentColor"
      />
      <path
        d="M12 19.5a3 3 0 0 1-3-3c0-1.7 1.6-2.7 3-4 1.4 1.3 3 2.3 3 4a3 3 0 0 1-3 3Z"
        fill="#fff"
        opacity="0.5"
      />
    </svg>
  );
}

export function CalendarIcon(props: IconProps) {
  return (
    <svg {...svgProps(props)}>
      <rect x="3.5" y="5" width="17" height="15.5" rx="3" stroke="currentColor" strokeWidth="1.8" />
      <path d="M3.5 9.5h17M8 3v3.5M16 3v3.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
      <path
        d="m9.5 14.5 2 2 3.5-3.5"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function ChartIcon(props: IconProps) {
  return (
    <svg {...svgProps(props)}>
      <rect x="4" y="12" width="4" height="8" rx="1.2" fill="currentColor" />
      <rect x="10" y="8" width="4" height="12" rx="1.2" fill="currentColor" />
      <rect x="16" y="4" width="4" height="16" rx="1.2" fill="currentColor" />
    </svg>
  );
}

export function HeartIcon(props: IconProps) {
  return (
    <svg {...svgProps(props)}>
      <path
        d="M12 20.5S3.5 15.5 3.5 9.7A4.7 4.7 0 0 1 12 7a4.7 4.7 0 0 1 8.5 2.7c0 5.8-8.5 10.8-8.5 10.8Z"
        fill="currentColor"
      />
    </svg>
  );
}

export function UserIcon(props: IconProps) {
  return (
    <svg {...svgProps(props)}>
      <circle cx="12" cy="8" r="3.5" stroke="currentColor" strokeWidth="1.8" />
      <path
        d="M5 19.5c1.2-3 3.8-4.5 7-4.5s5.8 1.5 7 4.5"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
    </svg>
  );
}

export function MailIcon(props: IconProps) {
  return (
    <svg {...svgProps(props)}>
      <rect x="3" y="5" width="18" height="14" rx="2.5" stroke="currentColor" strokeWidth="1.7" />
      <path
        d="m4 7 8 6 8-6"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function LockIcon(props: IconProps) {
  return (
    <svg {...svgProps(props)}>
      <rect x="5" y="10" width="14" height="10" rx="2.5" stroke="currentColor" strokeWidth="1.7" />
      <path d="M8 10V7.5a4 4 0 0 1 8 0V10" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
      <circle cx="12" cy="15" r="1.4" fill="currentColor" />
    </svg>
  );
}

export function EyeIcon(props: IconProps) {
  return (
    <svg {...svgProps(props)}>
      <path
        d="M2.5 12S6 5.5 12 5.5 21.5 12 21.5 12 18 18.5 12 18.5 2.5 12 2.5 12Z"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinejoin="round"
      />
      <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="1.7" />
    </svg>
  );
}

export function EyeOffIcon(props: IconProps) {
  return (
    <svg {...svgProps(props)}>
      <path
        d="M4 4l16 16M9.9 6.1A9.6 9.6 0 0 1 12 5.5c6 0 9.5 6.5 9.5 6.5a17.6 17.6 0 0 1-3.2 3.9M6 8a17 17 0 0 0-3.5 4S6 18.5 12 18.5c1 0 2-.2 2.8-.5M10 10.1a3 3 0 0 0 4 4.2"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/** Значок «Поделиться» из iOS — чтобы инструкция по установке узнавалась визуально. */
export function ShareIcon({ size = 14, className }: IconProps) {
  return (
    <svg
      {...svgProps({ size })}
      viewBox="0 0 16 16"
      className={`inline-block align-[-2px] ${className ?? ""}`}
    >
      <path
        d="M8 1v9M5 3.5L8 1l3 2.5M3.5 7H3a1 1 0 0 0-1 1v6a1 1 0 0 0 1 1h10a1 1 0 0 0 1-1V8a1 1 0 0 0-1-1h-.5"
        stroke="currentColor"
        strokeWidth="1.3"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function CloseIcon({ size = 16, className }: IconProps) {
  return (
    <svg {...svgProps({ size, className })} viewBox="0 0 16 16">
      <path d="M4 4l8 8m0-8l-8 8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

export function ChevronIcon({ size = 16, className }: IconProps) {
  return (
    <svg {...svgProps({ size, className })}>
      <path
        d="m9 5 7 7-7 7"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function TargetIcon({ size = 16, className }: IconProps) {
  return (
    <svg {...svgProps({ size, className })}>
      <circle cx="12" cy="12" r="8.5" stroke="currentColor" strokeWidth="1.8" />
      <circle cx="12" cy="12" r="4.5" stroke="currentColor" strokeWidth="1.8" />
      <circle cx="12" cy="12" r="1.4" fill="currentColor" />
    </svg>
  );
}

export function CardsIcon({ size = 26, className }: IconProps) {
  return (
    <svg {...svgProps({ size, className })}>
      <rect x="3" y="5" width="13" height="11" rx="2" fill="currentColor" />
      <path d="M6.5 9h6M6.5 12h4" stroke="#fff" strokeWidth="1.5" strokeLinecap="round" />
      <path
        d="M18.5 8.5h1.5a1 1 0 0 1 1 1V18a1 1 0 0 1-1 1h-9a1 1 0 0 1-1-1v-.5"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
      />
      <path d="M18 12.5v3M16.5 14h3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

export function HomeIcon(props: IconProps) {
  return (
    <svg {...svgProps(props)}>
      <path
        d="M4 10.5 12 4l8 6.5V19a1 1 0 0 1-1 1h-4.5v-5h-5v5H5a1 1 0 0 1-1-1v-8.5Z"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinejoin="round"
        fill="currentColor"
        fillOpacity="0.15"
      />
    </svg>
  );
}

export function DumbbellIcon(props: IconProps) {
  return (
    <svg {...svgProps(props)}>
      <path d="M8.5 12h7" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
      <rect x="4.5" y="8" width="3" height="8" rx="1.2" fill="currentColor" />
      <rect x="16.5" y="8" width="3" height="8" rx="1.2" fill="currentColor" />
      <rect x="2" y="10" width="2" height="4" rx="0.9" fill="currentColor" />
      <rect x="20" y="10" width="2" height="4" rx="0.9" fill="currentColor" />
    </svg>
  );
}

export function ListIcon(props: IconProps) {
  return (
    <svg {...svgProps(props)}>
      <circle cx="5.5" cy="6.5" r="1.4" fill="currentColor" />
      <circle cx="5.5" cy="12" r="1.4" fill="currentColor" />
      <circle cx="5.5" cy="17.5" r="1.4" fill="currentColor" />
      <path
        d="M10 6.5h9M10 12h9M10 17.5h9"
        stroke="currentColor"
        strokeWidth="1.9"
        strokeLinecap="round"
      />
    </svg>
  );
}

export function RepeatIcon(props: IconProps) {
  return (
    <svg {...svgProps(props)}>
      <path d="M17.5 7.5a7 7 0 1 0 2 5" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" />
      <path
        d="M17.5 3.5v4h-4"
        stroke="currentColor"
        strokeWidth="1.9"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function GearIcon(props: IconProps) {
  return (
    <svg {...svgProps(props)}>
      <path
        d="M12 2.8 14 4.5l2.6-.5 1.4 2.3 2.5.9v2.7l1.7 2.1-1.7 2.1v2.7l-2.5.9-1.4 2.3-2.6-.5-2 1.7-2-1.7-2.6.5-1.4-2.3-2.5-.9v-2.7L1.8 12l1.7-2.1V7.2l2.5-.9 1.4-2.3 2.6.5 2-1.7Z"
        fill="currentColor"
      />
      <circle cx="12" cy="12" r="3.4" fill="#fff" />
    </svg>
  );
}

export function GlobeIcon({ size = 20, className }: IconProps) {
  return (
    <svg {...svgProps({ size, className })}>
      <circle cx="12" cy="12" r="8.5" stroke="currentColor" strokeWidth="1.7" />
      <path
        d="M3.5 12h17M12 3.5c2.2 2.3 3.4 5.3 3.4 8.5s-1.2 6.2-3.4 8.5c-2.2-2.3-3.4-5.3-3.4-8.5S9.8 5.8 12 3.5Z"
        stroke="currentColor"
        strokeWidth="1.7"
      />
    </svg>
  );
}

export function SignOutIcon({ size = 20, className }: IconProps) {
  return (
    <svg {...svgProps({ size, className })}>
      <path
        d="M14 4h-7a1 1 0 0 0-1 1v14a1 1 0 0 0 1 1h7M10 12h11m0 0-3.5-3.5M21 12l-3.5 3.5"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/* ---------- крупные иллюстрации ---------- */

/** Мишень со стрелой для карточки «Сегодня». */
export function TargetBoard({ size = 92, className }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 96 96"
      className={`shrink-0 ${className ?? ""}`}
      aria-hidden
    >
      <ellipse cx="48" cy="86" rx="26" ry="5" fill="#93c5fd" opacity="0.4" />
      <path d="M20 82 q6 -8 12 -4" stroke="#86d3b2" strokeWidth="5" strokeLinecap="round" fill="none" />
      <path d="M76 82 q-6 -8 -12 -4" stroke="#86d3b2" strokeWidth="5" strokeLinecap="round" fill="none" />
      <circle cx="48" cy="48" r="34" fill="#3b82f6" />
      <circle cx="48" cy="48" r="26" fill="#ffffff" />
      <circle cx="48" cy="48" r="18" fill="#60a5fa" />
      <circle cx="48" cy="48" r="10" fill="#ffffff" />
      <circle cx="48" cy="48" r="4.5" fill="#2563eb" />
      <path d="M48 48 76 20" stroke="#1e40af" strokeWidth="4" strokeLinecap="round" />
      <path d="M76 20 88 17 79 8 76 20Z" fill="#f59e0b" />
    </svg>
  );
}

/** Ракета для страницы «Скоро». */
export function RocketIcon({ size = 44, className }: IconProps) {
  return (
    <svg {...svgProps({ size, className })}>
      <path
        d="M12 15c-1.5-.4-2.6-1.5-3-3 .8-3.6 3-6.7 6.5-8.5 1.5-.8 3.2-1.2 4.6-1-.1 1.5-.4 3.2-1.2 4.7-1.8 3.4-3.4 6-6.9 7.8Z"
        fill="#3b82f6"
      />
      <circle cx="15.2" cy="8.8" r="1.6" fill="#eff6ff" />
      <path
        d="M9 12c-1.6 0-3.2 1-4 2.5 1-.2 1.9-.1 2.6.3M12 15c0 1.6-1 3.2-2.5 4 .2-1 .1-1.9-.3-2.6"
        stroke="#60a5fa"
        strokeWidth="1.6"
        strokeLinecap="round"
      />
      <path d="m5.5 18.5-1 1M8 20l-.5.5M4 16l-.5.5" stroke="#f59e0b" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  );
}
