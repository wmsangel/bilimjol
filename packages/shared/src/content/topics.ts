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
  { id: "world1", subject: "world", grade: 1, icon: "🐾", difficulty: 1, order: 9,
    title: { ru: "Природа вокруг", ky: "Айланадагы жаратылыш" } },

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
  { id: "world2", subject: "world", grade: 2, icon: "🍂", difficulty: 1, order: 7,
    title: { ru: "Времена года", ky: "Жыл мезгилдери" } },

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
  { id: "world3", subject: "world", grade: 3, icon: "🐝", difficulty: 2, order: 6,
    title: { ru: "Живая природа", ky: "Тирүү жаратылыш" } },

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
  { id: "world4", subject: "world", grade: 4, icon: "🌍", difficulty: 2, order: 6,
    title: { ru: "Планета Земля", ky: "Жер планетасы" } },

  // ── 5 класс ───────────────────────────────────────────
  { id: "m5-percent", subject: "math", grade: 5, icon: "💯", difficulty: 3, order: 1,
    title: { ru: "Проценты", ky: "Пайыздар" } },
  { id: "m5-frac", subject: "math", grade: 5, icon: "🍰", difficulty: 3, order: 2,
    title: { ru: "Дроби", ky: "Бөлчөктөр" } },
  { id: "m5-big", subject: "math", grade: 5, icon: "🔢", difficulty: 2, order: 3,
    title: { ru: "Большие числа", ky: "Чоң сандар" } },
  { id: "log5", subject: "logic", grade: 5, icon: "🧠", difficulty: 2, order: 4,
    title: { ru: "Логика и ряды", ky: "Логика жана катарлар" } },
  { id: "read5", subject: "reading", grade: 5, icon: "📖", difficulty: 2, order: 5,
    title: { ru: "Части речи", ky: "Сөз түркүмдөрү" } },
  { id: "world5", subject: "world", grade: 5, icon: "🌍", difficulty: 2, order: 6,
    title: { ru: "Природа и Земля", ky: "Жаратылыш жана Жер" } },

  // ── 6 класс ───────────────────────────────────────────
  { id: "m6-neg", subject: "math", grade: 6, icon: "➖", difficulty: 3, order: 1,
    title: { ru: "Отрицательные числа", ky: "Терс сандар" } },
  { id: "m6-eq", subject: "math", grade: 6, icon: "🟰", difficulty: 3, order: 2,
    title: { ru: "Уравнения", ky: "Теңдемелер" } },
  { id: "m6-percent", subject: "math", grade: 6, icon: "💯", difficulty: 3, order: 3,
    title: { ru: "Проценты", ky: "Пайыздар" } },
  { id: "log6", subject: "logic", grade: 6, icon: "🧠", difficulty: 3, order: 4,
    title: { ru: "Логика и закономерности", ky: "Логика жана мыйзам ченемдер" } },
  { id: "read6", subject: "reading", grade: 6, icon: "📖", difficulty: 3, order: 5,
    title: { ru: "Язык и слова", ky: "Тил жана сөздөр" } },
  { id: "world6", subject: "world", grade: 6, icon: "🗺️", difficulty: 2, order: 6,
    title: { ru: "География", ky: "География" } },

  // ── 7 класс ───────────────────────────────────────────
  { id: "m7-pow", subject: "math", grade: 7, icon: "🔼", difficulty: 3, order: 1,
    title: { ru: "Степени", ky: "Даражалар" } },
  { id: "m7-eq", subject: "math", grade: 7, icon: "🟰", difficulty: 3, order: 2,
    title: { ru: "Линейные уравнения", ky: "Сызыктуу теңдемелер" } },
  { id: "log7", subject: "logic", grade: 7, icon: "🧠", difficulty: 3, order: 3,
    title: { ru: "Логические задачи", ky: "Логикалык маселелер" } },
  { id: "read7", subject: "reading", grade: 7, icon: "📖", difficulty: 3, order: 4,
    title: { ru: "Грамотность", ky: "Сабаттуулук" } },
  { id: "world7", subject: "world", grade: 7, icon: "🫀", difficulty: 3, order: 5,
    title: { ru: "Человек и биология", ky: "Адам жана биология" } },
  { id: "m7-geo", subject: "math", grade: 7, icon: "📐", difficulty: 3, order: 6,
    title: { ru: "Периметр и площадь", ky: "Периметр жана аянт" } },

  // ── 8 класс ───────────────────────────────────────────
  { id: "m8-sqrt", subject: "math", grade: 8, icon: "📐", difficulty: 3, order: 1,
    title: { ru: "Квадратные корни", ky: "Квадрат тамырлар" } },
  { id: "m8-pow", subject: "math", grade: 8, icon: "🔼", difficulty: 3, order: 2,
    title: { ru: "Степени", ky: "Даражалар" } },
  { id: "m8-eq", subject: "math", grade: 8, icon: "🟰", difficulty: 3, order: 3,
    title: { ru: "Уравнения", ky: "Теңдемелер" } },
  { id: "log8", subject: "logic", grade: 8, icon: "🧠", difficulty: 3, order: 4,
    title: { ru: "Логика и множества", ky: "Логика жана көптүктөр" } },
  { id: "read8", subject: "reading", grade: 8, icon: "📖", difficulty: 3, order: 5,
    title: { ru: "Синтаксис", ky: "Синтаксис" } },
  { id: "world8", subject: "world", grade: 8, icon: "⚗️", difficulty: 3, order: 6,
    title: { ru: "Физика и химия", ky: "Физика жана химия" } },
  { id: "m8-geo", subject: "math", grade: 8, icon: "📐", difficulty: 3, order: 7,
    title: { ru: "Теорема Пифагора", ky: "Пифагор теоремасы" } },

  // ── 9 класс ───────────────────────────────────────────
  { id: "m9-prog", subject: "math", grade: 9, icon: "📈", difficulty: 3, order: 1,
    title: { ru: "Прогрессии", ky: "Прогрессиялар" } },
  { id: "m9-pow", subject: "math", grade: 9, icon: "🔼", difficulty: 3, order: 2,
    title: { ru: "Степени", ky: "Даражалар" } },
  { id: "m9-root", subject: "math", grade: 9, icon: "📐", difficulty: 3, order: 3,
    title: { ru: "Корни", ky: "Тамырлар" } },
  { id: "m9-eq", subject: "math", grade: 9, icon: "🟰", difficulty: 3, order: 4,
    title: { ru: "Уравнения", ky: "Теңдемелер" } },
  { id: "log9", subject: "logic", grade: 9, icon: "🧠", difficulty: 3, order: 5,
    title: { ru: "Логика и комбинаторика", ky: "Логика жана комбинаторика" } },
  { id: "world9", subject: "world", grade: 9, icon: "🧪", difficulty: 3, order: 6,
    title: { ru: "Химия и физика", ky: "Химия жана физика" } },
  { id: "m9-geo", subject: "math", grade: 9, icon: "📐", difficulty: 3, order: 7,
    title: { ru: "Площади фигур", ky: "Фигуралардын аянты" } },
  { id: "read9", subject: "reading", grade: 9, icon: "📖", difficulty: 3, order: 8,
    title: { ru: "Значение слов", ky: "Сөздөрдүн мааниси" } },

  // ── 10 класс ──────────────────────────────────────────
  { id: "m10-calc", subject: "math", grade: 10, icon: "💯", difficulty: 3, order: 1,
    title: { ru: "Проценты и корни", ky: "Пайыздар жана тамырлар" } },
  { id: "m10-pow", subject: "math", grade: 10, icon: "🔼", difficulty: 3, order: 2,
    title: { ru: "Степени", ky: "Даражалар" } },
  { id: "log10", subject: "logic", grade: 10, icon: "🧠", difficulty: 3, order: 3,
    title: { ru: "Логика и высказывания", ky: "Логика жана пикирлер" } },
  { id: "world10", subject: "world", grade: 10, icon: "🔬", difficulty: 3, order: 4,
    title: { ru: "Наука о природе", ky: "Жаратылыш илими" } },
  { id: "m10-eq", subject: "math", grade: 10, icon: "🟰", difficulty: 3, order: 5,
    title: { ru: "Квадратные уравнения", ky: "Квадрат теңдемелер" } },
  { id: "read10", subject: "reading", grade: 10, icon: "📖", difficulty: 3, order: 6,
    title: { ru: "Речь и предложение", ky: "Кеп жана сүйлөм" } },

  // ── 11 класс ──────────────────────────────────────────
  { id: "m11-calc", subject: "math", grade: 11, icon: "🧮", difficulty: 3, order: 1,
    title: { ru: "Вычисления", ky: "Эсептөөлөр" } },
  { id: "log11", subject: "logic", grade: 11, icon: "🧠", difficulty: 3, order: 2,
    title: { ru: "Логика и доказательства", ky: "Логика жана далилдер" } },
  { id: "world11", subject: "world", grade: 11, icon: "🌌", difficulty: 3, order: 3,
    title: { ru: "Наука и космос", ky: "Илим жана космос" } },
  { id: "m11-geo", subject: "math", grade: 11, icon: "📦", difficulty: 3, order: 4,
    title: { ru: "Объёмы тел", ky: "Телолордун көлөмү" } },
  { id: "read11", subject: "reading", grade: 11, icon: "📖", difficulty: 3, order: 5,
    title: { ru: "Язык и текст", ky: "Тил жана текст" } },
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
