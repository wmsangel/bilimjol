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

function divQuestions(count: number): Task[] {
  return Array.from({ length: count }, (_, i) => {
    const b = rnd(2, 9);
    const res = rnd(2, 9);
    const a = b * res;
    return q(
      {
        type: "number_input",
        subject: "math",
        topic: "test",
        grade: 0,
        difficulty: 3,
        free: true,
        prompt: { ru: `${a} ÷ ${b} = ?`, ky: `${a} ÷ ${b} = ?` },
        answer: res,
        explanation: { ru: `${a} ÷ ${b} = ${res}.`, ky: `${a} ÷ ${b} = ${res}.` },
      },
      i,
    );
  });
}

function squareQuestions(count: number): Task[] {
  return Array.from({ length: count }, (_, i) => {
    const n = rnd(2, 15);
    return q(
      {
        type: "number_input",
        subject: "math",
        topic: "test",
        grade: 0,
        difficulty: 3,
        free: true,
        prompt: { ru: `${n}² = ?`, ky: `${n}² = ?` },
        answer: n * n,
        explanation: { ru: `${n}² = ${n} × ${n} = ${n * n}.`, ky: `${n}² = ${n} × ${n} = ${n * n}.` },
      },
      i,
    );
  });
}

// Готовые вопросы «вразброс»: перемешиваем пул, берём нужное число и
// (для выбора варианта) перемешиваем сами варианты, чтобы ответ не был всегда первым.
function pickPool(pool: Record<string, unknown>[], count: number): Task[] {
  const shuffled = [...pool].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count).map((base, i) => {
    if (base.type === "single_choice" && Array.isArray(base.options)) {
      const opts = base.options as LocalizedText[];
      const correct = opts[base.correctIndex as number];
      const mixed = [...opts].sort(() => Math.random() - 0.5);
      return q({ ...base, options: mixed, correctIndex: mixed.indexOf(correct) }, i);
    }
    return q(base, i);
  });
}

const WORLD_POOL: Record<string, unknown>[] = [
  { type: "number_input", subject: "world", topic: "test", grade: 0, difficulty: 2, free: true,
    prompt: { ru: "Сколько планет в Солнечной системе?", ky: "Күн системасында канча планета бар?" },
    answer: 8, explanation: { ru: "Восемь планет.", ky: "Сегиз планета." } },
  { type: "single_choice", subject: "world", topic: "test", grade: 0, difficulty: 2, free: true,
    prompt: { ru: "Самая большая планета?", ky: "Эң чоң планета?" },
    options: [{ ru: "Юпитер", ky: "Юпитер" }, { ru: "Земля", ky: "Жер" }, { ru: "Марс", ky: "Марс" }],
    correctIndex: 0, explanation: { ru: "Юпитер.", ky: "Юпитер." } },
  { type: "single_choice", subject: "world", topic: "test", grade: 0, difficulty: 2, free: true,
    prompt: { ru: "Самый большой океан?", ky: "Эң чоң океан?" },
    options: [{ ru: "Тихий", ky: "Тынч" }, { ru: "Индийский", ky: "Инди" }, { ru: "Атлантический", ky: "Атлантика" }],
    correctIndex: 0, explanation: { ru: "Тихий океан.", ky: "Тынч океан." } },
  { type: "number_input", subject: "world", topic: "test", grade: 0, difficulty: 2, free: true,
    prompt: { ru: "Сколько материков на Земле?", ky: "Жерде канча материк бар?" },
    answer: 6, explanation: { ru: "Шесть.", ky: "Алты." } },
  { type: "single_choice", subject: "world", topic: "test", grade: 0, difficulty: 2, free: true,
    prompt: { ru: "Какой орган перекачивает кровь?", ky: "Кайсы орган канды айдайт?" },
    options: [{ ru: "Сердце", ky: "Жүрөк" }, { ru: "Лёгкие", ky: "Өпкө" }, { ru: "Печень", ky: "Боор" }],
    correctIndex: 0, explanation: { ru: "Сердце.", ky: "Жүрөк." } },
  { type: "single_choice", subject: "world", topic: "test", grade: 0, difficulty: 2, free: true,
    prompt: { ru: "Формула воды?", ky: "Суунун формуласы?" },
    options: [{ ru: "H₂O", ky: "H₂O" }, { ru: "CO₂", ky: "CO₂" }, { ru: "O₂", ky: "O₂" }],
    correctIndex: 0, explanation: { ru: "H₂O.", ky: "H₂O." } },
  { type: "number_input", subject: "world", topic: "test", grade: 0, difficulty: 2, free: true,
    prompt: { ru: "При какой температуре кипит вода (°C)?", ky: "Суу канча °C'та кайнайт?" },
    answer: 100, explanation: { ru: "100 °C.", ky: "100 °C." } },
  { type: "single_choice", subject: "world", topic: "test", grade: 0, difficulty: 2, free: true,
    prompt: { ru: "Планета, ближайшая к Солнцу?", ky: "Күнгө эң жакын планета?" },
    options: [{ ru: "Меркурий", ky: "Меркурий" }, { ru: "Венера", ky: "Венера" }, { ru: "Земля", ky: "Жер" }],
    correctIndex: 0, explanation: { ru: "Меркурий.", ky: "Меркурий." } },
  { type: "single_choice", subject: "world", topic: "test", grade: 0, difficulty: 2, free: true,
    prompt: { ru: "Самое глубокое озеро?", ky: "Эң терең көл?" },
    options: [{ ru: "Байкал", ky: "Байкал" }, { ru: "Иссык-Куль", ky: "Ысык-Көл" }, { ru: "Балхаш", ky: "Балкаш" }],
    correctIndex: 0, explanation: { ru: "Байкал.", ky: "Байкал." } },
  { type: "number_input", subject: "world", topic: "test", grade: 0, difficulty: 2, free: true,
    prompt: { ru: "Сколько костей у взрослого человека?", ky: "Чоң кишиде канча сөөк бар?" },
    answer: 206, explanation: { ru: "206.", ky: "206." } },
];

