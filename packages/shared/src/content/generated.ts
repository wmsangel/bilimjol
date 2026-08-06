import type { Grade, Task } from "./types";
import { higherTasks } from "./higher";

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

function divTasks(topic: string, grade: Grade, pairs: [number, number][], freeCount = 4): Task[] {
  return pairs.map(([a, b], i) => ({
    id: `g-${topic}-div-${a}-${b}`,
    type: "number_input", subject: "math", topic, grade, difficulty: 2, free: i < freeCount,
    prompt: { ru: `${a} ÷ ${b} = ?`, ky: `${a} ÷ ${b} = ?` },
    answer: a / b,
    explanation: { ru: `${a} ÷ ${b} = ${a / b}.`, ky: `${a} ÷ ${b} = ${a / b}.` },
  }));
}

function sqTasks(topic: string, grade: Grade, nums: number[], freeCount = 3): Task[] {
  return nums.map((n, i) => ({
    id: `g-${topic}-sq-${n}`,
    type: "number_input", subject: "math", topic, grade, difficulty: 3, free: i < freeCount,
    prompt: { ru: `${n}² = ?`, ky: `${n}² = ?` },
    answer: n * n,
    explanation: { ru: `${n}² = ${n} × ${n} = ${n * n}.`, ky: `${n}² = ${n} × ${n} = ${n * n}.` },
  }));
}

function sqrtTasks(topic: string, grade: Grade, nums: number[], freeCount = 3): Task[] {
  return nums.map((n, i) => ({
    id: `g-${topic}-sqrt-${n}`,
    type: "number_input", subject: "math", topic, grade, difficulty: 3, free: i < freeCount,
    prompt: { ru: `√${n * n} = ?`, ky: `√${n * n} = ?` },
    answer: n,
    explanation: { ru: `√${n * n} = ${n}, потому что ${n} × ${n} = ${n * n}.`, ky: `√${n * n} = ${n}, себеби ${n} × ${n} = ${n * n}.` },
  }));
}

function eqAddTasks(topic: string, grade: Grade, pairs: [number, number][], freeCount = 4): Task[] {
  // pairs: [a, x] → уравнение x + a = a+x
  return pairs.map(([a, x], i) => ({
    id: `g-${topic}-eqa-${a}-${x}`,
    type: "number_input", subject: "math", topic, grade, difficulty: 3, free: i < freeCount,
    prompt: { ru: `Реши: x + ${a} = ${a + x}`, ky: `Чеч: x + ${a} = ${a + x}` },
    answer: x,
    explanation: { ru: `x = ${a + x} − ${a} = ${x}.`, ky: `x = ${a + x} − ${a} = ${x}.` },
  }));
}

function eqMulTasks(topic: string, grade: Grade, pairs: [number, number][], freeCount = 3): Task[] {
  // pairs: [a, x] → a · x = a*x
  return pairs.map(([a, x], i) => ({
    id: `g-${topic}-eqm-${a}-${x}`,
    type: "number_input", subject: "math", topic, grade, difficulty: 3, free: i < freeCount,
    prompt: { ru: `Реши: ${a} · x = ${a * x}`, ky: `Чеч: ${a} · x = ${a * x}` },
    answer: x,
    explanation: { ru: `x = ${a * x} ÷ ${a} = ${x}.`, ky: `x = ${a * x} ÷ ${a} = ${x}.` },
  }));
}

function percentTasks(topic: string, grade: Grade, pairs: [number, number][], freeCount = 3): Task[] {
  // pairs: [p, n] → p% от n
  return pairs.map(([p, n], i) => ({
    id: `g-${topic}-pct-${p}-${n}`,
    type: "number_input", subject: "math", topic, grade, difficulty: 3, free: i < freeCount,
    prompt: { ru: `Сколько будет ${p}% от ${n}?`, ky: `${n} санынын ${p}% канча?` },
    answer: (p * n) / 100,
    explanation: { ru: `${p}% от ${n} = ${(p * n) / 100}.`, ky: `${n}дын ${p}% = ${(p * n) / 100}.` },
  }));
}

function fracTasks(topic: string, grade: Grade, pairs: [number, number][], freeCount = 3): Task[] {
  // pairs: [den, of] → 1/den от of
  return pairs.map(([den, of], i) => ({
    id: `g-${topic}-frac-${den}-${of}`,
    type: "number_input", subject: "math", topic, grade, difficulty: 3, free: i < freeCount,
    prompt: { ru: `Сколько будет 1/${den} от ${of}?`, ky: `${of} санынын 1/${den} канча?` },
    answer: of / den,
    explanation: { ru: `${of} ÷ ${den} = ${of / den}.`, ky: `${of} ÷ ${den} = ${of / den}.` },
  }));
}

