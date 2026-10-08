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

// ── ОРТ / ЖРТ (пилот): пулы для тренажёра в формате Общереспубликанского
// тестирования (11 класс, поступление в вуз). Вопросы бери вразброс.
// Грамотность написана по-язычно: RU-вариант проверяет русскую норму,
// KY-вариант — кыргызскую (correctIndex общий для обоих).

const ORT_MATH_POOL: Record<string, unknown>[] = [
  { type: "number_input", subject: "math", topic: "ort", grade: 11, difficulty: 3, free: true,
    prompt: { ru: "Сколько будет 25% от 80?", ky: "80дин 25% канча болот?" },
    answer: 20, explanation: { ru: "80 × 0,25 = 20.", ky: "80 × 0,25 = 20." } },
  { type: "number_input", subject: "math", topic: "ort", grade: 11, difficulty: 3, free: true,
    prompt: { ru: "Найдите 15% от 200.", ky: "200дүн 15% тап." },
    answer: 30, explanation: { ru: "200 × 0,15 = 30.", ky: "200 × 0,15 = 30." } },
  { type: "single_choice", subject: "math", topic: "ort", grade: 11, difficulty: 3, free: true,
    prompt: { ru: "2, 6, 18, 54, … Какое число следующее?", ky: "2, 6, 18, 54, … Кийинки сан кайсы?" },
    options: [{ ru: "162", ky: "162" }, { ru: "108", ky: "108" }, { ru: "120", ky: "120" }, { ru: "216", ky: "216" }],
    correctIndex: 0, explanation: { ru: "Каждое число ×3: 54 × 3 = 162.", ky: "Ар бир сан ×3: 54 × 3 = 162." } },
  { type: "number_input", subject: "math", topic: "ort", grade: 11, difficulty: 3, free: true,
    prompt: { ru: "Если 3x = 21, чему равен x?", ky: "Эгер 3x = 21 болсо, x канчага барабар?" },
    answer: 7, explanation: { ru: "x = 21 ÷ 3 = 7.", ky: "x = 21 ÷ 3 = 7." } },
  { type: "number_input", subject: "math", topic: "ort", grade: 11, difficulty: 3, free: true,
    prompt: { ru: "Поезд прошёл 240 км за 3 часа. Средняя скорость (км/ч)?", ky: "Поезд 240 км 3 саатта басты. Орточо ылдамдык (км/с)?" },
    answer: 80, explanation: { ru: "240 ÷ 3 = 80 км/ч.", ky: "240 ÷ 3 = 80 км/с." } },
  { type: "number_input", subject: "math", topic: "ort", grade: 11, difficulty: 3, free: true,
    prompt: { ru: "Периметр квадрата 20 см. Чему равна его площадь (см²)?", ky: "Чарчынын периметри 20 см. Анын аянты канча (см²)?" },
    answer: 25, explanation: { ru: "Сторона 20 ÷ 4 = 5, площадь 5 × 5 = 25.", ky: "Тарабы 20 ÷ 4 = 5, аянты 5 × 5 = 25." } },
  { type: "number_input", subject: "math", topic: "ort", grade: 11, difficulty: 3, free: true,
    prompt: { ru: "Вычислите 2⁶.", ky: "2⁶ эсепте." },
    answer: 64, explanation: { ru: "2⁶ = 64.", ky: "2⁶ = 64." } },
  { type: "single_choice", subject: "math", topic: "ort", grade: 11, difficulty: 3, free: true,
    prompt: { ru: "Сколько процентов составляет 30 от 150?", ky: "30 150дин канча пайызы?" },
    options: [{ ru: "20%", ky: "20%" }, { ru: "15%", ky: "15%" }, { ru: "25%", ky: "25%" }, { ru: "30%", ky: "30%" }],
    correctIndex: 0, explanation: { ru: "30 ÷ 150 = 0,2 = 20%.", ky: "30 ÷ 150 = 0,2 = 20%." } },
  { type: "number_input", subject: "math", topic: "ort", grade: 11, difficulty: 3, free: true,
    prompt: { ru: "a + b = 12 и a − b = 4. Чему равно a?", ky: "a + b = 12 жана a − b = 4. a канчага барабар?" },
    answer: 8, explanation: { ru: "Сложив уравнения: 2a = 16, a = 8.", ky: "Теңдемелерди кошсок: 2a = 16, a = 8." } },
  { type: "number_input", subject: "math", topic: "ort", grade: 11, difficulty: 3, free: true,
    prompt: { ru: "В классе 30 учеников, 40% — девочки. Сколько девочек?", ky: "Класста 30 окуучу, 40% — кыздар. Канча кыз бар?" },
    answer: 12, explanation: { ru: "30 × 0,4 = 12.", ky: "30 × 0,4 = 12." } },
  { type: "number_input", subject: "math", topic: "ort", grade: 11, difficulty: 3, free: true,
    prompt: { ru: "Найдите значение 2(x + 3) при x = 5.", ky: "x = 5 болгондо 2(x + 3) маанисин тап." },
    answer: 16, explanation: { ru: "2 × (5 + 3) = 2 × 8 = 16.", ky: "2 × (5 + 3) = 2 × 8 = 16." } },
  { type: "number_input", subject: "math", topic: "ort", grade: 11, difficulty: 3, free: true,
    prompt: { ru: "Среднее арифметическое чисел 4, 8 и 12?", ky: "4, 8 жана 12 сандарынын орточо арифметикасы?" },
    answer: 8, explanation: { ru: "(4 + 8 + 12) ÷ 3 = 24 ÷ 3 = 8.", ky: "(4 + 8 + 12) ÷ 3 = 24 ÷ 3 = 8." } },
  { type: "single_choice", subject: "math", topic: "ort", grade: 11, difficulty: 3, free: true,
    prompt: { ru: "Сторону квадрата увеличили в 2 раза. Во сколько раз выросла площадь?", ky: "Чарчынын тарабын 2 эсе чоңойтту. Аянты канча эсе өстү?" },
    options: [{ ru: "в 4 раза", ky: "4 эсе" }, { ru: "в 2 раза", ky: "2 эсе" }, { ru: "в 8 раз", ky: "8 эсе" }],
    correctIndex: 0, explanation: { ru: "Площадь растёт как квадрат: 2² = 4.", ky: "Аянт квадрат сыяктуу өсөт: 2² = 4." } },
  { type: "number_input", subject: "math", topic: "ort", grade: 11, difficulty: 3, free: true,
    prompt: { ru: "Чему равен √144?", ky: "√144 канчага барабар?" },
    answer: 12, explanation: { ru: "12 × 12 = 144, значит √144 = 12.", ky: "12 × 12 = 144, демек √144 = 12." } },
];

