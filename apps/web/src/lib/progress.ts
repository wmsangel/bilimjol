// Локальное сохранение прогресса (без сервера).
// Позже заменится/дополнится синхронизацией с backend.

const STORAGE_KEY = "izn.study:progress:v1";

export type TaskResult = { correct: boolean };
export type ProgressMap = Record<string, TaskResult>;

export function loadProgress(): ProgressMap {
  if (typeof window === "undefined") return {};
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as ProgressMap) : {};
  } catch {
    return {};
  }
}

export function saveProgress(map: ProgressMap): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(map));
  } catch {
    // приватный режим / переполнение — просто игнорируем
  }
}
