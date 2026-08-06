import type { Grade, Task } from "./types";

// Генераторы математических заданий: формульные шаблоны (числа + фикс. текст),
// поэтому корректны и одинаково валидны на ru/ky. Даёт объём заданий дёшево.

function addTasks(topic: string, grade: Grade, pairs: [number, number][], freeCount = 4): Task[] {
  return pairs.map(([a, b], i) => ({
    id: `g-${topic}-add-${a}-${b}`,
    type: "number_input",
    subject: "math",
    topic,
    grade,
    difficulty: 1,
    free: i < freeCount,
    prompt: { ru: `Сколько будет ${a} + ${b}?`, ky: `${a} + ${b} канчага барабар?` },
    answer: a + b,
    explanation: { ru: `${a} + ${b} = ${a + b}.`, ky: `${a} + ${b} = ${a + b}.` },
  }));
}

function subTasks(topic: string, grade: Grade, pairs: [number, number][], freeCount = 4): Task[] {
  return pairs.map(([a, b], i) => ({
    id: `g-${topic}-sub-${a}-${b}`,
    type: "number_input",
    subject: "math",
    topic,
    grade,
    difficulty: 1,
    free: i < freeCount,
    prompt: { ru: `Сколько будет ${a} − ${b}?`, ky: `${a} − ${b} канчага барабар?` },
    answer: a - b,
    explanation: { ru: `${a} − ${b} = ${a - b}.`, ky: `${a} − ${b} = ${a - b}.` },
  }));
}

function multTasks(topic: string, grade: Grade, pairs: [number, number][], freeCount = 3): Task[] {
  return pairs.map(([a, b], i) => ({
    id: `g-${topic}-mul-${a}-${b}`,
    type: "number_input",
    subject: "math",
    topic,
    grade,
    difficulty: 3,
    free: i < freeCount,
    prompt: { ru: `Сколько будет ${a} × ${b}?`, ky: `${a} × ${b} канчага барабар?` },
    answer: a * b,
    explanation: { ru: `${a} × ${b} = ${a * b}.`, ky: `${a} × ${b} = ${a * b}.` },
  }));
}

function compareTasks(topic: string, grade: Grade, pairs: [number, number][], freeCount = 4): Task[] {
  return pairs.map(([a, b], i) => ({
    id: `g-${topic}-cmp-${a}-${b}`,
    type: "single_choice",
    subject: "math",
    topic,
    grade,
    difficulty: 1,
    free: i < freeCount,
    prompt: { ru: `Что больше: ${a} или ${b}?`, ky: `Кайсы чоң: ${a} же ${b}?` },
    options: [
      { ru: String(a), ky: String(a) },
      { ru: String(b), ky: String(b) },
    ],
    correctIndex: a > b ? 0 : 1,
    explanation: { ru: `${Math.max(a, b)} больше.`, ky: `${Math.max(a, b)} чоң.` },
  }));
}

function seqTasks(topic: string, grade: Grade, series: [number, number][], freeCount = 3): Task[] {
  return series.map(([s, d], i) => {
    const terms = [s, s + d, s + 2 * d, s + 3 * d];
    return {
      id: `g-${topic}-seq-${s}-${d}`,
      type: "number_input",
      subject: "math",
      topic,
      grade,
      difficulty: 2,
      free: i < freeCount,
      prompt: {
        ru: `Продолжи ряд: ${terms.join(", ")}, ?`,
        ky: `Катарды улант: ${terms.join(", ")}, ?`,
      },
      answer: s + 4 * d,
      explanation: {
        ru: d > 0 ? `Каждое число на ${d} больше.` : `Каждое число на ${-d} меньше.`,
        ky: d > 0 ? `Ар бир сан ${d}ге чоң.` : `Ар бир сан ${-d}ге кичине.`,
      },
    };
  });
}