const ORT_VERBAL_POOL: Record<string, unknown>[] = [
  { type: "single_choice", subject: "reading", topic: "ort", grade: 11, difficulty: 3, free: true,
    prompt: { ru: "Врач — больница. Учитель — ?", ky: "Дарыгер — оорукана. Мугалим — ?" },
    options: [{ ru: "школа", ky: "мектеп" }, { ru: "доска", ky: "доска" }, { ru: "ученик", ky: "окуучу" }],
    correctIndex: 0, explanation: { ru: "Место работы: врач — в больнице, учитель — в школе.", ky: "Иштеген жери: дарыгер — ооруканада, мугалим — мектепте." } },
  { type: "single_choice", subject: "reading", topic: "ort", grade: 11, difficulty: 3, free: true,
    prompt: { ru: "День — ночь. Свет — ?", ky: "Күн — түн. Жарык — ?" },
    options: [{ ru: "тьма", ky: "караңгы" }, { ru: "лампа", ky: "чырак" }, { ru: "солнце", ky: "күн" }],
    correctIndex: 0, explanation: { ru: "Противоположности: день↔ночь, свет↔тьма.", ky: "Карама-каршы: күн↔түн, жарык↔караңгы." } },
  { type: "single_choice", subject: "reading", topic: "ort", grade: 11, difficulty: 3, free: true,
    prompt: { ru: "Писатель — книга. Художник — ?", ky: "Жазуучу — китеп. Сүрөтчү — ?" },
    options: [{ ru: "картина", ky: "сүрөт" }, { ru: "кисть", ky: "кылкалем" }, { ru: "музей", ky: "музей" }],
    correctIndex: 0, explanation: { ru: "Что создаёт: писатель — книгу, художник — картину.", ky: "Эмне жаратат: жазуучу — китеп, сүрөтчү — сүрөт." } },
  { type: "single_choice", subject: "reading", topic: "ort", grade: 11, difficulty: 2, free: true,
    prompt: { ru: "Найдите лишнее слово.", ky: "Ашыкча сөздү тап." },
    options: [{ ru: "морковь", ky: "сабиз" }, { ru: "яблоко", ky: "алма" }, { ru: "груша", ky: "алмурут" }, { ru: "слива", ky: "алча" }],
    correctIndex: 0, explanation: { ru: "Морковь — овощ, остальное — фрукты.", ky: "Сабиз — жашылча, калганы — мөмө." } },
  { type: "single_choice", subject: "reading", topic: "ort", grade: 11, difficulty: 2, free: true,
    prompt: { ru: "Найдите лишнее слово.", ky: "Ашыкча сөздү тап." },
    options: [{ ru: "дуб", ky: "эмен" }, { ru: "роза", ky: "роза" }, { ru: "тюльпан", ky: "лала" }, { ru: "ромашка", ky: "ромашка" }],
    correctIndex: 0, explanation: { ru: "Дуб — дерево, остальное — цветы.", ky: "Эмен — дарак, калганы — гүл." } },
  { type: "single_choice", subject: "reading", topic: "ort", grade: 11, difficulty: 2, free: true,
    prompt: { ru: "Синоним к слову «храбрый»?", ky: "«Эр жүрөк» сөзүнүн синоними?" },
    options: [{ ru: "смелый", ky: "кайраттуу" }, { ru: "слабый", ky: "алсыз" }, { ru: "грустный", ky: "капалуу" }],
    correctIndex: 0, explanation: { ru: "«Смелый» — близко по значению.", ky: "«Кайраттуу» — мааниси жакын." } },
  { type: "single_choice", subject: "reading", topic: "ort", grade: 11, difficulty: 3, free: true,
    prompt: { ru: "Антоним к слову «щедрый»?", ky: "«Айкөл» сөзүнүн антоними?" },
    options: [{ ru: "жадный", ky: "сараң" }, { ru: "добрый", ky: "боорукер" }, { ru: "весёлый", ky: "шайыр" }],
    correctIndex: 0, explanation: { ru: "Противоположность щедрости — жадность.", ky: "Айкөлдүктүн карама-каршысы — сараңдык." } },
  { type: "single_choice", subject: "reading", topic: "ort", grade: 11, difficulty: 3, free: true,
    prompt: { ru: "Чтобы хорошо сдать экзамен, нужно систематически …", ky: "Экзаменди жакшы тапшыруу үчүн системалуу …" },
    options: [{ ru: "готовиться", ky: "даярдануу" }, { ru: "отдыхать", ky: "эс алуу" }, { ru: "волноваться", ky: "толкундануу" }],
    correctIndex: 0, explanation: { ru: "По смыслу подходит «готовиться».", ky: "Мааниси боюнча «даярдануу» туура келет." } },
  { type: "single_choice", subject: "reading", topic: "ort", grade: 11, difficulty: 3, free: true,
    prompt: { ru: "Все розы — цветы. Это роза. Значит, это …", ky: "Бардык розалар — гүл. Бул роза. Демек, бул …" },
    options: [{ ru: "цветок", ky: "гүл" }, { ru: "дерево", ky: "дарак" }, { ru: "трава", ky: "чөп" }],
    correctIndex: 0, explanation: { ru: "Логический вывод: роза входит в множество цветов.", ky: "Логикалык жыйынтык: роза гүлдөрдүн тобуна кирет." } },
  { type: "single_choice", subject: "reading", topic: "ort", grade: 11, difficulty: 2, free: true,
    prompt: { ru: "Синоним к слову «быстрый»?", ky: "«Тез» сөзүнүн синоними?" },
    options: [{ ru: "скорый", ky: "шамдагай" }, { ru: "медленный", ky: "жай" }, { ru: "тихий", ky: "акырын" }],
    correctIndex: 0, explanation: { ru: "«Скорый» — близко по значению.", ky: "«Шамдагай» — мааниси жакын." } },
];

