// Модель учебного контента. Общая для веба, API и будущих мобильных приложений.

export type Locale = "ru" | "ky";

export type Subject = "logic" | "math";

/** Уровень сложности: 1 — лёгкий, 2 — средний, 3 — сложный. */
export type Difficulty = 1 | 2 | 3;

/** Класс. В MVP — только 1 и 2. */
export type Grade = 1 | 2;

/** Строка, переведённая на все поддерживаемые языки. */
export type LocalizedText = Record<Locale, string>;

interface TaskBase {
  id: string;
  subject: Subject;
  grade: Grade;
  difficulty: Difficulty;
  /** Условие задачи. */
  prompt: LocalizedText;
  /** Разбор — показывается после ответа. */
  explanation: LocalizedText;
  /** Доступно ли задание в бесплатной версии. */
  free: boolean;
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

export type Task = SingleChoiceTask | NumberInputTask;

export type TaskType = Task["type"];

export const SUBJECTS: readonly Subject[] = ["logic", "math"] as const;

export const subjectLabels: Record<Subject, LocalizedText> = {
  logic: { ru: "Логика", ky: "Логика" },
  math: { ru: "Математика", ky: "Математика" },
};

/**
 * Проверяет ответ ученика.
 * Для single_choice `response` — индекс выбранного варианта,
 * для number_input — введённое число.
 */
export function checkAnswer(task: Task, response: number): boolean {
  return task.type === "single_choice"
    ? response === task.correctIndex
    : response === task.answer;
}
