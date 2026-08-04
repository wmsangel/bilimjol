import type { Task } from "./types";

// Стартовый набор заданий для MVP: 1–2 класс, логика + математика, ru/ky.
// Часть заданий бесплатна (free: true), остальные — по подписке.
export const tasks: Task[] = [
  {
    id: "log-1-1",
    type: "single_choice",
    subject: "logic",
    grade: 1,
    difficulty: 1,
    free: true,
    illustration: "🍎 🍐 🥕 🍌",
    prompt: {
      ru: "Что здесь лишнее?",
      ky: "Бул жерде эмне ашык?",
    },
    options: [
      { ru: "Яблоко", ky: "Алма" },
      { ru: "Груша", ky: "Алмурут" },
      { ru: "Морковь", ky: "Сабиз" },
      { ru: "Банан", ky: "Банан" },
    ],
    correctIndex: 2,
    explanation: {
      ru: "Морковь — это овощ, а всё остальное — фрукты.",
      ky: "Сабиз — жашылча, калгандары — мөмө-жемиштер.",
    },
  },
  {
    id: "math-1-1",
    type: "number_input",
    subject: "math",
    grade: 1,
    difficulty: 1,
    free: true,
    illustration: "🍎🍎 ➕ 🍎🍎🍎",
    prompt: {
      ru: "Сколько будет 2 + 3?",
      ky: "2 + 3 канчага барабар?",
    },
    answer: 5,
    explanation: {
      ru: "К двум прибавляем три — получается пять.",
      ky: "Экиге үчтү кошсок — беш болот.",
    },
  },
  {
    id: "log-1-2",
    type: "single_choice",
    subject: "logic",
    grade: 1,
    difficulty: 1,
    free: true,
    prompt: {
      ru: "Продолжи ряд: 🔴 🔵 🔴 🔵 🔴 …",
      ky: "Катарды улант: 🔴 🔵 🔴 🔵 🔴 …",
    },
    options: [
      { ru: "🔴", ky: "🔴" },
      { ru: "🔵", ky: "🔵" },
      { ru: "🟢", ky: "🟢" },
    ],
    correctIndex: 1,
    explanation: {
      ru: "Цвета чередуются: после красного всегда идёт синий.",
      ky: "Түстөр алмашып турат: кызылдан кийин ар дайым көк келет.",
    },
  },
  {
    id: "math-1-2",
    type: "number_input",
    subject: "math",
    grade: 1,
    difficulty: 2,
    free: true,
    illustration: "🍬🍬🍬🍬🍬🍬",
    prompt: {
      ru: "У Ани было 6 конфет. 2 она съела. Сколько осталось?",
      ky: "Анада 6 конфет бар эле. 2өөнү жеди. Канчасы калды?",
    },
    answer: 4,
    explanation: {
      ru: "Из шести вычитаем две — остаётся четыре.",
      ky: "Алтыдан экини кемитсек — төртөө калат.",
    },
  },
  {
    id: "log-2-1",
    type: "single_choice",
    subject: "logic",
    grade: 2,
    difficulty: 2,
    free: false,
    prompt: {
      ru: "Какое число лишнее: 2, 4, 7, 8?",
      ky: "Кайсы сан ашык: 2, 4, 7, 8?",
    },
    options: [
      { ru: "2", ky: "2" },
      { ru: "4", ky: "4" },
      { ru: "7", ky: "7" },
      { ru: "8", ky: "8" },
    ],
    correctIndex: 2,
    explanation: {
      ru: "Все числа чётные, кроме 7 — оно нечётное.",
      ky: "7ден башка бардык сандар жуп, ал эми 7 так сан.",
    },
  },
  {
    id: "math-2-1",
    type: "number_input",
    subject: "math",
    grade: 2,
    difficulty: 2,
    free: false,
    prompt: {
      ru: "Продолжи ряд: 2, 4, 6, 8, ?",
      ky: "Катарды улант: 2, 4, 6, 8, ?",
    },
    answer: 10,
    explanation: {
      ru: "Каждое следующее число на 2 больше предыдущего.",
      ky: "Ар бир кийинки сан мурункусунан 2ге чоң.",
    },
  },
  {
    id: "log-2-2",
    type: "single_choice",
    subject: "logic",
    grade: 2,
    difficulty: 3,
    free: false,
    prompt: {
      ru: "Все кошки — животные. Мурка — кошка. Значит, Мурка — это…",
      ky: "Бардык мышыктар — жаныбарлар. Мурка — мышык. Демек, Мурка — бул…",
    },
    options: [
      { ru: "Животное", ky: "Жаныбар" },
      { ru: "Растение", ky: "Өсүмдүк" },
      { ru: "Машина", ky: "Машина" },
    ],
    correctIndex: 0,
    explanation: {
      ru: "Раз все кошки — животные, а Мурка кошка, то Мурка тоже животное.",
      ky: "Бардык мышыктар жаныбар болсо, Мурка да мышык, демек ал да жаныбар.",
    },
  },
  {
    id: "math-2-2",
    type: "number_input",
    subject: "math",
    grade: 2,
    difficulty: 3,
    free: false,
    prompt: {
      ru: "Посчитай: 3 + 4 + 2 = ?",
      ky: "Эсепте: 3 + 4 + 2 = ?",
    },
    answer: 9,
    explanation: {
      ru: "Сначала 3 + 4 = 7, затем 7 + 2 = 9.",
      ky: "Адегенде 3 + 4 = 7, анан 7 + 2 = 9.",
    },
  },
  {
    id: "ord-math-1",
    type: "ordering",
    subject: "math",
    grade: 1,
    difficulty: 1,
    free: true,
    illustration: "🔢",
    prompt: {
      ru: "Расставь по порядку: от меньшего к большему",
      ky: "Ирети менен кой: кичинесинен чоңуна",
    },
    items: [
      { ru: "1", ky: "1" },
      { ru: "2", ky: "2" },
      { ru: "3", ky: "3" },
      { ru: "4", ky: "4" },
    ],
    explanation: {
      ru: "От самого маленького числа к самому большому: 1, 2, 3, 4.",
      ky: "Эң кичине сандан эң чоңуна карай: 1, 2, 3, 4.",
    },
  },
  {
    id: "ord-logic-1",
    type: "ordering",
    subject: "logic",
    grade: 1,
    difficulty: 2,
    free: true,
    prompt: {
      ru: "Расставь по размеру: от маленького к большому",
      ky: "Өлчөмү боюнча кой: кичинесинен чоңуна",
    },
    items: [
      { ru: "🐜", ky: "🐜" },
      { ru: "🐱", ky: "🐱" },
      { ru: "🐶", ky: "🐶" },
      { ru: "🐘", ky: "🐘" },
    ],
    explanation: {
      ru: "Муравей меньше всех, а слон — самый большой.",
      ky: "Кумурска эң кичине, пил эң чоң.",
    },
  },
  {
    id: "match-math-1",
    type: "match_pairs",
    subject: "math",
    grade: 1,
    difficulty: 1,
    free: true,
    prompt: {
      ru: "Соедини число и количество",
      ky: "Санды жана анын санын дал келтир",
    },
    left: [
      { ru: "2", ky: "2" },
      { ru: "3", ky: "3" },
    ],
    right: [
      { ru: "🍎🍎", ky: "🍎🍎" },
      { ru: "🍎🍎🍎", ky: "🍎🍎🍎" },
    ],
    explanation: {
      ru: "2 — это два яблока, 3 — три яблока.",
      ky: "2 — эки алма, 3 — үч алма.",
    },
  },
  {
    id: "match-logic-1",
    type: "match_pairs",
    subject: "logic",
    grade: 2,
    difficulty: 2,
    free: false,
    prompt: {
      ru: "Соедини противоположности",
      ky: "Карама-каршылыктарды дал келтир",
    },
    left: [
      { ru: "День", ky: "Күн" },
      { ru: "Лето", ky: "Жай" },
    ],
    right: [
      { ru: "Ночь", ky: "Түн" },
      { ru: "Зима", ky: "Кыш" },
    ],
    explanation: {
      ru: "День — ночь, лето — зима.",
      ky: "Күн — түн, жай — кыш.",
    },
  },
];

export function getTasks(filter?: {
  subject?: Task["subject"];
  grade?: Task["grade"];
  freeOnly?: boolean;
}): Task[] {
  return tasks.filter((task) => {
    if (filter?.subject && task.subject !== filter.subject) return false;
    if (filter?.grade && task.grade !== filter.grade) return false;
    if (filter?.freeOnly && !task.free) return false;
    return true;
  });
}
