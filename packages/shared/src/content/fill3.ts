import type { Task, Difficulty } from "./types";

// Наполнение #3: визуальные задания с эмодзи-вариантами (крупные карточки, тап
// по картинке) для младших классов + немного олимпиады. Вопрос озвучивается.

type Pair = [string, string];
const E = (arr: string[]) => arr.map((e) => ({ ru: e, ky: e })); // эмодзи одинаковы
const L = (a: Pair[]) => a.map(([ru, ky]) => ({ ru, ky }));

function pick(
  id: string, topic: string, subject: Task["subject"], grade: number,
  ru: string, ky: string, emojis: string[], correctIndex: number,
  eRu: string, eKy: string, difficulty: Difficulty = 1, star = false,
): Task {
  return { id, type: "single_choice", subject, topic, grade, difficulty, free: true, star,
    prompt: { ru, ky }, options: E(emojis), correctIndex, explanation: { ru: eRu, ky: eKy } };
}
function pickMulti(
  id: string, topic: string, subject: Task["subject"], grade: number,
  ru: string, ky: string, emojis: string[], correctIndexes: number[],
  eRu: string, eKy: string, difficulty: Difficulty = 1,
): Task {
  return { id, type: "multi_select", subject, topic, grade, difficulty, free: true,
    prompt: { ru, ky }, options: E(emojis), correctIndexes, explanation: { ru: eRu, ky: eKy } };
}
function choiceT(
  id: string, topic: string, subject: Task["subject"], grade: number,
  ru: string, ky: string, options: Pair[], correctIndex: number,
  eRu: string, eKy: string, difficulty: Difficulty = 2,
): Task {
  return { id, type: "single_choice", subject, topic, grade, difficulty, free: true,
    prompt: { ru, ky }, options: L(options), correctIndex, explanation: { ru: eRu, ky: eKy } };
}

const tasks: Task[] = [
  // ── 0 класс — визуальное «найди лишнее» / «найди фигуру» ──
  pick("f3-0-1", "pre-odd", "logic", 0, "Что здесь лишнее? Нажми на картинку.", "Бул жерде эмне ашык? Сүрөткө бас.",
    ["🍎", "🍐", "🚗", "🍌"], 2, "Машина — не фрукт.", "Машина — жемиш эмес."),
  pick("f3-0-2", "pre-odd", "logic", 0, "Что здесь лишнее?", "Бул жерде эмне ашык?",
    ["🐶", "🐱", "🌳", "🐰"], 2, "Дерево — не животное.", "Дарак — жаныбар эмес."),
  pick("f3-0-3", "pre-shapes", "logic", 0, "Найди круг.", "Тегеректи тап.",
    ["🔺", "⚫", "🟦"], 1, "Круг — ⚫.", "Тегерек — ⚫."),
  pick("f3-0-4", "pre-shapes", "logic", 0, "Найди красное.", "Кызылды тап.",
    ["🟦", "🟥", "🟩"], 1, "Красный — 🟥.", "Кызыл — 🟥."),
  pickMulti("f3-0-5", "pre-world", "world", 0, "Отметь животных.", "Жаныбарларды белгиле.",
    ["🐕", "🍎", "🐈", "🌸"], [0, 2], "Собака и кошка — животные.", "Ит менен мышык — жаныбарлар."),
  pick("f3-0-6", "pre-world", "world", 0, "Кто летает?", "Ким учат?",
    ["🐟", "🐦", "🐢"], 1, "Птица летает.", "Куш учат."),

  // ── 1 класс ──
  pick("f3-1-1", "log-odd", "logic", 1, "Что здесь лишнее?", "Бул жерде эмне ашык?",
    ["🍓", "🍒", "🍎", "🥔"], 3, "Картошка — овощ, остальное — фрукты/ягоды.", "Картошка — жашылча, калгандары — мөмө."),
  pick("f3-1-2", "log-odd", "logic", 1, "Найди лишнее.", "Ашыгын тап.",
    ["⚽", "🏀", "🎾", "📕"], 3, "Книга — не мяч.", "Китеп — топ эмес."),
  pickMulti("f3-1-3", "world1", "world", 1, "Отметь транспорт.", "Транспортту белгиле.",
    ["🚗", "🍎", "🚌", "🚲"], [0, 2, 3], "Машина, автобус, велосипед — транспорт.", "Машина, автобус, велосипед — транспорт."),

  // ── 2 класс ──
  pick("f3-2-1", "log-think", "logic", 2, "Что здесь лишнее?", "Бул жерде эмне ашык?",
    ["🚗", "🚕", "🚌", "🍎"], 3, "Яблоко — не транспорт.", "Алма — транспорт эмес.", 2),
  pick("f3-2-2", "log-think", "logic", 2, "Найди лишнее.", "Ашыгын тап.",
    ["🔵", "🔵", "🔴", "🔵"], 2, "Один кружок другого цвета.", "Бир тегерек башка түстө.", 2),

  // ── 3–4 класс ──
  pick("f3-3-1", "log3", "logic", 3, "Кто здесь лишний?", "Ким бул жерде ашык?",
    ["🐟", "🦈", "🐬", "🦅"], 3, "Орёл — птица, остальные живут в воде.", "Бүркүт — куш, калгандары сууда жашайт.", 2, true),
  pick("f3-4-1", "log4", "logic", 4, "Найди лишнее.", "Ашыгын тап.",
    ["🍏", "🍎", "🍐", "🥕"], 3, "Морковь — овощ.", "Сабиз — жашылча.", 2),

  // ── Олимпиада для младших ──
  choiceT("f3-o0-1", "oly-0", "olympiad", 0, "Сколько лап у кошки?", "Мышыктын канча буту бар?",
    [["2", "2"], ["4", "4"], ["6", "6"]], 1, "У кошки 4 лапы.", "Мышыктын 4 буту бар.", 2),
  choiceT("f3-o1-1", "oly-1", "olympiad", 1, "Что тяжелее: слон или мышь?", "Кайсынысы оор: пил же чычкан?",
    [["Слон", "Пил"], ["Мышь", "Чычкан"], ["Одинаково", "Бирдей"]], 0, "Слон намного тяжелее.", "Пил алда канча оор.", 2),
];

export const fill3Tasks: Task[] = tasks;