interface CountItem {
  emoji: string;
  ruName: string;
  kyName: string;
  n: number;
}
function countTasks(topic: string, grade: Grade, items: CountItem[], freeCount = 4): Task[] {
  return items.map((it, i) => ({
    id: `g-${topic}-cnt-${i}`,
    type: "number_input",
    subject: "math",
    topic,
    grade,
    difficulty: 1,
    free: i < freeCount,
    illustration: it.emoji.repeat(it.n),
    prompt: { ru: `Сколько ${it.ruName}?`, ky: `Канча ${it.kyName}?` },
    answer: it.n,
    explanation: { ru: `Посчитай — их ${it.n}.`, ky: `Сана — ${it.n}.` },
  }));
}

// Дополнительные задания по логике/чтению (вручную).
const LOGIC_EXTRA: Task[] = [
  {
    id: "g-pre-odd-a", type: "single_choice", subject: "logic", topic: "pre-odd", grade: 0,
    difficulty: 1, free: true, illustration: "🐦 🐝 🚀 🦋",
    prompt: { ru: "Что здесь лишнее?", ky: "Бул жерде эмне ашык?" },
    options: [
      { ru: "Птица", ky: "Куш" }, { ru: "Пчела", ky: "Аары" },
      { ru: "Ракета", ky: "Ракета" }, { ru: "Бабочка", ky: "Көпөлөк" },
    ],
    correctIndex: 2,
    explanation: { ru: "Ракета — техника, остальные летают сами.", ky: "Ракета — техника, калгандары өзү учат." },
  },
  {
    id: "g-pre-odd-b", type: "single_choice", subject: "logic", topic: "pre-odd", grade: 0,
    difficulty: 1, free: false, illustration: "👕 👖 🧦 🍕",
    prompt: { ru: "Что здесь лишнее?", ky: "Бул жерде эмне ашык?" },
    options: [
      { ru: "Футболка", ky: "Футболка" }, { ru: "Штаны", ky: "Шым" },
      { ru: "Носки", ky: "Байпак" }, { ru: "Пицца", ky: "Пицца" },
    ],
    correctIndex: 3,
    explanation: { ru: "Пицца — еда, остальное — одежда.", ky: "Пицца — тамак, калгандары — кийим." },
  },
  {
    id: "g-pre-shapes-a", type: "single_choice", subject: "logic", topic: "pre-shapes", grade: 0,
    difficulty: 1, free: true,
    prompt: { ru: "Найди зелёный цвет", ky: "Жашыл түстү тап" },
    options: [{ ru: "🔴", ky: "🔴" }, { ru: "🟢", ky: "🟢" }, { ru: "🟡", ky: "🟡" }],
    correctIndex: 1,
    explanation: { ru: "Зелёный — это 🟢.", ky: "Жашыл — 🟢." },
  },
  {
    id: "g-pre-shapes-b", type: "single_choice", subject: "logic", topic: "pre-shapes", grade: 0,
    difficulty: 1, free: true,
    prompt: { ru: "Найди сердечко", ky: "Жүрөкчөнү тап" },
    options: [{ ru: "🔷", ky: "🔷" }, { ru: "❤️", ky: "❤️" }, { ru: "⭐", ky: "⭐" }],
    correctIndex: 1,
    explanation: { ru: "Сердечко — это ❤️.", ky: "Жүрөкчө — ❤️." },
  },
  {
    id: "g-pre-seq-a", type: "single_choice", subject: "logic", topic: "pre-seq", grade: 0,
    difficulty: 1, free: true,
    prompt: { ru: "Продолжи ряд: 🐶 🐱 🐶 🐱 …", ky: "Катарды улант: 🐶 🐱 🐶 🐱 …" },
    options: [{ ru: "🐶", ky: "🐶" }, { ru: "🐱", ky: "🐱" }],
    correctIndex: 0,
    explanation: { ru: "После кошки снова собака.", ky: "Мышыктан кийин кайра ит." },
  },
  {
    id: "g-pre-big-a", type: "single_choice", subject: "logic", topic: "pre-big", grade: 0,
    difficulty: 1, free: true, illustration: "🐘 🐭",
    prompt: { ru: "Кто больше?", ky: "Ким чоң?" },
    options: [{ ru: "🐘", ky: "🐘" }, { ru: "🐭", ky: "🐭" }],
    correctIndex: 0,
    explanation: { ru: "Слон больше мышки.", ky: "Пил чычкандан чоң." },
  },
  {
    id: "g-log-odd-a", type: "single_choice", subject: "logic", topic: "log-odd", grade: 1,
    difficulty: 1, free: true, illustration: "🌹 🌻 🌷 🥕",
    prompt: { ru: "Что здесь лишнее?", ky: "Бул жерде эмне ашык?" },
    options: [
      { ru: "Роза", ky: "Роза" }, { ru: "Подсолнух", ky: "Күн карама" },
      { ru: "Тюльпан", ky: "Кызгалдак" }, { ru: "Морковь", ky: "Сабиз" },
    ],
    correctIndex: 3,
    explanation: { ru: "Морковь — овощ, остальные — цветы.", ky: "Сабиз — жашылча, калгандары — гүлдөр." },
  },
  {
    id: "g-log-seq-a", type: "single_choice", subject: "logic", topic: "log-seq", grade: 1,
    difficulty: 2, free: true,
    prompt: { ru: "Продолжи ряд: 🔺 🔺 🔵 🔺 🔺 🔵 …", ky: "Катарды улант: 🔺 🔺 🔵 🔺 🔺 🔵 …" },
    options: [{ ru: "🔺", ky: "🔺" }, { ru: "🔵", ky: "🔵" }],
    correctIndex: 0,
    explanation: { ru: "После круга снова два треугольника.", ky: "Тегеректен кийин кайра эки үч бурчтук." },
  },
  {
    id: "g-log-think-a", type: "single_choice", subject: "logic", topic: "log-think", grade: 2,
    difficulty: 2, free: true,
    prompt: {
      ru: "Все птицы летают. Голубь — птица. Значит, голубь…",
      ky: "Бардык куштар учат. Көгүчкөн — куш. Демек, көгүчкөн…",
    },
    options: [
      { ru: "Летает", ky: "Учат" }, { ru: "Плавает", ky: "Сүзөт" }, { ru: "Роет", ky: "Казат" },
    ],
    correctIndex: 0,
    explanation: { ru: "Раз все птицы летают, то и голубь летает.", ky: "Бардык куштар учса, көгүчкөн да учат." },
  },
];