function orderTasks(topic: string, grade: Grade, triples: [number, number, number][], freeCount = 3): Task[] {
  return triples.map(([a, b, c], i) => ({
    id: `g-${topic}-ord-${a}-${b}-${c}`,
    type: "number_input", subject: "math", topic, grade, difficulty: 3, free: i < freeCount,
    prompt: { ru: `Сколько будет ${a} + ${b} × ${c}?`, ky: `${a} + ${b} × ${c} канчага барабар?` },
    answer: a + b * c,
    explanation: {
      ru: `Сначала умножение: ${b} × ${c} = ${b * c}, затем ${a} + ${b * c} = ${a + b * c}.`,
      ky: `Адегенде көбөйтүү: ${b} × ${c} = ${b * c}, анан ${a} + ${b * c} = ${a + b * c}.`,
    },
  }));
}

function negTasks(topic: string, grade: Grade, pairs: [number, number][], freeCount = 4): Task[] {
  // pairs: [a, b] → −a + b
  return pairs.map(([a, b], i) => ({
    id: `g-${topic}-neg-${a}-${b}`,
    type: "number_input", subject: "math", topic, grade, difficulty: 3, free: i < freeCount,
    prompt: { ru: `−${a} + ${b} = ?`, ky: `−${a} + ${b} = ?` },
    answer: -a + b,
    explanation: { ru: `−${a} + ${b} = ${-a + b}.`, ky: `−${a} + ${b} = ${-a + b}.` },
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

// Логика/чтение для 3–4 классов (вручную).
const GRADE_HIGH_HL: Task[] = [
  {
    id: "g-log3-a", type: "single_choice", subject: "logic", topic: "log3", grade: 3,
    difficulty: 2, free: true,
    prompt: {
      ru: "У Маши больше яблок, чем у Пети. У Пети больше, чем у Кати. У кого меньше всех?",
      ky: "Машада Петядан көп алма бар. Петяда Катядан көп. Кимде эң аз?",
    },
    options: [{ ru: "У Маши", ky: "Машада" }, { ru: "У Пети", ky: "Петяда" }, { ru: "У Кати", ky: "Катяда" }],
    correctIndex: 2,
    explanation: { ru: "Катя меньше Пети, а Петя меньше Маши — значит у Кати меньше всех.", ky: "Катя Петядан аз, Петя Машадан аз — демек Катяда эң аз." },
  },
  {
    id: "g-log3-b", type: "number_input", subject: "logic", topic: "log3", grade: 3,
    difficulty: 2, free: true,
    prompt: { ru: "Продолжи ряд: 2, 4, 8, 16, ?", ky: "Катарды улант: 2, 4, 8, 16, ?" },
    answer: 32,
    explanation: { ru: "Каждое число в 2 раза больше: 16 × 2 = 32.", ky: "Ар бир сан 2 эсе чоң: 16 × 2 = 32." },
  },
  {
    id: "g-log3-c", type: "single_choice", subject: "logic", topic: "log3", grade: 3,
    difficulty: 2, free: false,
    prompt: { ru: "Какое число лишнее: 11, 13, 15, 16?", ky: "Кайсы сан ашык: 11, 13, 15, 16?" },
    options: [{ ru: "11", ky: "11" }, { ru: "13", ky: "13" }, { ru: "15", ky: "15" }, { ru: "16", ky: "16" }],
    correctIndex: 3,
    explanation: { ru: "16 — чётное, остальные нечётные.", ky: "16 — жуп, калгандары так." },
  },
  {
    id: "g-log4-a", type: "number_input", subject: "logic", topic: "log4", grade: 4,
    difficulty: 3, free: true,
    prompt: { ru: "Продолжи ряд: 1, 4, 9, 16, ?", ky: "Катарды улант: 1, 4, 9, 16, ?" },
    answer: 25,
    explanation: { ru: "Это квадраты: 1, 4, 9, 16, 25 (5×5).", ky: "Бул квадраттар: 1, 4, 9, 16, 25 (5×5)." },
  },
  {
    id: "g-log4-b", type: "single_choice", subject: "logic", topic: "log4", grade: 4,
    difficulty: 3, free: true,
    prompt: { ru: "Какое число лишнее: 12, 15, 20, 18?", ky: "Кайсы сан ашык: 12, 15, 20, 18?" },
    options: [{ ru: "12", ky: "12" }, { ru: "15", ky: "15" }, { ru: "20", ky: "20" }, { ru: "18", ky: "18" }],
    correctIndex: 2,
    explanation: { ru: "20 не делится на 3, а остальные делятся.", ky: "20 3кө бөлүнбөйт, калгандары бөлүнөт." },
  },
  {
    id: "g-read3-a", type: "number_input", subject: "reading", topic: "read3", grade: 3,
    difficulty: 2, free: true,
    prompt: { ru: "Сколько предложений: «Кот спит. Пёс бежит.»?", ky: "Канча сүйлөм: «Мышык уктайт. Ит чуркайт.»?" },
    answer: 2,
    explanation: { ru: "Два предложения — каждое кончается точкой.", ky: "Эки сүйлөм — ар бири чекит менен бүтөт." },
  },
  {
    id: "g-read3-b", type: "single_choice", subject: "reading", topic: "read3", grade: 3,
    difficulty: 2, free: true,
    prompt: { ru: "Найди слово-предмет (кто? что?)", ky: "Затты билдирген сөздү тап (ким? эмне?)" },
    options: [{ ru: "бежит", ky: "чуркайт" }, { ru: "кот", ky: "мышык" }, { ru: "красный", ky: "кызыл" }],
    correctIndex: 1,
    explanation: { ru: "«кот» отвечает на вопрос «кто?» — это предмет.", ky: "«мышык» «ким?» деген суроого жооп берет — бул зат." },
  },
  {
    id: "g-read4-a", type: "single_choice", subject: "reading", topic: "read4", grade: 4,
    difficulty: 3, free: true,
    prompt: { ru: "Найди слово-действие (что делает?)", ky: "Иш-аракетти билдирген сөздү тап" },
    options: [{ ru: "небо", ky: "асман" }, { ru: "летит", ky: "учат" }, { ru: "синий", ky: "көк" }],
    correctIndex: 1,
    explanation: { ru: "«летит» отвечает на вопрос «что делает?».", ky: "«учат» «эмне кылат?» деген суроого жооп берет." },
  },
  {
    id: "g-read4-b", type: "number_input", subject: "reading", topic: "read4", grade: 4,
    difficulty: 3, free: false,
    prompt: { ru: "Сколько гласных в слове «школа»?", ky: "«мектеп» сөзүндө канча үндүү бар?" },
    answer: 2,
    explanation: { ru: "Гласные о, а — их две.", ky: "Үндүүлөр е, е — экөө." },
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
  // ── 3 класс ──
  ...multTasks("m3-mult", 3, [[6, 7], [8, 9], [7, 7], [6, 8], [9, 4], [7, 8]]),
  ...divTasks("m3-div", 3, [[24, 6], [36, 4], [45, 5], [42, 7], [56, 8], [63, 9]]),
  ...addTasks("m3-big", 3, [[120, 30], [240, 50], [315, 25], [408, 90]]),
  ...subTasks("m3-big", 3, [[300, 120], [450, 180], [520, 60]]),
  // ── 4 класс ──
  ...multTasks("m4-mult", 4, [[12, 3], [11, 4], [13, 5], [14, 6], [15, 4]]),
  ...divTasks("m4-mult", 4, [[48, 4], [60, 5], [72, 6], [96, 8]]),
  ...orderTasks("m4-order", 4, [[2, 3, 4], [5, 2, 6], [10, 3, 3], [1, 7, 2], [8, 4, 2]]),
  ...fracTasks("m4-frac", 4, [[2, 10], [4, 20], [5, 25], [3, 18], [2, 14]]),
  // ── 5 класс ──
  ...percentTasks("m5-percent", 5, [[10, 50], [20, 150], [25, 80], [50, 60], [30, 200]]),
  ...fracTasks("m5-frac", 5, [[4, 24], [6, 36], [8, 40], [10, 90]]),
  ...addTasks("m5-big", 5, [[1200, 300], [2500, 1500], [3400, 600]]),
  ...subTasks("m5-big", 5, [[5000, 1200], [3200, 800]]),
  // ── 6 класс ──
  ...negTasks("m6-neg", 6, [[5, 8], [3, 10], [7, 2], [4, 9], [6, 6]]),
  ...eqAddTasks("m6-eq", 6, [[5, 7], [8, 4], [3, 9], [12, 6]]),
  ...eqMulTasks("m6-eq", 6, [[3, 4], [5, 6], [2, 9]]),
  ...percentTasks("m6-percent", 6, [[15, 200], [40, 90], [5, 300]]),
  // ── 7 класс ──
  ...sqTasks("m7-pow", 7, [3, 4, 5, 6, 7, 8]),
  ...eqAddTasks("m7-eq", 7, [[12, 5], [7, 8], [15, 9]]),
  ...eqMulTasks("m7-eq", 7, [[4, 7], [6, 5], [8, 4]]),
  // ── 8 класс ──
  ...sqrtTasks("m8-sqrt", 8, [4, 5, 6, 7, 8, 9]),
  ...sqTasks("m8-pow", 8, [8, 9, 10, 11, 12]),
  ...eqMulTasks("m8-eq", 8, [[7, 8], [9, 6], [8, 7]]),
  // ── 9 класс ──
  ...seqTasks("m9-prog", 9, [[3, 7], [5, 4], [2, 9], [10, 6]]),
  ...sqTasks("m9-pow", 9, [11, 12, 13, 14]),
  ...sqrtTasks("m9-root", 9, [10, 11, 12, 13]),
  ...eqAddTasks("m9-eq", 9, [[25, 17], [40, 23]]),
  // ── 10 класс ──
  ...percentTasks("m10-calc", 10, [[15, 240], [12, 350], [8, 125], [35, 400]]),
  ...sqrtTasks("m10-calc", 10, [13, 14, 15, 20]),
  ...sqTasks("m10-pow", 10, [13, 15, 20, 25]),
  // ── 11 класс ──
  ...sqTasks("m11-calc", 11, [15, 16, 20, 25, 30]),
  ...percentTasks("m11-calc", 11, [[18, 150], [22, 500], [45, 80]]),
  ...seqTasks("m11-calc", 11, [[100, 25], [7, 13]]),
  ...LOGIC_EXTRA,
  ...READING_EXTRA,
  ...GRADE_HIGH_HL,
  ...higherTasks,
];
