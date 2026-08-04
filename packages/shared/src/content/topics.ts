import type { Difficulty, LocalizedText, Subject } from "./types";

// Тема — курс из нескольких заданий внутри предмета.
export interface Topic {
  id: string;
  subject: Subject;
  title: LocalizedText;
  icon: string;
  difficulty: Difficulty;
  order: number;
}

export const topics: Topic[] = [
  // Логика
  { id: "log-odd", subject: "logic", icon: "🍎", difficulty: 1, order: 1,
    title: { ru: "Найди лишнее", ky: "Ашыгын тап" } },
  { id: "log-seq", subject: "logic", icon: "🔷", difficulty: 2, order: 2,
    title: { ru: "Закономерности", ky: "Закон ченемдер" } },
  { id: "log-think", subject: "logic", icon: "🧠", difficulty: 3, order: 3,
    title: { ru: "Логика и сравнение", ky: "Логика жана салыштыруу" } },

  // Математика
  { id: "math-count", subject: "math", icon: "🔢", difficulty: 1, order: 1,
    title: { ru: "Счёт", ky: "Эсептөө" } },
  { id: "math-add", subject: "math", icon: "➕", difficulty: 2, order: 2,
    title: { ru: "Сложение и вычитание", ky: "Кошуу жана кемитүү" } },
  { id: "math-seq", subject: "math", icon: "📈", difficulty: 2, order: 3,
    title: { ru: "Числовые ряды", ky: "Сан катарлары" } },

  // Чтение
  { id: "read-letters", subject: "reading", icon: "🔤", difficulty: 1, order: 1,
    title: { ru: "Буквы и звуки", ky: "Тамгалар жана тыбыштар" } },
];

export function getTopics(subject?: Subject): Topic[] {
  const list = subject ? topics.filter((t) => t.subject === subject) : topics;
  return [...list].sort((a, b) => a.order - b.order);
}

export function getTopic(id: string): Topic | undefined {
  return topics.find((t) => t.id === id);
}