const READING_EXTRA: Task[] = [
  {
    id: "g-pre-letter-a", type: "single_choice", subject: "reading", topic: "pre-letters", grade: 0,
    difficulty: 1, free: true,
    prompt: { ru: "Найди букву К", ky: "К тамгасын тап" },
    options: [{ ru: "К", ky: "К" }, { ru: "О", ky: "О" }, { ru: "9", ky: "9" }],
    correctIndex: 0,
    explanation: { ru: "Это буква К.", ky: "Бул — К тамгасы." },
  },
  {
    id: "g-pre-letter-b", type: "single_choice", subject: "reading", topic: "pre-letters", grade: 0,
    difficulty: 1, free: true,
    prompt: { ru: "Найди букву И", ky: "И тамгасын тап" },
    options: [{ ru: "П", ky: "П" }, { ru: "И", ky: "И" }, { ru: "4", ky: "4" }],
    correctIndex: 1,
    explanation: { ru: "Это буква И.", ky: "Бул — И тамгасы." },
  },
  {
    id: "g-read-vowel-a", type: "single_choice", subject: "reading", topic: "read-vowels", grade: 1,
    difficulty: 2, free: true,
    prompt: { ru: "Найди гласную букву", ky: "Үндүү тамганы тап" },
    options: [{ ru: "Т", ky: "Т" }, { ru: "О", ky: "О" }, { ru: "С", ky: "С" }],
    correctIndex: 1,
    explanation: { ru: "О — гласная буква.", ky: "О — үндүү тамга." },
  },
  {
    id: "g-read-letters-a", type: "single_choice", subject: "reading", topic: "read-letters", grade: 1,
    difficulty: 2, free: true,
    prompt: { ru: "Какая буква идёт после «В»?", ky: "«В» тамгасынан кийин кайсы тамга келет?" },
    options: [{ ru: "Г", ky: "Г" }, { ru: "Б", ky: "Б" }, { ru: "А", ky: "А" }],
    correctIndex: 0,
    explanation: { ru: "После «В» идёт «Г».", ky: "«В»дан кийин «Г» келет." },
  },
  {
    id: "g-read-words-a", type: "number_input", subject: "reading", topic: "read-words", grade: 2,
    difficulty: 2, free: true,
    prompt: {
      ru: "Сколько слов в предложении: «Дети играют во дворе»?",
      ky: "«Балдар короодо ойношот» сүйлөмүндө канча сөз?",
    },
    answer: 3,
    explanation: { ru: "Считаем слова: их три.", ky: "Сөздөрдү санайбыз: үчөө." },
  },
];