const ORT_GRAMMAR_POOL: Record<string, unknown>[] = [
  { type: "single_choice", subject: "reading", topic: "ort", grade: 11, difficulty: 3, free: true,
    prompt: { ru: "Где нужна запятая? «Когда стемнело_ мы вернулись домой».", ky: "Үтүр кайда керек? «Караңгы киргенде_ үйгө кайттык»." },
    options: [{ ru: "после «стемнело»", ky: "«киргенде»ден кийин" }, { ru: "после «мы»", ky: "«үйгө»дөн кийин" }, { ru: "запятая не нужна", ky: "үтүр керек эмес" }],
    correctIndex: 0, explanation: { ru: "Придаточное отделяется запятой от главного.", ky: "Багыныңкы сүйлөм башкы сүйлөмдөн үтүр менен бөлүнөт." } },
  { type: "single_choice", subject: "reading", topic: "ort", grade: 11, difficulty: 3, free: true,
    prompt: { ru: "Выберите слово без ошибки.", ky: "Катасыз сөздү танда." },
    options: [{ ru: "агентство", ky: "директор" }, { ru: "агенство", ky: "диретор" }, { ru: "агенцтво", ky: "директр" }],
    correctIndex: 0, explanation: { ru: "Верно: «агентство».", ky: "Туура: «директор»." } },
  { type: "single_choice", subject: "reading", topic: "ort", grade: 11, difficulty: 3, free: true,
    prompt: { ru: "Укажите грамматически верный вариант.", ky: "Грамматикалык туура вариантты көрсөт." },
    options: [{ ru: "их дом", ky: "алардын үйү" }, { ru: "ихний дом", ky: "аларын үйү" }],
    correctIndex: 0, explanation: { ru: "Форма «ихний» — просторечие; верно «их».", ky: "Туура таандык форма — «алардын үйү»." } },
  { type: "single_choice", subject: "reading", topic: "ort", grade: 11, difficulty: 3, free: true,
    prompt: { ru: "«Невежда» — это человек, который …", ky: "«Наадан» — бул … адам." },
    options: [{ ru: "мало знает", ky: "аз билген" }, { ru: "груб в общении", ky: "одоно" }, { ru: "много работает", ky: "көп иштеген" }],
    correctIndex: 0, explanation: { ru: "Невежда — несведущий, малознающий (не путать с невежей — грубияном).", ky: "Наадан — билимсиз, аз билген адам." } },
];

