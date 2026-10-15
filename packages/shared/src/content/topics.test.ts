import { describe, expect, it } from "vitest";
import {
  GRADES,
  getProgramTopics,
  getTopics,
  subjectsForGrade,
  topics,
} from "./topics";
import type { Grade, Subject } from "./types";

/** Фиксированный порядок предметов в UI — контракт subjectsForGrade / программы.
 *  Должен совпадать с SUBJECT_ORDER в topics.ts. */
const SUBJECT_ORDER: Subject[] = [
  "logic",
  "math",
  "reading",
  "world",
  "geography",
  "biology",
  "physics",
  "chemistry",
  "history",
  "olympiad",
];

describe("getTopics", () => {
  it("фильтрует по subject и grade и сортирует по order", () => {
    const mathGrade1 = getTopics({ subject: "math", grade: 1 });
    expect(mathGrade1.map((t) => t.id)).toEqual([
      "math-count",
      "math-add",
      "math-ten",
      "math-compare",
    ]);
    expect(mathGrade1.map((t) => t.order)).toEqual([3, 4, 6, 7]);
    expect(mathGrade1.every((t) => t.subject === "math" && t.grade === 1)).toBe(true);

    // grade: 0 не должен отбрасываться как falsy
    const prep = getTopics({ grade: 0 });
    expect(prep.every((t) => t.grade === 0)).toBe(true);
    expect(prep.map((t) => t.id)).toEqual([
      "pre-count",
      "pre-more",
      "pre-odd",
      "pre-shapes",
      "pre-letters",
      "pre-seq",
      "pre-big",
      "pre-world",
      "oly-0",
    ]);

    const math = getTopics({ subject: "math" });
    expect(math.every((t) => t.subject === "math")).toBe(true);
    for (let i = 1; i < math.length; i++) {
      expect(math[i]!.order).toBeGreaterThanOrEqual(math[i - 1]!.order);
    }
    // В исходном массиве pre-more (order 2) стоит раньше m3-mult (order 1).
    // Сортировка обязана переставить их.
    const mathIds = math.map((t) => t.id);
    expect(mathIds.indexOf("m3-mult")).toBeLessThan(mathIds.indexOf("pre-more"));
  });

  it("без фильтра отдаёт все темы, отсортированные по order", () => {
    const all = getTopics();
    expect(all).toHaveLength(topics.length);
    for (let i = 1; i < all.length; i++) {
      expect(all[i]!.order).toBeGreaterThanOrEqual(all[i - 1]!.order);
    }
    expect(all.filter((t) => t.order === 1).map((t) => t.id)).toEqual([
      "pre-count",
      "log-odd",
      "log-think",
      "m3-mult",
      "m4-mult",
      "m5-percent",
      "m6-neg",
      "m7-pow",
      "m8-sqrt",
      "m9-prog",
      "m10-calc",
      "m11-calc",
    ]);
  });
});

describe("subjectsForGrade", () => {
  it("возвращает только присутствующие предметы в фиксированном порядке", () => {
    // У класса 0 первая тема в массиве — математика, но UI-порядок начинается с логики.
    expect(subjectsForGrade(0)).toEqual([
      "logic",
      "math",
      "reading",
      "world",
      "olympiad",
    ]);

    for (const grade of GRADES) {
      const present = new Set(
        topics.filter((t) => t.grade === grade).map((t) => t.subject),
      );
      const got = subjectsForGrade(grade);
      expect(got).toEqual(SUBJECT_ORDER.filter((s) => present.has(s)));
      expect(new Set(got).size).toBe(got.length);
    }
  });
});

/**
 * Независимая сборка «общей программы»: внутри предмета по order,
 * предметы — round-robin в SUBJECT_ORDER, олимпиада суффиксом.
 */
function expectedProgramIds(grade: Grade): string[] {
  const all = topics
    .filter((t) => t.grade === grade)
    .slice()
    .sort((a, b) => a.order - b.order);
  const olympiad = all.filter((t) => t.subject === "olympiad");
  const rest = all.filter((t) => t.subject !== "olympiad");
  const queues = SUBJECT_ORDER.filter((s) => s !== "olympiad")
    .map((s) => rest.filter((t) => t.subject === s))
    .filter((q) => q.length > 0)
    .map((q) => [...q]);

  const mixed: typeof rest = [];
  let added = true;
  while (added) {
    added = false;
    for (const q of queues) {
      const t = q.shift();
      if (t) {
        mixed.push(t);
        added = true;
      }
    }
  }
  return [...mixed, ...olympiad].map((t) => t.id);
}

describe("getProgramTopics", () => {
  it("кладёт олимпиаду в конец и мешает предметы round-robin", () => {
    expect(getProgramTopics(0).map((t) => t.id)).toEqual([
      "pre-odd",
      "pre-count",
      "pre-letters",
      "pre-world",
      "pre-shapes",
      "pre-more",
      "pre-seq",
      "pre-big",
      "oly-0",
    ]);
    expect(getProgramTopics(1).map((t) => t.id)).toEqual([
      "log-odd",
      "math-count",
      "read-letters",
      "world1",
      "log-seq",
      "math-add",
      "read-vowels",
      "math-ten",
      "math-compare",
      "oly-1",
    ]);
    expect(getProgramTopics(3).map((t) => t.id)).toEqual([
      "log3",
      "m3-mult",
      "read3",
      "world3",
      "m3-div",
      "m3-big",
      "oly-3",
    ]);

    for (const grade of GRADES) {
      const program = getProgramTopics(grade);
      expect(program.map((t) => t.id)).toEqual(expectedProgramIds(grade));

      const splitAt = program.findIndex((t) => t.subject === "olympiad");
      const head = splitAt === -1 ? program : program.slice(0, splitAt);
      const tail = splitAt === -1 ? [] : program.slice(splitAt);
      expect(head.every((t) => t.subject !== "olympiad")).toBe(true);
      expect(tail.every((t) => t.subject === "olympiad")).toBe(true);
      expect(tail.length).toBeGreaterThan(0);
    }
  });
});