export const generatedTasks: Task[] = [
  // ── Подготовишка ──
  ...countTasks("pre-count", 0, [
    { emoji: "🍓", ruName: "клубничек", kyName: "кулпунай", n: 3 },
    { emoji: "🐤", ruName: "цыплят", kyName: "балапан", n: 4 },
    { emoji: "🎈", ruName: "шариков", kyName: "шар", n: 5 },
    { emoji: "🍪", ruName: "печенек", kyName: "печенье", n: 2 },
    { emoji: "🌷", ruName: "цветов", kyName: "гүл", n: 1 },
  ]),
  ...compareTasks("pre-more", 0, [[3, 5], [4, 2], [1, 3], [5, 4], [2, 5]]),
  // ── 1 класс ──
  ...countTasks("math-count", 1, [
    { emoji: "⭐", ruName: "звёзд", kyName: "жылдыз", n: 6 },
    { emoji: "🍎", ruName: "яблок", kyName: "алма", n: 8 },
  ]),
  ...addTasks("math-count", 1, [[3, 3], [2, 4], [5, 1]]),
  ...addTasks("math-add", 1, [[2, 3], [4, 5], [1, 6], [3, 4], [6, 2]]),
  ...subTasks("math-add", 1, [[9, 4], [8, 3], [7, 5], [6, 2], [10, 5]]),
  ...addTasks("math-ten", 1, [[6, 3], [8, 2], [5, 5], [7, 3], [9, 1]]),
  ...subTasks("math-ten", 1, [[9, 3], [10, 4], [8, 6], [7, 2]]),
  ...compareTasks("math-compare", 1, [[8, 3], [5, 9], [6, 2], [4, 7], [10, 6]]),
  // ── 2 класс ──
  ...seqTasks("math-seq", 2, [[2, 2], [5, 5], [3, 3], [10, 10], [4, 4]]),
  ...addTasks("math-tens", 2, [[20, 10], [30, 20], [40, 30], [50, 20]]),
  ...subTasks("math-tens", 2, [[50, 20], [40, 10], [60, 30], [70, 40]]),
  ...compareTasks("math-tens", 2, [[34, 43], [55, 45], [70, 60], [28, 82]]),
  ...multTasks("math-mult", 2, [[2, 2], [2, 6], [3, 5], [5, 4], [4, 3], [3, 3]]),
  ...addTasks("math-word", 2, [[6, 4], [7, 8]], 1),
  ...subTasks("math-word", 2, [[15, 6], [20, 8]], 1),
  ...LOGIC_EXTRA,
  ...READING_EXTRA,
];
