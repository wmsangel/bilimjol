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

// ── Дополнительные генераторы (для догрузки тем до 10 заданий) ──

function powTasks(topic: string, grade: Grade, list: [number, number][], freeCount = 3): Task[] {
  return list.map(([b, e], i) => {
    const val = b ** e;
    return {
      id: `g-${topic}-pow-${b}-${e}`,
      type: "number_input", subject: "math", topic, grade, difficulty: 3, free: i < freeCount,
      prompt: { ru: `${b} в степени ${e} = ?`, ky: `${b}нын ${e}-даражасы = ?` },
      answer: val,
      explanation: { ru: `${b}^${e} = ${val}.`, ky: `${b}^${e} = ${val}.` },
    };
  });
}

function areaRectTasks(topic: string, grade: Grade, pairs: [number, number][], freeCount = 3): Task[] {
  return pairs.map(([a, b], i) => ({
    id: `g-${topic}-area-${a}-${b}`,
    type: "number_input", subject: "math", topic, grade, difficulty: 3, free: i < freeCount,
    prompt: { ru: `Площадь прямоугольника со сторонами ${a} и ${b}?`, ky: `Тараптары ${a} жана ${b} болгон тик бурчтуктун аянты?` },
    answer: a * b,
    explanation: { ru: `${a} × ${b} = ${a * b}.`, ky: `${a} × ${b} = ${a * b}.` },
  }));
}

function perimRectTasks(topic: string, grade: Grade, pairs: [number, number][], freeCount = 3): Task[] {
  return pairs.map(([a, b], i) => ({
    id: `g-${topic}-perim-${a}-${b}`,
    type: "number_input", subject: "math", topic, grade, difficulty: 3, free: i < freeCount,
    prompt: { ru: `Периметр прямоугольника со сторонами ${a} и ${b}?`, ky: `Тараптары ${a} жана ${b} болгон тик бурчтуктун периметри?` },
    answer: 2 * (a + b),
    explanation: { ru: `2 × (${a} + ${b}) = ${2 * (a + b)}.`, ky: `2 × (${a} + ${b}) = ${2 * (a + b)}.` },
  }));
}

function pythagTasks(topic: string, grade: Grade, legs: [number, number][], freeCount = 3): Task[] {
  // Передавать только пифагоровы тройки — гипотенуза целая.
  return legs.map(([a, b], i) => {
    const h = Math.round(Math.sqrt(a * a + b * b));
    return {
      id: `g-${topic}-pyth-${a}-${b}`,
      type: "number_input", subject: "math", topic, grade, difficulty: 3, free: i < freeCount,
      prompt: { ru: `Гипотенуза прямоугольного треугольника с катетами ${a} и ${b}?`, ky: `Катеттери ${a} жана ${b} болгон тик бурчтуу үч бурчтуктун гипотенузасы?` },
      answer: h,
      explanation: { ru: `√(${a}² + ${b}²) = √${a * a + b * b} = ${h}.`, ky: `√(${a}² + ${b}²) = √${a * a + b * b} = ${h}.` },
    };
  });
}

function cubeTasks(topic: string, grade: Grade, nums: number[], freeCount = 3): Task[] {
  return nums.map((n, i) => ({
    id: `g-${topic}-cube-${n}`,
    type: "number_input", subject: "math", topic, grade, difficulty: 3, free: i < freeCount,
    prompt: { ru: `Объём куба с ребром ${n}?`, ky: `Кыры ${n} болгон кубдун көлөмү?` },
    answer: n ** 3,
    explanation: { ru: `${n}³ = ${n ** 3}.`, ky: `${n}³ = ${n ** 3}.` },
  }));
}

function quadTasks(topic: string, grade: Grade, roots: [number, number][], freeCount = 3): Task[] {
  // roots: [p, q] → x² − (p+q)x + pq = 0, спрашиваем больший корень.
  return roots.map(([p, q], i) => {
    const b = p + q, c = p * q, big = Math.max(p, q);
    return {
      id: `g-${topic}-quad-${p}-${q}`,
      type: "number_input", subject: "math", topic, grade, difficulty: 3, free: i < freeCount,
      prompt: { ru: `x² − ${b}x + ${c} = 0. Больший корень?`, ky: `x² − ${b}x + ${c} = 0. Чоң тамыры?` },
      answer: big,
      explanation: { ru: `Корни ${p} и ${q}. Больший — ${big}.`, ky: `Тамырлар ${p} жана ${q}. Чоңу — ${big}.` },
    };
  });
}

