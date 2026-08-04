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
