import { describe, expect, it } from "vitest";
import { tests } from "./tests";

describe("tests.generate", () => {
  it("каждый generate() возвращает ровно test.count вопросов", () => {
    for (const test of tests) {
      for (let run = 0; run < 8; run++) {
        const questions = test.generate();
        expect(questions, `${test.id} run ${run}`).toHaveLength(test.count);
      }
    }
  });

  it("у single_choice correctIndex лежит в диапазоне вариантов", () => {
    for (const test of tests) {
      for (let run = 0; run < 8; run++) {
        for (const task of test.generate()) {
          if (task.type !== "single_choice") continue;
          expect(task.options.length, `${test.id} ${task.id}`).toBeGreaterThan(0);
          expect(task.correctIndex, `${test.id} ${task.id}`).toBeGreaterThanOrEqual(0);
          expect(task.correctIndex, `${test.id} ${task.id}`).toBeLessThan(task.options.length);
        }
      }
    }
  });

  it("пробный ОРТ — ortTrial(6, 5, 4) — это 15 заданий", () => {
    // ortTrial не экспортируется; публичная точка — tests[id=ort],
    // generate: () => ortTrial(6, 5, 4), count: 15.
    const ort = tests.find((t) => t.id === "ort");
    expect(ort).toBeDefined();
    expect(ort!.count).toBe(15);
    expect(ort!.generate()).toHaveLength(15);
  });
});