// Комбинированный ОРТ-пробник: сбалансированная выборка математика + аналогии
// + грамотность, перемешанная. Варианты ответа тоже тасуются.
function ortTrial(math: number, verbal: number, grammar: number): Task[] {
  const take = (pool: Record<string, unknown>[], n: number) =>
    [...pool].sort(() => Math.random() - 0.5).slice(0, n);
  const chosen = [
    ...take(ORT_MATH_POOL, math),
    ...take(ORT_VERBAL_POOL, verbal),
    ...take(ORT_GRAMMAR_POOL, grammar),
  ].sort(() => Math.random() - 0.5);
  return chosen.map((base, i) => {
    if (base.type === "single_choice" && Array.isArray(base.options)) {
      const opts = base.options as LocalizedText[];
      const correct = opts[base.correctIndex as number];
      const mixed = [...opts].sort(() => Math.random() - 0.5);
      return q({ ...base, options: mixed, correctIndex: mixed.indexOf(correct) }, i);
    }
    return q(base, i);
  });
}

export const tests: TestDef[] = [
  {
    id: "ort",
    icon: "🎓",
    count: 15,
    title: { ru: "Пробный ОРТ", ky: "ЖРТ сыноосу" },
    description: { ru: "15 заданий: математика, аналогии, грамотность", ky: "15 тапшырма: математика, аналогиялар, сабаттуулук" },
    generate: () => ortTrial(6, 5, 4),
  },
  {
    id: "ort-math",
    icon: "🧮",
    count: 10,
    title: { ru: "Математика ОРТ", ky: "ЖРТ математика" },
    description: { ru: "10 задач уровня ОРТ: проценты, уравнения, ряды", ky: "ЖРТ деңгээлиндеги 10 маселе: пайыздар, теңдемелер, катарлар" },
    generate: () => pickPool(ORT_MATH_POOL, 10),
  },
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