function logSeqTasks(topic: string, grade: Grade, series: [number, number][], freeCount = 3): Task[] {
  // Арифметический ряд, но subject: logic.
  return series.map(([s, d], i) => {
    const t = [s, s + d, s + 2 * d, s + 3 * d];
    return {
      id: `g-${topic}-lseq-${s}-${d}`,
      type: "number_input", subject: "logic", topic, grade, difficulty: 2, free: i < freeCount,
      prompt: { ru: `Продолжи ряд: ${t.join(", ")}, ?`, ky: `Катарды улант: ${t.join(", ")}, ?` },
      answer: s + 4 * d,
      explanation: { ru: `Каждое число на ${d} больше.`, ky: `Ар бир сан ${d}ге чоң.` },
    };
  });
}

function geoSeqTasks(topic: string, grade: Grade, list: [number, number][], freeCount = 3): Task[] {
  // Геометрический ряд, subject: logic.
  return list.map(([s, r], i) => {
    const t = [s, s * r, s * r * r, s * r * r * r];
    const next = s * r * r * r * r;
    return {
      id: `g-${topic}-gseq-${s}-${r}`,
      type: "number_input", subject: "logic", topic, grade, difficulty: 3, free: i < freeCount,
      prompt: { ru: `Продолжи ряд: ${t.join(", ")}, ?`, ky: `Катарды улант: ${t.join(", ")}, ?` },
      answer: next,
      explanation: { ru: `Каждое число в ${r} раза больше: ${t[3]} × ${r} = ${next}.`, ky: `Ар бир сан ${r} эсе чоң: ${t[3]} × ${r} = ${next}.` },
    };
  });
}

function vowelTasks(topic: string, grade: Grade, letters: [string, boolean][], freeCount = 3): Task[] {
  return letters.map(([L, isV], i) => ({
    id: `g-${topic}-vw-${L}`,
    type: "single_choice", subject: "reading", topic, grade, difficulty: 2, free: i < freeCount,
    prompt: { ru: `Буква «${L}» — какая?`, ky: `«${L}» тамгасы кандай?` },
    options: [{ ru: "гласная", ky: "үндүү" }, { ru: "согласная", ky: "үнсүз" }],
    correctIndex: isV ? 0 : 1,
    explanation: isV
      ? { ru: `«${L}» — гласная буква.`, ky: `«${L}» — үндүү тамга.` }
      : { ru: `«${L}» — согласная буква.`, ky: `«${L}» — үнсүз тамга.` },
  }));
}

// Двуязычный словарик для заданий «найди часть речи».
interface Word { ru: string; ky: string }
const NOUNS: Word[] = [
  { ru: "стол", ky: "үстөл" }, { ru: "дом", ky: "үй" }, { ru: "книга", ky: "китеп" },
  { ru: "окно", ky: "терезе" }, { ru: "машина", ky: "машине" }, { ru: "дерево", ky: "дарак" },
  { ru: "город", ky: "шаар" }, { ru: "река", ky: "дарыя" }, { ru: "гора", ky: "тоо" },
  { ru: "цветок", ky: "гүл" },
];
const VERBS: Word[] = [
  { ru: "бежать", ky: "чуркоо" }, { ru: "читать", ky: "окуу" }, { ru: "писать", ky: "жазуу" },
  { ru: "спать", ky: "уктоо" }, { ru: "прыгать", ky: "секирүү" }, { ru: "петь", ky: "ырдоо" },
  { ru: "плыть", ky: "сүзүү" }, { ru: "летать", ky: "учуу" },
];
const ADJ: Word[] = [
  { ru: "красивый", ky: "кооз" }, { ru: "большой", ky: "чоң" }, { ru: "зелёный", ky: "жашыл" },
  { ru: "быстрый", ky: "тез" }, { ru: "холодный", ky: "суук" }, { ru: "высокий", ky: "бийик" },
  { ru: "новый", ky: "жаңы" }, { ru: "сильный", ky: "күчтүү" },
];
const POS_META = {
  noun: { bank: NOUNS, prompt: { ru: "Найди существительное", ky: "Зат атоочту тап" }, ru: "существительное", ky: "зат атооч" },
  verb: { bank: VERBS, prompt: { ru: "Найди глагол", ky: "Этишти тап" }, ru: "глагол", ky: "этиш" },
  adj: { bank: ADJ, prompt: { ru: "Найди прилагательное", ky: "Сын атоочту тап" }, ru: "прилагательное", ky: "сын атооч" },
} as const;
type PosKind = keyof typeof POS_META;

