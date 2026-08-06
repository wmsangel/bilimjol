import type { LocalizedText, Task } from "./types";

// Общие тесты-тренажёры (не привязаны к классу). Вопросы генерируются
// случайно при каждом прохождении («вразброс»).

export interface TestDef {
  id: string;
  icon: string;
  title: LocalizedText;
  description: LocalizedText;
  count: number;
  /** Генерирует набор случайных вопросов. */
  generate: () => Task[];
}

function rnd(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function q(base: Record<string, unknown>, i: number): Task {
  return { ...base, id: `tq-${i}` } as unknown as Task;
}

function multQuestions(count: number): Task[] {
  return Array.from({ length: count }, (_, i) => {
    const a = rnd(2, 9);
    const b = rnd(2, 9);
    return q(
      {
        type: "number_input",
        subject: "math",
        topic: "test",
        grade: 0,
        difficulty: 3,
        free: true,
        prompt: { ru: `${a} × ${b} = ?`, ky: `${a} × ${b} = ?` },
        answer: a * b,
        explanation: { ru: `${a} × ${b} = ${a * b}.`, ky: `${a} × ${b} = ${a * b}.` },
      },
      i,
    );
  });
}

function addQuestions(count: number): Task[] {
  return Array.from({ length: count }, (_, i) => {
    const a = rnd(2, 12);
    const b = rnd(2, 12);
    return q(
      {
        type: "number_input",
        subject: "math",
        topic: "test",
        grade: 0,
        difficulty: 2,
        free: true,
        prompt: { ru: `${a} + ${b} = ?`, ky: `${a} + ${b} = ?` },
        answer: a + b,
        explanation: { ru: `${a} + ${b} = ${a + b}.`, ky: `${a} + ${b} = ${a + b}.` },
      },
      i,
    );
  });
}

function subQuestions(count: number): Task[] {
  return Array.from({ length: count }, (_, i) => {
    const a = rnd(5, 20);
    const b = rnd(1, a);
    return q(
      {
        type: "number_input",
        subject: "math",
        topic: "test",
        grade: 0,
        difficulty: 2,
        free: true,
        prompt: { ru: `${a} − ${b} = ?`, ky: `${a} − ${b} = ?` },
        answer: a - b,
        explanation: { ru: `${a} − ${b} = ${a - b}.`, ky: `${a} − ${b} = ${a - b}.` },
      },
      i,
    );
  });
}

function mixedQuestions(count: number): Task[] {
  const gens = [
    () => multQuestions(1)[0],
    () => addQuestions(1)[0],
    () => subQuestions(1)[0],
  ];
  return Array.from({ length: count }, (_, i) =>
    q({ ...gens[rnd(0, 2)]() }, i),
  );
}

function compareQuestions(count: number): Task[] {
  return Array.from({ length: count }, (_, i) => {
    let a = rnd(1, 99);
    let b = rnd(1, 99);
    if (a === b) b += 1;
    return q(
      {
        type: "single_choice",
        subject: "math",
        topic: "test",
        grade: 0,
        difficulty: 1,
        free: true,
        prompt: { ru: `Что больше: ${a} или ${b}?`, ky: `Кайсы чоң: ${a} же ${b}?` },
        options: [
          { ru: String(a), ky: String(a) },
          { ru: String(b), ky: String(b) },
        ],
        correctIndex: a > b ? 0 : 1,
        explanation: { ru: `${Math.max(a, b)} больше.`, ky: `${Math.max(a, b)} чоң.` },
      },
      i,
    );
  });
}

export const tests: TestDef[] = [
  {
    id: "mult-table",
    icon: "✖️",
    count: 10,
    title: { ru: "Таблица умножения", ky: "Көбөйтүү таблицасы" },
    description: { ru: "10 примеров вразброс", ky: "10 мисал аралаш" },
    generate: () => multQuestions(10),
  },
  {
    id: "add",
    icon: "➕",
    count: 10,
    title: { ru: "Сложение", ky: "Кошуу" },
    description: { ru: "10 примеров на сложение", ky: "Кошууга 10 мисал" },
    generate: () => addQuestions(10),
  },
  {
    id: "sub",
    icon: "➖",
    count: 10,
    title: { ru: "Вычитание", ky: "Кемитүү" },
    description: { ru: "10 примеров на вычитание", ky: "Кемитүүгө 10 мисал" },
    generate: () => subQuestions(10),
  },
  {
    id: "mixed",
    icon: "🎲",
    count: 10,
    title: { ru: "Всё вперемешку", ky: "Баары аралаш" },
    description: { ru: "+, −, × в случайном порядке", ky: "+, −, × туш келди" },
    generate: () => mixedQuestions(10),
  },
  {
    id: "compare",
    icon: "⚖️",
    count: 10,
    title: { ru: "Что больше?", ky: "Кайсы чоң?" },
    description: { ru: "Сравни числа до 100", ky: "100гө чейинки сандарды салыштыр" },
    generate: () => compareQuestions(10),
  },
];

export function getTest(id: string): TestDef | undefined {
  return tests.find((t) => t.id === id);
}
