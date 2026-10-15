import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { pushEvent } from "./gtm";

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
