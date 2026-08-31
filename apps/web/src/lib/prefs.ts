// Пользовательские предпочтения без сервера (localStorage).

const HELPER_KEY = "izn.study:helper:v1";

export function loadHelperId(): string | null {
  if (typeof window === "undefined") return null;
  try {
    return window.localStorage.getItem(HELPER_KEY);
  } catch {
    return null;
  }
}

export function saveHelperId(id: string): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(HELPER_KEY, id);
  } catch {
    // игнорируем
  }
}

export function removeHelperId(): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.removeItem(HELPER_KEY);
  } catch {
    // игнорируем
  }
}

// Последний выбранный класс — для быстрого «Продолжить».
const GRADE_KEY = "izn.study:grade:v1";

export function loadLastGrade(): number | null {
  if (typeof window === "undefined") return null;
  try {
    const v = window.localStorage.getItem(GRADE_KEY);
    return v === null || v === "" ? null : Number(v);
  } catch {
    return null;
  }
}

export function saveLastGrade(g: number): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(GRADE_KEY, String(g));
  } catch {
    // игнорируем
  }
}
