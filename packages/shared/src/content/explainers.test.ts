import { describe, expect, it } from "vitest";
import { getTopicExplainer } from "./explainers";
import { topics } from "./topics";

describe("getTopicExplainer", () => {
  it("есть для каждой темы классов 0–3", () => {
    const early = topics.filter((t) => t.grade >= 0 && t.grade <= 3);
    expect(early.length).toBeGreaterThan(0);
    expect(new Set(early.map((t) => t.grade))).toEqual(new Set([0, 1, 2, 3]));

    const holes = early
      .filter((t) => getTopicExplainer(t.id) === undefined)
      .map((t) => `${t.grade}:${t.id}`);
    expect(holes).toEqual([]);
  });
});
