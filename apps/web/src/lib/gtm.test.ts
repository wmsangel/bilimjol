import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { pushEvent, sendGa4Event } from "./gtm";

// Сетевое соглашение: у каждого кастомного события должен быть параметр `item`.
describe("pushEvent · item", () => {
  beforeEach(() => {
    (globalThis as unknown as { window?: unknown }).window = globalThis;
    (globalThis as unknown as { dataLayer?: unknown[] }).dataLayer = [];
  });
  afterEach(() => {
    delete (globalThis as unknown as { window?: unknown }).window;
    delete (globalThis as unknown as { dataLayer?: unknown[] }).dataLayer;
  });

  const last = () => {
    const dl = (globalThis as unknown as { dataLayer: Record<string, unknown>[] }).dataLayer;
    return dl[dl.length - 1];
  };

  it("берёт первичный id как item (topic → игра → тест → …)", () => {
    pushEvent("topic_start", { grade: 5, subject: "math", topic: "m5-percent" });
    expect(last().item).toBe("m5-percent");

    pushEvent("game_open", { game: "sprint", lang: "ru" });
    expect(last().item).toBe("sprint");

    pushEvent("grade_select", { grade: 7, lang: "ky" });
    expect(last().item).toBe("7");

    pushEvent("lang_switch", { to: "ky" });
    expect(last().item).toBe("ky");
  });

  it("не перетирает явно заданный item", () => {
    pushEvent("outfit_equip", { item: "kalpak", slot: "hat", topic: "x" });
    expect(last().item).toBe("kalpak");

    pushEvent("career_start", { item: "career" });
    expect(last().item).toBe("career");
  });

  it("сохраняет имя события и остальные параметры", () => {
    pushEvent("task_answer", { correct: true, topic: "add", grade: 1 });
    const e = last();
    expect(e.event).toBe("task_answer");
    expect(e.correct).toBe(true);
    expect(e.grade).toBe(1);
    expect(e.item).toBe("add");
  });
});

// Прямая отправка в GA4 через window.gtag. gtag подключается afterInteractive,
// поэтому на момент первого useEffect его может ещё не быть — тогда ждём его
// появления (иначе событие встанет в очередь раньше gtag('config') и отбросится).
describe("sendGa4Event · прямой вызов gtag", () => {
  type GtagArgs = [string, string, Record<string, unknown>];
  const calls: GtagArgs[] = [];
  beforeEach(() => {
    calls.length = 0;
    (globalThis as unknown as { window?: unknown }).window = globalThis;
  });
  afterEach(() => {
    delete (globalThis as unknown as { window?: unknown }).window;
    delete (globalThis as unknown as { gtag?: unknown }).gtag;
    vi.useRealTimers();
  });

  const setGtag = () => {
    (globalThis as unknown as { gtag: (...a: unknown[]) => void }).gtag = (
      ...a: unknown[]
    ) => {
      calls.push(a as GtagArgs);
    };
  };

  it("шлёт событие сразу, если window.gtag уже готов (+ item из grade)", () => {
    setGtag();
    sendGa4Event("grade_open", { grade: 9, placement: "menu", lang: "ru" });
    expect(calls).toHaveLength(1);
    expect(calls[0][0]).toBe("event");
    expect(calls[0][1]).toBe("grade_open");
    expect(calls[0][2].grade).toBe(9);
    expect(calls[0][2].placement).toBe("menu");
    expect(calls[0][2].item).toBe("9"); // то же правило, что в pushEvent
  });

  it("ждёт появления window.gtag и шлёт после него", () => {
    vi.useFakeTimers();
    sendGa4Event("subject_open", { grade: 7, subject: "math", lang: "ky" });
    expect(calls).toHaveLength(0); // gtag ещё нет — ничего не ушло
    vi.advanceTimersByTime(600);
    expect(calls).toHaveLength(0); // всё ещё ждём
    setGtag();
    vi.advanceTimersByTime(200);
    expect(calls).toHaveLength(1);
    expect(calls[0][1]).toBe("subject_open");
    expect(calls[0][2].subject).toBe("math");
  });
});
