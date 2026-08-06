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
  { id: "math-tens", subject: "math", grade: 2, icon: "💯", difficulty: 2, order: 3,
    title: { ru: "Числа до 100", ky: "100гө чейинки сандар" } },
  { id: "math-mult", subject: "math", grade: 2, icon: "✖️", difficulty: 3, order: 4,
    title: { ru: "Умножение", ky: "Көбөйтүү" } },
  { id: "math-word", subject: "math", grade: 2, icon: "📝", difficulty: 2, order: 5,
    title: { ru: "Задачи", ky: "Маселелер" } },
  { id: "read-words", subject: "reading", grade: 2, icon: "📖", difficulty: 2, order: 6,
    title: { ru: "Слова и предложения", ky: "Сөздөр жана сүйлөмдөр" } },

  // ── 3 класс ───────────────────────────────────────────
  { id: "m3-mult", subject: "math", grade: 3, icon: "✖️", difficulty: 3, order: 1,
    title: { ru: "Таблица умножения", ky: "Көбөйтүү таблицасы" } },
  { id: "m3-div", subject: "math", grade: 3, icon: "➗", difficulty: 3, order: 2,
    title: { ru: "Деление", ky: "Бөлүү" } },
  { id: "m3-big", subject: "math", grade: 3, icon: "🔢", difficulty: 2, order: 3,
    title: { ru: "Многозначные числа", ky: "Көп орундуу сандар" } },
  { id: "log3", subject: "logic", grade: 3, icon: "🧠", difficulty: 2, order: 4,
    title: { ru: "Логические задачи", ky: "Логикалык маселелер" } },
  { id: "read3", subject: "reading", grade: 3, icon: "📖", difficulty: 2, order: 5,
    title: { ru: "Работа с текстом", ky: "Текст менен иштөө" } },

  // ── 4 класс ───────────────────────────────────────────
  { id: "m4-mult", subject: "math", grade: 4, icon: "✖️", difficulty: 3, order: 1,
    title: { ru: "Умножение и деление", ky: "Көбөйтүү жана бөлүү" } },
  { id: "m4-order", subject: "math", grade: 4, icon: "🧮", difficulty: 3, order: 2,
    title: { ru: "Порядок действий", ky: "Аракеттердин тартиби" } },
  { id: "m4-frac", subject: "math", grade: 4, icon: "🍰", difficulty: 3, order: 3,
    title: { ru: "Доли и дроби", ky: "Үлүштөр жана бөлчөктөр" } },
  { id: "log4", subject: "logic", grade: 4, icon: "🧠", difficulty: 3, order: 4,
    title: { ru: "Закономерности", ky: "Закон ченемдер" } },
  { id: "read4", subject: "reading", grade: 4, icon: "📖", difficulty: 3, order: 5,
    title: { ru: "Слова в тексте", ky: "Тексттеги сөздөр" } },

  // ── 5 класс ───────────────────────────────────────────
  { id: "m5-percent", subject: "math", grade: 5, icon: "💯", difficulty: 3, order: 1,
    title: { ru: "Проценты", ky: "Пайыздар" } },
  { id: "m5-frac", subject: "math", grade: 5, icon: "🍰", difficulty: 3, order: 2,
    title: { ru: "Дроби", ky: "Бөлчөктөр" } },
  { id: "m5-big", subject: "math", grade: 5, icon: "🔢", difficulty: 2, order: 3,
    title: { ru: "Большие числа", ky: "Чоң сандар" } },

  // ── 6 класс ───────────────────────────────────────────
  { id: "m6-neg", subject: "math", grade: 6, icon: "➖", difficulty: 3, order: 1,
    title: { ru: "Отрицательные числа", ky: "Терс сандар" } },
  { id: "m6-eq", subject: "math", grade: 6, icon: "🟰", difficulty: 3, order: 2,
    title: { ru: "Уравнения", ky: "Теңдемелер" } },
  { id: "m6-percent", subject: "math", grade: 6, icon: "💯", difficulty: 3, order: 3,
    title: { ru: "Проценты", ky: "Пайыздар" } },

  // ── 7 класс ───────────────────────────────────────────
  { id: "m7-pow", subject: "math", grade: 7, icon: "🔼", difficulty: 3, order: 1,
    title: { ru: "Степени", ky: "Даражалар" } },
  { id: "m7-eq", subject: "math", grade: 7, icon: "🟰", difficulty: 3, order: 2,
    title: { ru: "Линейные уравнения", ky: "Сызыктуу теңдемелер" } },

  // ── 8 класс ───────────────────────────────────────────
  { id: "m8-sqrt", subject: "math", grade: 8, icon: "📐", difficulty: 3, order: 1,
    title: { ru: "Квадратные корни", ky: "Квадрат тамырлар" } },
  { id: "m8-pow", subject: "math", grade: 8, icon: "🔼", difficulty: 3, order: 2,
    title: { ru: "Степени", ky: "Даражалар" } },
  { id: "m8-eq", subject: "math", grade: 8, icon: "🟰", difficulty: 3, order: 3,
    title: { ru: "Уравнения", ky: "Теңдемелер" } },

  // ── 9 класс ───────────────────────────────────────────
  { id: "m9-prog", subject: "math", grade: 9, icon: "📈", difficulty: 3, order: 1,
    title: { ru: "Прогрессии", ky: "Прогрессиялар" } },
  { id: "m9-pow", subject: "math", grade: 9, icon: "🔼", difficulty: 3, order: 2,
    title: { ru: "Степени", ky: "Даражалар" } },
  { id: "m9-root", subject: "math", grade: 9, icon: "📐", difficulty: 3, order: 3,
    title: { ru: "Корни", ky: "Тамырлар" } },
  { id: "m9-eq", subject: "math", grade: 9, icon: "🟰", difficulty: 3, order: 4,
    title: { ru: "Уравнения", ky: "Теңдемелер" } },

  // ── 10 класс ──────────────────────────────────────────
  { id: "m10-calc", subject: "math", grade: 10, icon: "💯", difficulty: 3, order: 1,
    title: { ru: "Проценты и корни", ky: "Пайыздар жана тамырлар" } },
  { id: "m10-pow", subject: "math", grade: 10, icon: "🔼", difficulty: 3, order: 2,
    title: { ru: "Степени", ky: "Даражалар" } },

  // ── 11 класс ──────────────────────────────────────────
  { id: "m11-calc", subject: "math", grade: 11, icon: "🧮", difficulty: 3, order: 1,
    title: { ru: "Вычисления", ky: "Эсептөөлөр" } },
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
