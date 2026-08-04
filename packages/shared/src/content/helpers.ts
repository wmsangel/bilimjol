import type { LocalizedText } from "./types";

// Виртуальные помощники — персонажи, которые сопровождают ребёнка на занятиях.
// В MVP это эмодзи; позже заменим на настоящие иллюстрации/анимации.
export interface Helper {
  id: string;
  emoji: string;
  name: LocalizedText;
  /** Акцентный цвет персонажа (Tailwind-friendly hue name). */
  color: "orange" | "amber" | "violet" | "pink" | "sky" | "emerald";
}

export const helpers: Helper[] = [
  { id: "fox", emoji: "🦊", name: { ru: "Лисёнок", ky: "Түлкү" }, color: "orange" },
  { id: "bear", emoji: "🐻", name: { ru: "Мишка", ky: "Аюу" }, color: "amber" },
  { id: "owl", emoji: "🦉", name: { ru: "Совёнок", ky: "Үкү" }, color: "violet" },
  { id: "cat", emoji: "🐱", name: { ru: "Котик", ky: "Мышык" }, color: "pink" },
  { id: "penguin", emoji: "🐧", name: { ru: "Пингвинчик", ky: "Пингвин" }, color: "sky" },
  { id: "frog", emoji: "🐸", name: { ru: "Лягушонок", ky: "Бака" }, color: "emerald" },
];

export function getHelper(id: string | null | undefined): Helper | undefined {
  return helpers.find((h) => h.id === id);
}