function posTasks(topic: string, grade: Grade, kinds: PosKind[], freeCount = 3): Task[] {
  const all: PosKind[] = ["noun", "verb", "adj"];
  return kinds.map((kind, i) => {
    const others = all.filter((k) => k !== kind);
    const correct = POS_META[kind].bank[i % POS_META[kind].bank.length];
    const d1 = POS_META[others[0]].bank[i % POS_META[others[0]].bank.length];
    const d2 = POS_META[others[1]].bank[(i + 1) % POS_META[others[1]].bank.length];
    const pos = i % 3;
    const opts: Word[] = [d1, d2];
    opts.splice(pos, 0, correct);
    return {
      id: `g-${topic}-pos-${kind}-${i}`,
      type: "single_choice", subject: "reading", topic, grade, difficulty: 2, free: i < freeCount,
      prompt: POS_META[kind].prompt,
      options: opts.map((w) => ({ ru: w.ru, ky: w.ky })),
      correctIndex: pos,
      explanation: { ru: `«${correct.ru}» — это ${POS_META[kind].ru}.`, ky: `«${correct.ky}» — ${POS_META[kind].ky}.` },
    };
  });
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

// Догрузка тонких тем (подготовишка, 1, 3–4 классы) — второй проход.
const THIN_TOPUP: Task[] = [
  // Подготовишка — «Что дальше?»
  {
    id: "g-pre-seq-d", type: "number_input", subject: "logic", topic: "pre-seq", grade: 0,
    difficulty: 1, free: true,
    prompt: { ru: "Что дальше: 1, 2, 3, ?", ky: "Андан ары эмне: 1, 2, 3, ?" },
    answer: 4,
    explanation: { ru: "Считаем по порядку: 4.", ky: "Ирети менен санайбыз: 4." },
  },
  {
    id: "g-pre-seq-e", type: "number_input", subject: "logic", topic: "pre-seq", grade: 0,
    difficulty: 1, free: false,
    prompt: { ru: "Что дальше: 2, 4, 6, ?", ky: "Андан ары эмне: 2, 4, 6, ?" },
    answer: 8,
    explanation: { ru: "Прибавляем по 2: 8.", ky: "2ден кошобуз: 8." },
  },
  // Подготовишка — «Большой и маленький»
  {
    id: "g-pre-big-d", type: "single_choice", subject: "logic", topic: "pre-big", grade: 0,
    difficulty: 1, free: true,
    prompt: { ru: "Кто больше?", ky: "Кимиси чоң?" },
    options: [{ ru: "слон", ky: "пил" }, { ru: "муравей", ky: "кумурска" }],
    correctIndex: 0,
    explanation: { ru: "Слон большой, муравей маленький.", ky: "Пил чоң, кумурска кичине." },
  },
  {
    id: "g-pre-big-e", type: "single_choice", subject: "logic", topic: "pre-big", grade: 0,
    difficulty: 1, free: false,
    prompt: { ru: "Что меньше?", ky: "Кайсынысы кичине?" },
    options: [{ ru: "камень", ky: "таш" }, { ru: "гора", ky: "тоо" }],
    correctIndex: 0,
    explanation: { ru: "Камень меньше горы.", ky: "Таш тоодон кичине." },
  },
  // 1 класс — буквы и звуки
  {
    id: "g-read-letters-d", type: "single_choice", subject: "reading", topic: "read-letters", grade: 1,
    difficulty: 1, free: true,
    prompt: { ru: "Какая буква первая в алфавите?", ky: "Алфавиттеги биринчи тамга кайсы?" },
    options: [{ ru: "А", ky: "А" }, { ru: "Б", ky: "Б" }, { ru: "Я", ky: "Я" }],
    correctIndex: 0,
    explanation: { ru: "Алфавит начинается с буквы А.", ky: "Алфавит А тамгасынан башталат." },
  },
  {
    id: "g-read-letters-e", type: "single_choice", subject: "reading", topic: "read-letters", grade: 1,
    difficulty: 1, free: false,
    prompt: { ru: "Какая буква идёт после «Б»?", ky: "«Б» тамгасынан кийин кайсы тамга келет?" },
    options: [{ ru: "В", ky: "В" }, { ru: "А", ky: "А" }, { ru: "Г", ky: "Г" }],
    correctIndex: 0,
    explanation: { ru: "После «Б» идёт «В».", ky: "«Б»дан кийин «В» келет." },
  },
  // 1 класс — гласные и согласные
  {
    id: "g-read-vowel-d", type: "single_choice", subject: "reading", topic: "read-vowels", grade: 1,
    difficulty: 2, free: true,
    prompt: { ru: "Найди согласную букву", ky: "Үнсүз тамганы тап" },
    options: [{ ru: "О", ky: "О" }, { ru: "М", ky: "М" }, { ru: "А", ky: "А" }],
    correctIndex: 1,
    explanation: { ru: "М — согласная буква.", ky: "М — үнсүз тамга." },
  },
  {
    id: "g-read-vowel-e", type: "single_choice", subject: "reading", topic: "read-vowels", grade: 1,
    difficulty: 2, free: false,
    prompt: { ru: "Буква «У» — какая?", ky: "«У» тамгасы кандай?" },
    options: [{ ru: "гласная", ky: "үндүү" }, { ru: "согласная", ky: "үнсүз" }],
    correctIndex: 0,
    explanation: { ru: "У — гласная буква.", ky: "У — үндүү тамга." },
  },
  // 3 класс — логика
  {
    id: "g-log3-d", type: "number_input", subject: "logic", topic: "log3", grade: 3,
    difficulty: 2, free: true,
    prompt: { ru: "Продолжи ряд: 3, 6, 9, 12, ?", ky: "Катарды улант: 3, 6, 9, 12, ?" },
    answer: 15,
    explanation: { ru: "Прибавляем по 3: 12 + 3 = 15.", ky: "3төн кошобуз: 12 + 3 = 15." },
  },
  {
    id: "g-log3-e", type: "single_choice", subject: "logic", topic: "log3", grade: 3,
    difficulty: 2, free: false,
    prompt: { ru: "Какое число лишнее: 10, 20, 25, 30?", ky: "Кайсы сан ашык: 10, 20, 25, 30?" },
    options: [{ ru: "10", ky: "10" }, { ru: "20", ky: "20" }, { ru: "25", ky: "25" }, { ru: "30", ky: "30" }],
    correctIndex: 2,
    explanation: { ru: "25 не делится на 10, остальные делятся.", ky: "25 10го бөлүнбөйт, калгандары бөлүнөт." },
  },
  // 4 класс — логика
  {
    id: "g-log4-d", type: "number_input", subject: "logic", topic: "log4", grade: 4,
    difficulty: 3, free: true,
    prompt: { ru: "Продолжи ряд: 2, 4, 8, 16, ?", ky: "Катарды улант: 2, 4, 8, 16, ?" },
    answer: 32,
    explanation: { ru: "Каждое число в 2 раза больше: 16 × 2 = 32.", ky: "Ар бир сан 2 эсе чоң: 16 × 2 = 32." },
  },
  {
    id: "g-log4-e", type: "single_choice", subject: "logic", topic: "log4", grade: 4,
    difficulty: 3, free: false,
    prompt: { ru: "Какое число лишнее: 8, 12, 16, 18?", ky: "Кайсы сан ашык: 8, 12, 16, 18?" },
    options: [{ ru: "8", ky: "8" }, { ru: "12", ky: "12" }, { ru: "16", ky: "16" }, { ru: "18", ky: "18" }],
    correctIndex: 3,
    explanation: { ru: "8, 12, 16 делятся на 4, а 18 нет.", ky: "8, 12, 16 4кө бөлүнөт, 18 андай эмес." },
  },
  // 3 класс — чтение
  {
    id: "g-read3-d", type: "single_choice", subject: "reading", topic: "read3", grade: 3,
    difficulty: 2, free: true,
    prompt: { ru: "Найди слово-предмет (кто? что?)", ky: "Затты билдирген сөздү тап (ким? эмне?)" },
    options: [{ ru: "бежит", ky: "чуркайт" }, { ru: "дерево", ky: "дарак" }, { ru: "быстро", ky: "тез" }],
    correctIndex: 1,
    explanation: { ru: "«Дерево» — предмет.", ky: "«Дарак» — зат." },
  },
  {
    id: "g-read3-e", type: "number_input", subject: "reading", topic: "read3", grade: 3,
    difficulty: 2, free: false,
    prompt: { ru: "Сколько предложений: «Идёт дождь. Дети дома.»?", ky: "Канча сүйлөм: «Жамгыр жаайт. Балдар үйдө.»?" },
    answer: 2,
    explanation: { ru: "Два предложения.", ky: "Эки сүйлөм." },
  },
  // 4 класс — чтение
  {
    id: "g-read4-d", type: "single_choice", subject: "reading", topic: "read4", grade: 4,
    difficulty: 3, free: true,
    prompt: { ru: "Найди слово-действие (что делает?)", ky: "Иш-аракетти билдирген сөздү тап" },
    options: [{ ru: "море", ky: "деңиз" }, { ru: "плывёт", ky: "сүзөт" }, { ru: "синий", ky: "көк" }],
    correctIndex: 1,
    explanation: { ru: "«Плывёт» — действие.", ky: "«Сүзөт» — иш-аракет." },
  },
  {
    id: "g-read4-e", type: "single_choice", subject: "reading", topic: "read4", grade: 4,
    difficulty: 3, free: false,
    prompt: { ru: "Найди слово-признак (какой?)", ky: "Белгини билдирген сөздү тап (кандай?)" },
    options: [{ ru: "дом", ky: "үй" }, { ru: "большой", ky: "чоң" }, { ru: "прыгать", ky: "секирүү" }],
    correctIndex: 1,
    explanation: { ru: "«Большой» — признак предмета.", ky: "«Чоң» — заттын белгиси." },
  },
  // Догрузка до 5 заданий в теме
  {
    id: "g-read3-f", type: "number_input", subject: "reading", topic: "read3", grade: 3,
    difficulty: 2, free: false,
    prompt: { ru: "Сколько слов в предложении: «Кот пьёт молоко»?", ky: "«Мышык сүт ичет» сүйлөмүндө канча сөз?" },
    answer: 3,
    explanation: { ru: "Слова: три.", ky: "Сөздөр: үчөө." },
  },
  {
    id: "g-log4-f", type: "number_input", subject: "logic", topic: "log4", grade: 4,
    difficulty: 3, free: false,
    prompt: { ru: "Продолжи ряд: 5, 10, 15, 20, ?", ky: "Катарды улант: 5, 10, 15, 20, ?" },
    answer: 25,
    explanation: { ru: "Прибавляем по 5: 20 + 5 = 25.", ky: "5тен кошобуз: 20 + 5 = 25." },
  },
  {
    id: "g-read4-f", type: "single_choice", subject: "reading", topic: "read4", grade: 4,
    difficulty: 3, free: false,
    prompt: { ru: "Найди слово-предмет (кто? что?)", ky: "Затты билдирген сөздү тап (ким? эмне?)" },
    options: [{ ru: "красивый", ky: "кооз" }, { ru: "книга", ky: "китеп" }, { ru: "читать", ky: "окуу" }],
    correctIndex: 1,
    explanation: { ru: "«Книга» — предмет.", ky: "«Китеп» — зат." },
  },
  {
    id: "g-world10-f", type: "single_choice", subject: "world", topic: "world10", grade: 10,
    difficulty: 3, free: false,
    prompt: { ru: "У какой планеты есть яркие кольца?", ky: "Кайсы планетанын жаркыраган шакектери бар?" },
    options: [{ ru: "Сатурн", ky: "Сатурн" }, { ru: "Марс", ky: "Марс" }, { ru: "Меркурий", ky: "Меркурий" }],
    correctIndex: 0,
    explanation: { ru: "У Сатурна яркие кольца из льда и камней.", ky: "Сатурндун муз менен таштан турган жаркыраган шакектери бар." },
  },
  {
    id: "g-world11-e", type: "single_choice", subject: "world", topic: "world11", grade: 11,
    difficulty: 3, free: false,
    prompt: { ru: "Какой газ преобладает в воздухе?", ky: "Абада кайсы газ басымдуулук кылат?" },
    options: [{ ru: "азот", ky: "азот" }, { ru: "кислород", ky: "кычкылтек" }, { ru: "водород", ky: "суутек" }],
    correctIndex: 0,
    explanation: { ru: "Воздух примерно на 78% состоит из азота.", ky: "Аба болжол менен 78% азоттон турат." },
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
  ...fracTasks("m5-frac", 5, [[4, 24], [6, 36], [8, 40], [10, 90], [3, 21], [7, 49], [9, 81]]),
  ...addTasks("m5-big", 5, [[1200, 300], [2500, 1500], [3400, 600], [4800, 1100]]),
  ...subTasks("m5-big", 5, [[5000, 1200], [3200, 800], [7500, 2500]]),
  // ── 6 класс ──
  ...negTasks("m6-neg", 6, [[5, 8], [3, 10], [7, 2], [4, 9], [6, 6], [2, 15], [11, 4]]),
  ...eqAddTasks("m6-eq", 6, [[5, 7], [8, 4], [3, 9], [12, 6]]),
  ...eqMulTasks("m6-eq", 6, [[3, 4], [5, 6], [2, 9]]),
  ...percentTasks("m6-percent", 6, [[15, 200], [40, 90], [5, 300], [25, 160], [10, 250], [50, 44]]),
  // ── 7 класс ──
  ...sqTasks("m7-pow", 7, [3, 4, 5, 6, 7, 8]),
  ...eqAddTasks("m7-eq", 7, [[12, 5], [7, 8], [15, 9]]),
  ...eqMulTasks("m7-eq", 7, [[4, 7], [6, 5], [8, 4]]),
  // ── 8 класс ──
  ...sqrtTasks("m8-sqrt", 8, [4, 5, 6, 7, 8, 9]),
  ...sqTasks("m8-pow", 8, [8, 9, 10, 11, 12]),
  ...eqMulTasks("m8-eq", 8, [[7, 8], [9, 6], [8, 7]]),
  ...eqAddTasks("m8-eq", 8, [[14, 9], [23, 8], [31, 17]]),
  // ── 9 класс ──
  ...seqTasks("m9-prog", 9, [[3, 7], [5, 4], [2, 9], [10, 6], [4, 11], [7, 8]]),
  ...sqTasks("m9-pow", 9, [11, 12, 13, 14, 15, 16]),
  ...sqrtTasks("m9-root", 9, [10, 11, 12, 13, 14, 15]),
  ...eqAddTasks("m9-eq", 9, [[25, 17], [40, 23], [18, 29], [50, 34]]),
  ...eqMulTasks("m9-eq", 9, [[6, 12], [8, 9]]),
  // ── 10 класс ──
  ...percentTasks("m10-calc", 10, [[15, 240], [12, 350], [8, 125], [35, 400]]),
  ...sqrtTasks("m10-calc", 10, [13, 14, 15, 20]),
  ...sqTasks("m10-pow", 10, [13, 15, 20, 25, 18, 30]),
  // ── 11 класс ──
  ...sqTasks("m11-calc", 11, [15, 16, 20, 25, 30]),
  ...percentTasks("m11-calc", 11, [[18, 150], [22, 500], [45, 80]]),
  ...seqTasks("m11-calc", 11, [[100, 25], [7, 13]]),
  ...LOGIC_EXTRA,
  ...READING_EXTRA,
  ...GRADE_HIGH_HL,
  ...THIN_TOPUP,
  ...higherTasks,

  // ── Догрузка до ~10 заданий в каждой теме (математика) ──
  ...compareTasks("pre-more", 0, [[6, 2], [3, 7]]),
  ...compareTasks("math-compare", 1, [[12, 7], [9, 15]]),
  ...multTasks("m3-mult", 3, [[7, 9], [8, 6], [9, 9], [6, 6]]),
  ...divTasks("m3-div", 3, [[54, 6], [72, 8], [64, 8], [49, 7]]),
  ...addTasks("m3-big", 3, [[275, 118], [340, 260]]),
  ...subTasks("m3-big", 3, [[610, 240]]),
  ...orderTasks("m4-order", 4, [[3, 4, 2], [6, 2, 5], [9, 3, 2], [4, 5, 3], [7, 2, 4]]),
  ...fracTasks("m4-frac", 4, [[3, 12], [5, 30], [7, 21], [4, 16], [6, 24]]),
  ...percentTasks("m5-percent", 5, [[40, 80], [15, 120], [5, 240], [35, 60], [60, 50]]),
  ...fracTasks("m5-frac", 5, [[3, 27], [7, 56], [9, 45]]),
  ...addTasks("m5-big", 5, [[1400, 350], [2600, 1900]]),
  ...subTasks("m5-big", 5, [[6400, 1500]]),
  ...negTasks("m6-neg", 6, [[9, 3], [8, 12], [10, 4]]),
  ...eqAddTasks("m6-eq", 6, [[9, 11], [14, 20]]),
  ...eqMulTasks("m6-eq", 6, [[6, 7]]),
  ...percentTasks("m6-percent", 6, [[30, 120], [12, 150], [45, 80]]),
  ...powTasks("m7-pow", 7, [[2, 4], [2, 6], [3, 3], [5, 3]]),
  ...eqAddTasks("m7-eq", 7, [[18, 9], [24, 11]]),
  ...eqMulTasks("m7-eq", 7, [[7, 9], [9, 8]]),
  ...areaRectTasks("m7-geo", 7, [[7, 9], [8, 11], [6, 13]]),
  ...perimRectTasks("m7-geo", 7, [[5, 9], [8, 12]]),
  ...sqrtTasks("m8-sqrt", 8, [10, 11, 12, 13]),
  ...powTasks("m8-pow", 8, [[2, 5], [2, 7], [3, 3], [4, 3], [5, 3]]),
  ...eqAddTasks("m8-eq", 8, [[19, 12], [27, 15]]),
  ...eqMulTasks("m8-eq", 8, [[8, 9], [7, 11]]),
  ...pythagTasks("m8-geo", 8, [[7, 24], [20, 21], [9, 40], [12, 35], [10, 24]]),
  ...seqTasks("m9-prog", 9, [[6, 5], [8, 3], [9, 7], [12, 4]]),
  ...powTasks("m9-pow", 9, [[2, 8], [3, 4], [2, 9], [4, 4]]),
  ...sqrtTasks("m9-root", 9, [16, 17, 18, 19]),
  ...eqAddTasks("m9-eq", 9, [[32, 19], [45, 28]]),
  ...eqMulTasks("m9-eq", 9, [[9, 11], [12, 8]]),
  ...areaRectTasks("m9-geo", 9, [[11, 6], [14, 5], [9, 12]]),
  ...perimRectTasks("m9-geo", 9, [[7, 13], [10, 15]]),
  ...percentTasks("m10-calc", 10, [[45, 80], [16, 250]]),
  ...powTasks("m10-pow", 10, [[2, 10], [3, 5], [6, 3], [7, 3]]),
  ...quadTasks("m10-eq", 10, [[2, 5], [4, 6], [3, 8], [5, 7], [6, 9]]),
  ...cubeTasks("m11-geo", 11, [7, 8, 9, 10, 2]),

  // ── Догрузка до ~10 (логика: ряды арифметические/геометрические) ──
  ...logSeqTasks("pre-odd", 0, [[2, 2], [1, 1], [5, 5], [3, 3]], 4),
  ...logSeqTasks("pre-shapes", 0, [[10, 10]], 1),
  ...logSeqTasks("pre-seq", 0, [[1, 2], [4, 2], [6, 3]], 3),
  ...logSeqTasks("pre-big", 0, [[2, 4], [5, 2], [3, 5]], 3),
  ...logSeqTasks("log-odd", 1, [[3, 3], [2, 4], [1, 5]], 3),
  ...geoSeqTasks("log-odd", 1, [[2, 2]], 1),
  ...logSeqTasks("log-seq", 1, [[4, 4], [10, 5]], 2),
  ...geoSeqTasks("log-seq", 1, [[1, 3], [3, 2]], 2),
  ...logSeqTasks("log-think", 2, [[5, 6], [8, 7]], 2),
  ...logSeqTasks("log3", 3, [[7, 4], [11, 6]], 2),
  ...geoSeqTasks("log3", 3, [[2, 3], [3, 3]], 2),
  ...logSeqTasks("log4", 4, [[9, 7], [13, 5]], 2),
  ...geoSeqTasks("log4", 4, [[2, 4], [5, 2]], 2),
  ...logSeqTasks("log5", 5, [[8, 9], [11, 6]], 2),
  ...geoSeqTasks("log5", 5, [[3, 4], [4, 3]], 2),
  ...logSeqTasks("log6", 6, [[12, 8], [15, 9]], 2),
  ...geoSeqTasks("log6", 6, [[2, 5], [6, 2]], 2),
  ...logSeqTasks("log7", 7, [[14, 11], [20, 13]], 2),
  ...geoSeqTasks("log7", 7, [[3, 5], [7, 2]], 2),
  ...logSeqTasks("log8", 8, [[16, 12], [25, 15]], 2),
  ...geoSeqTasks("log8", 8, [[2, 6], [4, 5]], 2),
  ...logSeqTasks("log9", 9, [[18, 14], [30, 17]], 2),
  ...geoSeqTasks("log9", 9, [[5, 4], [8, 3]], 2),
  ...logSeqTasks("log10", 10, [[21, 16], [40, 19]], 2),
  ...geoSeqTasks("log10", 10, [[3, 6], [9, 2]], 2),
  ...logSeqTasks("log11", 11, [[24, 18], [50, 21]], 2),
  ...geoSeqTasks("log11", 11, [[4, 6], [10, 3]], 2),

  // ── Догрузка до ~10 (чтение: буквы и части речи) ──
  ...vowelTasks("pre-letters", 0, [["У", true], ["М", false]], 2),
  ...vowelTasks("read-letters", 1, [["И", true], ["П", false], ["Э", true]], 2),
  ...vowelTasks("read-vowels", 1, [["О", true], ["Т", false], ["Ы", true]], 2),
  ...posTasks("read-words", 2, ["noun", "verb", "adj"], 2),
  ...posTasks("read3", 3, ["noun", "verb", "adj", "noun"], 2),
  ...posTasks("read4", 4, ["verb", "adj", "noun", "verb"], 2),
  ...posTasks("read5", 5, ["adj", "noun", "verb", "adj"], 2),
  ...posTasks("read6", 6, ["noun", "adj", "verb", "noun"], 2),
  ...posTasks("read7", 7, ["verb", "noun", "adj", "verb"], 2),
  ...posTasks("read8", 8, ["noun", "verb", "adj", "adj"], 2),
  ...posTasks("read9", 9, ["adj", "verb", "noun", "verb"], 2),
  ...posTasks("read10", 10, ["verb", "adj", "noun", "noun"], 2),
  ...posTasks("read11", 11, ["noun", "adj", "verb", "adj"], 2),
];
