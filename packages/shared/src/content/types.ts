// Модель учебного контента. Общая для веба, API и будущих мобильных приложений.

export type Locale = "ru" | "ky";

export type Subject = "logic" | "math" | "reading" | "world";

/** Уровень сложности: 1 — лёгкий, 2 — средний, 3 — сложный. */
export type Difficulty = 1 | 2 | 3;

/** Класс: 0 — подготовка к школе (садик), далее 1–11. */
export type Grade = number;

/** Строка, переведённая на все поддерживаемые языки. */
export type LocalizedText = Record<Locale, string>;

interface TaskBase {
  id: string;
  subject: Subject;
  /** Идентификатор темы, к которой относится задание. */
  topic: string;
  grade: Grade;
  difficulty: Difficulty;
  /** Условие задачи. */
  prompt: LocalizedText;
  /** Разбор — показывается после ответа. */
  explanation: LocalizedText;
  /** Доступно ли задание в бесплатной версии. */
  free: boolean;
  /** Необязательная иллюстрация к заданию (в MVP — эмодзи, позже — картинка). */
  illustration?: string;
  /** «Задание со звёздочкой» — челлендж посложнее остальных в теме. */
  star?: boolean;
}

/** Выбор одного варианта из нескольких. */
export interface SingleChoiceTask extends TaskBase {
  type: "single_choice";
  options: LocalizedText[];
  correctIndex: number;
}

/** Ввод числового ответа. */
export interface NumberInputTask extends TaskBase {
  type: "number_input";
  answer: number;
}

/** Расставить элементы по порядку. `items` заданы в ПРАВИЛЬНОМ порядке. */
export interface OrderingTask extends TaskBase {
  type: "ordering";
  items: LocalizedText[];
}

/** Соединить пары. `right[i]` — правильная пара к `left[i]`. */
export interface MatchPairsTask extends TaskBase {
  type: "match_pairs";
  left: LocalizedText[];
  right: LocalizedText[];
}

export type Task =
  | SingleChoiceTask
  | NumberInputTask
  | OrderingTask
  | MatchPairsTask;

export type TaskType = Task["type"];

export const SUBJECTS: readonly Subject[] = ["logic", "math", "reading", "world"] as const;

export const subjectLabels: Record<Subject, LocalizedText> = {
  logic: { ru: "Логика", ky: "Логика" },
  math: { ru: "Математика", ky: "Математика" },
  reading: { ru: "Чтение", ky: "Окуу" },
  world: { ru: "Окружающий мир", ky: "Айлана-чөйрө" },
};

/**
 * Проверяет ответ ученика.
 * - single_choice: `response` — индекс выбранного варианта;
 * - number_input: введённое число;
 * - ordering: массив исходных индексов в порядке, выбранном учеником
 *   (верно, если совпадает с [0,1,…,n-1], т.к. items хранятся по порядку);
 * - match_pairs: массив, где по индексу левого элемента — исходный индекс
 *   выбранного правого (верно, если response[i] === i для всех i).
 */
export function checkAnswer(task: Task, response: number | number[]): boolean {
  switch (task.type) {
    case "single_choice":
      return response === task.correctIndex;
    case "number_input":
      return response === task.answer;
    case "ordering":
      return (
        Array.isArray(response) &&
        response.length === task.items.length &&
        response.every((v, i) => v === i)
      );
    case "match_pairs":
      return (
        Array.isArray(response) &&
        response.length === task.left.length &&
        response.every((v, i) => v === i)
      );
  }
}
