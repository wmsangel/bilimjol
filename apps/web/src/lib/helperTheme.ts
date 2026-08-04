import type { Helper } from "@izn-study/shared";

// Полные строки классов (не динамические) — чтобы Tailwind JIT их сгенерировал.
export const helperBg: Record<Helper["color"], string> = {
  orange: "bg-orange-100 dark:bg-orange-500/15",
  amber: "bg-amber-100 dark:bg-amber-500/15",
  violet: "bg-violet-100 dark:bg-violet-500/15",
  pink: "bg-pink-100 dark:bg-pink-500/15",
  sky: "bg-sky-100 dark:bg-sky-500/15",
  emerald: "bg-emerald-100 dark:bg-emerald-500/15",
};

// Яркие градиенты для крупного аватара помощника.
export const helperGradient: Record<Helper["color"], string> = {
  orange: "from-orange-300 to-amber-400",
  amber: "from-amber-300 to-yellow-400",
  violet: "from-violet-300 to-purple-400",
  pink: "from-pink-300 to-rose-400",
  sky: "from-sky-300 to-blue-400",
  emerald: "from-emerald-300 to-green-400",
};

// Hex-цвета для рисованного SVG-лица: [светлый, тёмный] для градиента головы.
export const helperFace: Record<Helper["color"], { light: string; dark: string }> = {
  orange: { light: "#fdba74", dark: "#f97316" },
  amber: { light: "#fcd34d", dark: "#f59e0b" },
  violet: { light: "#c4b5fd", dark: "#a78bfa" },
  pink: { light: "#f9a8d4", dark: "#f472b6" },
  sky: { light: "#7dd3fc", dark: "#38bdf8" },
  emerald: { light: "#6ee7b7", dark: "#34d399" },
};
