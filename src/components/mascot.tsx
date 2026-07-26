/** Маскот стартового экрана: машущий парень в худи с книгой (плоский SVG). */
export function Mascot({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 240 170"
      className={className}
      role="img"
      aria-label="Маскот приложения приветственно машет рукой"
    >
      {/* фон: мягкое пятно и листья */}
      <ellipse cx="122" cy="112" rx="86" ry="58" fill="#dbeafe" opacity="0.55" />
      <g fill="#9ed8c9" opacity="0.85">
        <ellipse cx="204" cy="128" rx="7" ry="16" transform="rotate(24 204 128)" />
        <ellipse cx="216" cy="112" rx="6" ry="13" transform="rotate(44 216 112)" />
        <ellipse cx="196" cy="106" rx="5" ry="11" transform="rotate(-6 196 106)" />
      </g>
      <g fill="#c7d9f0" opacity="0.9">
        <ellipse cx="30" cy="120" rx="6" ry="14" transform="rotate(-24 30 120)" />
        <ellipse cx="44" cy="132" rx="5" ry="11" transform="rotate(8 44 132)" />
      </g>
      {/* искорка */}
      <path d="M196 40 l2.6 6.4 6.4 2.6 -6.4 2.6 -2.6 6.4 -2.6 -6.4 -6.4 -2.6 6.4 -2.6 Z" fill="#7cc4f8" />

      {/* машущая рука (за корпусом) */}
      <line x1="94" y1="100" x2="72" y2="66" stroke="#3b82f6" strokeWidth="17" strokeLinecap="round" />
      <circle cx="70" cy="57" r="10" fill="#f6c9a0" />

      {/* корпус: худи */}
      <path d="M80 170 V124 Q80 96 104 93 L136 93 Q160 96 160 124 V170 Z" fill="#3b82f6" />
      <ellipse cx="120" cy="96" rx="24" ry="9" fill="#2f6fe0" />
      <line x1="120" y1="104" x2="120" y2="170" stroke="#2f6fe0" strokeWidth="2.5" />
      <line x1="112" y1="102" x2="111" y2="116" stroke="#eff6ff" strokeWidth="2.5" strokeLinecap="round" />
      <line x1="128" y1="102" x2="129" y2="116" stroke="#eff6ff" strokeWidth="2.5" strokeLinecap="round" />

      {/* голова */}
      <circle cx="96" cy="64" r="4.5" fill="#f6c9a0" />
      <circle cx="144" cy="64" r="4.5" fill="#f6c9a0" />
      <circle cx="120" cy="62" r="24" fill="#f6c9a0" />
      {/* волосы */}
      <path
        d="M96 60 Q94 34 120 33 Q146 34 144 60 Q142 45 128 44 Q112 42 103 50 Q97 54 96 60 Z"
        fill="#6b4630"
      />
      {/* лицо */}
      <circle cx="111" cy="63" r="2.6" fill="#31261f" />
      <circle cx="129" cy="63" r="2.6" fill="#31261f" />
      <path d="M107 56 q4 -2.5 8 -1" stroke="#5b3d28" strokeWidth="1.8" fill="none" strokeLinecap="round" />
      <path d="M125 55 q4 -1.5 8 1" stroke="#5b3d28" strokeWidth="1.8" fill="none" strokeLinecap="round" />
      <path d="M112 73 Q120 79 128 73" stroke="#b4785a" strokeWidth="2.2" fill="none" strokeLinecap="round" />
      <circle cx="103" cy="70" r="3.6" fill="#f19f9f" opacity="0.35" />
      <circle cx="137" cy="70" r="3.6" fill="#f19f9f" opacity="0.35" />

      {/* книга в правой руке */}
      <line x1="148" y1="106" x2="165" y2="122" stroke="#3b82f6" strokeWidth="15" strokeLinecap="round" />
      <g transform="rotate(-12 172 130)">
        <rect x="152" y="116" width="40" height="28" rx="3" fill="#2563eb" />
        <rect x="155" y="113" width="37" height="26" rx="2.5" fill="#ffffff" />
        <line x1="173" y1="113" x2="173" y2="139" stroke="#dbe6f5" strokeWidth="2" />
        <g stroke="#c9d8ec" strokeWidth="1.6" strokeLinecap="round">
          <line x1="160" y1="120" x2="169" y2="120" />
          <line x1="160" y1="125" x2="169" y2="125" />
          <line x1="160" y1="130" x2="169" y2="130" />
          <line x1="177" y1="120" x2="186" y2="120" />
          <line x1="177" y1="125" x2="186" y2="125" />
          <line x1="177" y1="130" x2="186" y2="130" />
        </g>
      </g>
      <circle cx="163" cy="121" r="8.5" fill="#f6c9a0" />
    </svg>
  );
}
