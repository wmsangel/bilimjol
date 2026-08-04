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
