import type { Difficulty, Grade, LocalizedText, Subject } from "./types";

// Тема — курс из нескольких заданий внутри предмета и класса.
export interface Topic {
  id: string;
  subject: Subject;
  grade: Grade;
  title: LocalizedText;
  icon: string;
  difficulty: Difficulty;
  order: number;
}

export const topics: Topic[] = [
  // ── Подготовка к школе (класс 0) ──────────────────────
  { id: "pre-count", subject: "math", grade: 0, icon: "🔢", difficulty: 1, order: 1,
    title: { ru: "Счёт до 5", ky: "5ке чейин санөө" } },
  { id: "pre-more", subject: "math", grade: 0, icon: "⚖️", difficulty: 1, order: 2,
    title: { ru: "Где больше", ky: "Кайда көп" } },
  { id: "pre-odd", subject: "logic", grade: 0, icon: "🍎", difficulty: 1, order: 3,
    title: { ru: "Найди лишнее", ky: "Ашыгын тап" } },
  { id: "pre-shapes", subject: "logic", grade: 0, icon: "🔷", difficulty: 1, order: 4,
    title: { ru: "Цвета и фигуры", ky: "Түстөр жана фигуралар" } },
  { id: "pre-letters", subject: "reading", grade: 0, icon: "🔤", difficulty: 1, order: 5,
    title: { ru: "Первые буквы", ky: "Биринчи тамгалар" } },
  { id: "pre-seq", subject: "logic", grade: 0, icon: "➡️", difficulty: 1, order: 6,
    title: { ru: "Что дальше?", ky: "Андан ары эмне?" } },
  { id: "pre-big", subject: "logic", grade: 0, icon: "📏", difficulty: 1, order: 7,
    title: { ru: "Большой и маленький", ky: "Чоң жана кичине" } },

  // ── 1 класс ───────────────────────────────────────────
  { id: "log-odd", subject: "logic", grade: 1, icon: "🍎", difficulty: 1, order: 1,
    title: { ru: "Найди лишнее", ky: "Ашыгын тап" } },
  { id: "log-seq", subject: "logic", grade: 1, icon: "🔷", difficulty: 2, order: 2,
    title: { ru: "Закономерности", ky: "Закон ченемдер" } },
  { id: "math-count", subject: "math", grade: 1, icon: "🔢", difficulty: 1, order: 3,
    title: { ru: "Счёт", ky: "Эсептөө" } },
  { id: "math-add", subject: "math", grade: 1, icon: "➕", difficulty: 2, order: 4,
    title: { ru: "Сложение и вычитание", ky: "Кошуу жана кемитүү" } },
  { id: "read-letters", subject: "reading", grade: 1, icon: "🔤", difficulty: 1, order: 5,
    title: { ru: "Буквы и звуки", ky: "Тамгалар жана тыбыштар" } },
  { id: "math-ten", subject: "math", grade: 1, icon: "🔟", difficulty: 2, order: 6,
    title: { ru: "Числа до 10", ky: "10го чейинки сандар" } },
  { id: "math-compare", subject: "math", grade: 1, icon: "⚖️", difficulty: 1, order: 7,
    title: { ru: "Больше и меньше", ky: "Чоң жана кичине" } },
  { id: "read-vowels", subject: "reading", grade: 1, icon: "🅰️", difficulty: 2, order: 8,
    title: { ru: "Гласные и согласные", ky: "Үндүү жана үнсүз" } },

  // ── 2 класс ───────────────────────────────────────────
  { id: "log-think", subject: "logic", grade: 2, icon: "🧠", difficulty: 3, order: 1,
    title: { ru: "Логика и сравнение", ky: "Логика жана салыштыруу" } },
  { id: "math-seq", subject: "math", grade: 2, icon: "📈", difficulty: 2, order: 2,
    title: { ru: "Числовые ряды", ky: "Сан катарлары" } },
];

/** Доступные классы (по имеющемуся контенту), по возрастанию. */
export const GRADES: Grade[] = [...new Set(topics.map((t) => t.grade))].sort(
  (a, b) => a - b,
);

export function getTopics(filter?: { subject?: Subject; grade?: Grade }): Topic[] {
  return topics
    .filter((t) => {
      if (filter?.subject && t.subject !== filter.subject) return false;
      if (filter?.grade !== undefined && t.grade !== filter.grade) return false;
      return true;
    })
    .sort((a, b) => a.order - b.order);
}

export function getTopic(id: string): Topic | undefined {
  return topics.find((t) => t.id === id);
}