const SPEECH_POOL: Record<string, unknown>[] = [
  { type: "single_choice", subject: "reading", topic: "test", grade: 0, difficulty: 2, free: true,
    prompt: { ru: "Найди существительное", ky: "Зат атоочту тап" },
    options: [{ ru: "стол", ky: "үстөл" }, { ru: "бежит", ky: "чуркайт" }, { ru: "быстро", ky: "тез" }],
    correctIndex: 0, explanation: { ru: "«Стол» — предмет.", ky: "«Үстөл» — зат." } },
  { type: "single_choice", subject: "reading", topic: "test", grade: 0, difficulty: 2, free: true,
    prompt: { ru: "Найди глагол", ky: "Этишти тап" },
    options: [{ ru: "читать", ky: "окуу" }, { ru: "книга", ky: "китеп" }, { ru: "красивый", ky: "кооз" }],
    correctIndex: 0, explanation: { ru: "«Читать» — действие.", ky: "«Окуу» — иш-аракет." } },
  { type: "single_choice", subject: "reading", topic: "test", grade: 0, difficulty: 2, free: true,
    prompt: { ru: "Найди прилагательное", ky: "Сын атоочту тап" },
    options: [{ ru: "зелёный", ky: "жашыл" }, { ru: "дом", ky: "үй" }, { ru: "прыгать", ky: "секирүү" }],
    correctIndex: 0, explanation: { ru: "«Зелёный» — признак.", ky: "«Жашыл» — белги." } },
  { type: "single_choice", subject: "reading", topic: "test", grade: 0, difficulty: 2, free: true,
    prompt: { ru: "Найди местоимение", ky: "Ат атоочту тап" },
    options: [{ ru: "он", ky: "ал" }, { ru: "дом", ky: "үй" }, { ru: "красивый", ky: "кооз" }],
    correctIndex: 0, explanation: { ru: "«Он» — местоимение.", ky: "«Ал» — ат атооч." } },
  { type: "single_choice", subject: "reading", topic: "test", grade: 0, difficulty: 2, free: true,
    prompt: { ru: "Синоним к «храбрый»?", ky: "«Эр жүрөк» синоними?" },
    options: [{ ru: "смелый", ky: "кайраттуу" }, { ru: "слабый", ky: "алсыз" }, { ru: "добрый", ky: "боорукер" }],
    correctIndex: 0, explanation: { ru: "«Смелый».", ky: "«Кайраттуу»." } },
  { type: "single_choice", subject: "reading", topic: "test", grade: 0, difficulty: 2, free: true,
    prompt: { ru: "Антоним к «холодный»?", ky: "«Суук» антоними?" },
    options: [{ ru: "горячий", ky: "ысык" }, { ru: "мокрый", ky: "нымдуу" }, { ru: "светлый", ky: "жарык" }],
    correctIndex: 0, explanation: { ru: "«Горячий».", ky: "«Ысык»." } },
  { type: "single_choice", subject: "reading", topic: "test", grade: 0, difficulty: 2, free: true,
    prompt: { ru: "Найди подлежащее: «Дети играют»", ky: "Ээни тап: «Балдар ойношот»" },
    options: [{ ru: "дети", ky: "балдар" }, { ru: "играют", ky: "ойношот" }],
    correctIndex: 0, explanation: { ru: "«Дети» — подлежащее.", ky: "«Балдар» — ээ." } },
  { type: "single_choice", subject: "reading", topic: "test", grade: 0, difficulty: 2, free: true,
    prompt: { ru: "Синоним к «большой»?", ky: "«Чоң» синоними?" },
    options: [{ ru: "огромный", ky: "эбегейсиз" }, { ru: "маленький", ky: "кичине" }, { ru: "узкий", ky: "тар" }],
    correctIndex: 0, explanation: { ru: "«Огромный».", ky: "«Эбегейсиз»." } },
];

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
    id: "division",
    icon: "➗",
    count: 10,
    title: { ru: "Деление", ky: "Бөлүү" },
    description: { ru: "10 примеров на деление", ky: "Бөлүүгө 10 мисал" },
    generate: () => divQuestions(10),
  },
  {
    id: "squares",
    icon: "🔼",
    count: 10,
    title: { ru: "Квадраты чисел", ky: "Сандардын квадраттары" },
    description: { ru: "n² вразброс до 15", ky: "15ке чейин n² аралаш" },
    generate: () => squareQuestions(10),
  },
  {
    id: "compare",
    icon: "⚖️",
    count: 10,
    title: { ru: "Что больше?", ky: "Кайсы чоң?" },
    description: { ru: "Сравни числа до 100", ky: "100гө чейинки сандарды салыштыр" },
    generate: () => compareQuestions(10),
  },
  {
    id: "world-quiz",
    icon: "🌍",
    count: 8,
    title: { ru: "Мир вокруг", ky: "Айлана дүйнө" },
    description: { ru: "Викторина: природа, космос, тело", ky: "Викторина: жаратылыш, космос, дене" },
    generate: () => pickPool(WORLD_POOL, 8),
  },
  {
    id: "speech",
    icon: "📖",
    count: 8,
    title: { ru: "Части речи", ky: "Сөз түркүмдөрү" },
    description: { ru: "Существительные, глаголы, синонимы", ky: "Зат атооч, этиш, синонимдер" },
    generate: () => pickPool(SPEECH_POOL, 8),
  },
];

export function getTest(id: string): TestDef | undefined {
  return tests.find((t) => t.id === id);
}
