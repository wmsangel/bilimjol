import type { LocalizedText } from "./types";

// Виртуальные помощники — персонажи, которые сопровождают ребёнка на занятиях.
// В MVP это эмодзи; позже заменим на настоящие иллюстрации/анимации.
export interface Helper {
  id: string;
  emoji: string;
  name: LocalizedText;
  /** Акцентный цвет персонажа (Tailwind-friendly hue name). */
  color:
    | "orange"
    | "amber"
    | "violet"
    | "pink"
    | "sky"
    | "emerald"
    | "rose"
    | "yellow"
    | "slate"
    | "teal"
    | "fuchsia"
    | "red";
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
  { id: "rabbit", emoji: "🐰", name: { ru: "Зайчик", ky: "Коён" }, color: "rose", ear: "pointy" },
  { id: "lion", emoji: "🦁", name: { ru: "Львёнок", ky: "Арстан" }, color: "yellow", ear: "round" },
  { id: "panda", emoji: "🐼", name: { ru: "Панда", ky: "Панда" }, color: "slate", ear: "round" },
  { id: "dragon", emoji: "🐲", name: { ru: "Дракоша", ky: "Ажыдаар" }, color: "teal", ear: "pointy" },
  { id: "unicorn", emoji: "🦄", name: { ru: "Единорожка", ky: "Единорог" }, color: "fuchsia", ear: "pointy" },
  { id: "tiger", emoji: "🐯", name: { ru: "Тигрёнок", ky: "Жолборс" }, color: "red", ear: "pointy" },
];

export function getHelper(id: string | null | undefined): Helper | undefined {
  return helpers.find((h) => h.id === id);
}
