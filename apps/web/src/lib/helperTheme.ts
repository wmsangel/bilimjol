import type { Helper } from "@izn-study/shared";

// Полные строки классов (не динамические) — чтобы Tailwind JIT их сгенерировал.
export const helperBg: Record<Helper["color"], string> = {
  orange: "bg-orange-100 dark:bg-orange-500/15",
  amber: "bg-amber-100 dark:bg-amber-500/15",
  violet: "bg-violet-100 dark:bg-violet-500/15",
  pink: "bg-pink-100 dark:bg-pink-500/15",
  sky: "bg-sky-100 dark:bg-sky-500/15",
  emerald: "bg-emerald-100 dark:bg-emerald-500/15",
  rose: "bg-rose-100 dark:bg-rose-500/15",
  yellow: "bg-yellow-100 dark:bg-yellow-500/15",
  slate: "bg-slate-100 dark:bg-slate-500/15",
  teal: "bg-teal-100 dark:bg-teal-500/15",
  fuchsia: "bg-fuchsia-100 dark:bg-fuchsia-500/15",
  red: "bg-red-100 dark:bg-red-500/15",
};

// Яркие градиенты для крупного аватара помощника.
export const helperGradient: Record<Helper["color"], string> = {
  orange: "from-orange-300 to-amber-400",
  amber: "from-amber-300 to-yellow-400",
  violet: "from-violet-300 to-purple-400",
  pink: "from-pink-300 to-rose-400",
  sky: "from-sky-300 to-blue-400",
  emerald: "from-emerald-300 to-green-400",
  rose: "from-rose-300 to-pink-400",
  yellow: "from-yellow-300 to-amber-400",
  slate: "from-slate-300 to-slate-400",
  teal: "from-teal-300 to-cyan-400",
  fuchsia: "from-fuchsia-300 to-purple-400",
  red: "from-red-300 to-orange-400",
};

// Hex-цвета для рисованного SVG-лица: [светлый, тёмный] для градиента головы.
export const helperFace: Record<Helper["color"], { light: string; dark: string }> = {
  orange: { light: "#fdba74", dark: "#f97316" },
  amber: { light: "#fcd34d", dark: "#f59e0b" },
  violet: { light: "#c4b5fd", dark: "#a78bfa" },
  pink: { light: "#f9a8d4", dark: "#f472b6" },
  sky: { light: "#7dd3fc", dark: "#38bdf8" },
  emerald: { light: "#6ee7b7", dark: "#34d399" },
  rose: { light: "#fda4af", dark: "#fb7185" },
  yellow: { light: "#fde047", dark: "#facc15" },
  slate: { light: "#cbd5e1", dark: "#94a3b8" },
  teal: { light: "#5eead4", dark: "#2dd4bf" },
  fuchsia: { light: "#f0abfc", dark: "#e879f9" },
  red: { light: "#fca5a5", dark: "#f87171" },
};
