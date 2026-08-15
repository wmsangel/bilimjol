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
  { id: "cat", emoji: "🐱", name: { ru: "Котик", ky: "Мышык" }, color: "pink", ear: "pointy" },
  { id: "snowleopard", emoji: "🐆", name: { ru: "Ирбис", ky: "Илбирс" }, color: "slate", ear: "round" },
  { id: "dog", emoji: "🐕", name: { ru: "Лабрадор", ky: "Лабрадор" }, color: "yellow", ear: "round" },
  { id: "bear", emoji: "🐻", name: { ru: "Мишка", ky: "Аюу" }, color: "amber", ear: "round" },
  { id: "panda", emoji: "🐼", name: { ru: "Панда", ky: "Панда" }, color: "slate", ear: "round" },
  { id: "bunny", emoji: "🐰", name: { ru: "Зайчик", ky: "Коён" }, color: "rose", ear: "pointy" },
  { id: "frog", emoji: "🐸", name: { ru: "Лягушонок", ky: "Бака" }, color: "emerald", ear: "round" },
  { id: "blocky", emoji: "🧊", name: { ru: "Кубик", ky: "Кубик" }, color: "sky", ear: "none" },
  { id: "steve", emoji: "⛏️", name: { ru: "Стив", ky: "Стив" }, color: "teal", ear: "none" },
  { id: "robot", emoji: "🤖", name: { ru: "Робот", ky: "Робот" }, color: "violet", ear: "none" },
  { id: "monster", emoji: "👾", name: { ru: "Монстрик", ky: "Желмогуз" }, color: "fuchsia", ear: "pointy" },
];

export function getHelper(id: string | null | undefined): Helper | undefined {
  return helpers.find((h) => h.id === id);
}
