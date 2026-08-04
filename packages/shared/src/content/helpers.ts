import type { LocalizedText } from "./types";

// Виртуальные помощники — персонажи, которые сопровождают ребёнка на занятиях.
// В MVP это эмодзи; позже заменим на настоящие иллюстрации/анимации.
export interface Helper {
  id: string;
  emoji: string;
  name: LocalizedText;
  /** Акцентный цвет персонажа (Tailwind-friendly hue name). */
  color: "orange" | "amber" | "violet" | "pink" | "sky" | "emerald";
  /** Форма ушек для рисованного лица. */
  ear: "pointy" | "round" | "none";
}

export const helpers: Helper[] = [
  { id: "fox", emoji: "🦊", name: { ru: "Лисёнок", ky: "Түлкү" }, color: "orange", ear: "pointy" },
  { id: "bear", emoji: "🐻", name: { ru: "Мишка", ky: "Аюу" }, color: "amber", ear: "round" },
  { id: "owl", emoji: "🦉", name: { ru: "Совёнок", ky: "Үкү" }, color: "violet", ear: "pointy" },
  { id: "cat", emoji: "🐱", name: { ru: "Котик", ky: "Мышык" }, color: "pink", ear: "pointy" },
  { id: "penguin", emoji: "🐧", name: { ru: "Пингвинчик", ky: "Пингвин" }, color: "sky", ear: "none" },
  { id: "frog", emoji: "🐸", name: { ru: "Лягушонок", ky: "Бака" }, color: "emerald", ear: "round" },
];

export function getHelper(id: string | null | undefined): Helper | undefined {
  return helpers.find((h) => h.id === id);
}
