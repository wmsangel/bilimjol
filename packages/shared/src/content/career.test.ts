import { describe, expect, it } from "vitest";
import {
  CAREER_MAX_PER_TYPE,
  CAREER_SCALE_MAX,
  careerQuestions,
  scoreCareer,
  topCareerTypes,
} from "./career";
import type { CareerTypeId } from "./career";

const RIASEC: CareerTypeId[] = ["R", "I", "A", "S", "E", "C"];

describe("scoreCareer", () => {
  it("суммирует баллы известного вектора ответов по типам вопросов", () => {
    // 8 блоков R,I,A,S,E,C — тот же порядок, что у careerQuestions.
    expect(careerQuestions.map((q) => q.type)).toEqual(
      Array.from({ length: 8 }, () => RIASEC).flat(),
    );

    // На каждый блок: R=4, I=1, A=2, S=0, E=3, C=4. Восемь блоков.
    const block = [4, 1, 2, 0, 3, 4];
    const answers = Array.from({ length: 8 }, () => block).flat();
    expect(answers).toHaveLength(careerQuestions.length);

    expect(scoreCareer(answers)).toEqual({
      R: 32,
      I: 8,
      A: 16,
      S: 0,
      E: 24,
      C: 32,
    });
  });
});

describe("topCareerTypes", () => {
  it("берёт топ-N и при равенстве баллов сохраняет канонический порядок RIASEC", () => {
    expect(topCareerTypes(careerQuestions.map(() => 0))).toEqual(["R", "I", "A"]);
    expect(topCareerTypes(careerQuestions.map(() => 2), 6)).toEqual(RIASEC);

    // R и C вровень на максимуме, остальные нули: R раньше C, затем I.
    const rTiedWithC = careerQuestions.map((q) =>
      q.type === "R" || q.type === "C" ? 4 : 0,
    );
    expect(topCareerTypes(rTiedWithC)).toEqual(["R", "C", "I"]);

    // E лидирует; A и S равны — A раньше S.
    const aTiedWithS = careerQuestions.map((q) => {
      if (q.type === "E") return 4;
      if (q.type === "A" || q.type === "S") return 3;
      return 0;
    });
    expect(topCareerTypes(aTiedWithS)).toEqual(["E", "A", "S"]);
    expect(topCareerTypes(aTiedWithS, 2)).toEqual(["E", "A"]);
  });
});

describe("CAREER_MAX_PER_TYPE", () => {
  it("равен 8 вопросам × максимум шкалы 4", () => {
    expect(CAREER_SCALE_MAX).toBe(4);
    expect(CAREER_MAX_PER_TYPE).toBe(8 * 4);
    expect(CAREER_MAX_PER_TYPE).toBe(8 * CAREER_SCALE_MAX);

    const counts: Record<CareerTypeId, number> = { R: 0, I: 0, A: 0, S: 0, E: 0, C: 0 };
    for (const q of careerQuestions) counts[q.type] += 1;
    for (const id of RIASEC) {
      expect(counts[id], id).toBe(8);
      expect(counts[id] * CAREER_SCALE_MAX, id).toBe(CAREER_MAX_PER_TYPE);
    }

    const maxed = scoreCareer(careerQuestions.map(() => CAREER_SCALE_MAX));
    for (const id of RIASEC) {
      expect(maxed[id], id).toBe(CAREER_MAX_PER_TYPE);
    }
  });
});
