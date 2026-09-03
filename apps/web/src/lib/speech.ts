// Озвучка заданий через Web Speech API (без внешних зависимостей).
// Особенно важно для младших (0 класс ещё не читает — нужно услышать и вопрос,
// и варианты ответа).

export function speechSupported(): boolean {
  return (
    typeof window !== "undefined" &&
    typeof window.speechSynthesis !== "undefined"
  );
}

/** Озвучить текст. Кыргызского голоса часто нет — падаем на ru. */
export function speak(text: string, locale: string): void {
  if (!speechSupported() || !text) return;
  try {
    const synth = window.speechSynthesis;
    synth.cancel();
    const u = new SpeechSynthesisUtterance(text);
    // ky-KG в системах почти не встречается → используем ru-RU как ближайший.
    u.lang = "ru-RU";
    void locale;
    u.rate = 0.95;
    u.pitch = 1.05;
    synth.speak(u);
  } catch {
    /* игнорируем */
  }
}

export function stopSpeaking(): void {
  if (speechSupported()) {
    try {
      window.speechSynthesis.cancel();
    } catch {
      /* игнорируем */
    }
  }
}
