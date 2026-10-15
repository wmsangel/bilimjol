import { describe, expect, it } from "vitest";
import { articles } from "./articles";
import { careerQuestions, careerTypes } from "./career";
import type { CareerType, CareerTypeId } from "./career";
import { topicExplainers } from "./explainers";
import { tasks } from "./tasks";
import { GRADES, topics } from "./topics";
import { tests } from "./tests";
import type { LocalizedText, Subject } from "./types";

/** Subject из types.ts. Константа SUBJECTS олимпиаду не включает — тип включает. */
const SUBJECTS: readonly Subject[] = [
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

const RIASEC: readonly CareerTypeId[] = ["R", "I", "A", "S", "E", "C"];

const CAREER_TEXT_FIELDS = [
  "name",
  "holland",
  "tagline",
  "description",
  "strengths",
  "cautions",
  "professions",
  "directions",
  "universities",
  "subjects",
  "ortSubjects",
] as const satisfies readonly (keyof CareerType)[];

function holesOf(text: LocalizedText | undefined, where: string): string[] {
  const holes: string[] = [];
  if (typeof text?.ru !== "string" || text.ru.trim() === "") holes.push(`${where}.ru`);
  if (typeof text?.ky !== "string" || text.ky.trim() === "") holes.push(`${where}.ky`);
  return holes;
}

function duplicates(ids: string[]): string[] {
  const seen = new Set<string>();
  const dup = new Set<string>();
  for (const id of ids) {
    if (seen.has(id)) dup.add(id);
    seen.add(id);
  }
  return [...dup];
}

describe("двуязычный паритет", () => {
  it("у каждого LocalizedText в контенте есть непустые ru и ky", () => {
    const holes: string[] = [];

    for (const article of articles) {
      holes.push(...holesOf(article.title, `articles.${article.slug}.title`));
      holes.push(...holesOf(article.excerpt, `articles.${article.slug}.excerpt`));
      article.sections.forEach((section, s) => {
        holes.push(
          ...holesOf(section.heading, `articles.${article.slug}.sections[${s}].heading`),
        );
        section.body.forEach((paragraph, p) => {
          holes.push(
            ...holesOf(
              paragraph,
              `articles.${article.slug}.sections[${s}].body[${p}]`,
            ),
          );
        });
      });
      if (article.externalRef) {
        const ref = article.externalRef;
        holes.push(...holesOf(ref.before, `articles.${article.slug}.externalRef.before`));
        holes.push(...holesOf(ref.anchor, `articles.${article.slug}.externalRef.anchor`));
        holes.push(...holesOf(ref.after, `articles.${article.slug}.externalRef.after`));
      }
    }

    for (const topic of topics) {
      holes.push(...holesOf(topic.title, `topics.${topic.id}.title`));
    }

    for (const [id, explainer] of Object.entries(topicExplainers)) {
      holes.push(...holesOf(explainer.what, `explainers.${id}.what`));
      holes.push(...holesOf(explainer.how, `explainers.${id}.how`));
      holes.push(...holesOf(explainer.example, `explainers.${id}.example`));
    }

    for (const test of tests) {
      holes.push(...holesOf(test.title, `tests.${test.id}.title`));
      holes.push(...holesOf(test.description, `tests.${test.id}.description`));
    }

    for (const career of careerTypes) {
      for (const field of CAREER_TEXT_FIELDS) {
        holes.push(...holesOf(career[field], `careerTypes.${career.id}.${field}`));
      }
    }

    careerQuestions.forEach((question, i) => {
      holes.push(...holesOf(question.text, `careerQuestions[${i}].text`));
    });

    expect(holes).toEqual([]);
  });
});

describe("уникальность id и slug", () => {
  it("topic.id, test.id и article.slug не повторяются", () => {
    expect(duplicates(topics.map((topic) => topic.id))).toEqual([]);
    expect(duplicates(tests.map((test) => test.id))).toEqual([]);
    expect(duplicates(articles.map((article) => article.slug))).toEqual([]);
  });
});

describe("ссылочная целостность", () => {
  it("каждый ключ explainers — существующий topic.id", () => {
    const ids = new Set(topics.map((topic) => topic.id));
    const missing = Object.keys(topicExplainers).filter((id) => !ids.has(id));
    expect(missing).toEqual([]);
  });

  it("у каждого задания класс из GRADES и предмет из Subject", () => {
    const grades = new Set<number>(GRADES);
    const subjects = new Set<string>(SUBJECTS);
    const badGrade = tasks
      .filter((task) => !grades.has(task.grade))
      .map((task) => `${task.id}:grade=${task.grade}`);
    const badSubject = tasks
      .filter((task) => !subjects.has(task.subject))
      .map((task) => `${task.id}:subject=${task.subject}`);
    expect(badGrade).toEqual([]);
    expect(badSubject).toEqual([]);
  });
});

describe("careerQuestions", () => {
  it("ровно 48 вопросов, по 8 на каждый тип RIASEC", () => {
    expect(careerQuestions).toHaveLength(48);
    for (const type of RIASEC) {
      expect(careerQuestions.filter((question) => question.type === type)).toHaveLength(8);
    }
  });
});
