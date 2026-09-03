// Значок бренда «книга-дорога» на светлой плитке — для шапки сайта.
export function BrandMark({ size = 30 }: { size?: number }) {
  return (
    <svg
      viewBox="0 0 120 120"
      width={size}
      height={size}
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      style={{ flex: "none" }}
    >
      <defs>
        <linearGradient id="bmTile" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#efeaff" />
          <stop offset="1" stopColor="#ffe9cf" />
        </linearGradient>
      </defs>
      <rect x="0" y="0" width="120" height="120" rx="28" fill="url(#bmTile)" />
      <path
        d="M60 80 C53 62 72 57 76 42"
        stroke="#6d5cf7"
        strokeWidth="8.5"
        fill="none"
        strokeLinecap="round"
      />
      <path
        d="M78 15 l3.6 7.6 8.4 1.1 -6 5.8 1.5 8.4 -7.5 -4 -7.5 4 1.5 -8.4 -6 -5.8 8.4 -1.1 Z"
        fill="#f7b32b"
        stroke="#ffffff"
        strokeWidth="1.3"
        strokeLinejoin="round"
      />
      <path d="M60 104 L20 88 L20 82 L60 98 Z" fill="#3a2f9e" />
      <path d="M60 104 L100 88 L100 82 L60 98 Z" fill="#3a2f9e" />
      <path d="M60 98 L23 83 C23 83 24.5 63 24.5 63 L60 75 Z" fill="#f4f2ff" />
      <path d="M60 98 L97 83 C97 83 95.5 63 95.5 63 L60 75 Z" fill="#fbfaff" />
      <path d="M60 75 L60 98" stroke="#6d5cf7" strokeWidth="1.8" />
    </svg>
  );
}
