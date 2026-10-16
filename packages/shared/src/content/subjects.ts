// «Свои предметы» старших классов (6–11). Фаза 1: структура + маппинг +
// SEO-лендинги «<предмет> N класс». Лендинги порождаются ТОЛЬКО там, где уже
// есть тема с заданиями (не плодим тонкие страницы под блокер индексации).
// Контент по остальным предметам — следующими фазами.

import type { Grade, LocalizedText, Subject } from "./types";
import { subjectLabels } from "./types";
import { topics } from "./topics";

/** Предметы-науки старших классов (в дополнение к базовым logic/math/reading/world). */
export const SENIOR_SUBJECTS = [
  "geography",
  "biology",
  "physics",
  "chemistry",
  "history",
] as const;

export type SeniorSubject = (typeof SENIOR_SUBJECTS)[number];

/** Транслит для URL: `<slug>-<grade>-klass`. Совпадает с поисковым спросом. */
export const subjectSlug: Record<SeniorSubject, string> = {
  geography: "geografiya",
  biology: "biologiya",
  physics: "fizika",
  chemistry: "himiya",
  history: "istoriya",
};

/**
 * Полный маппинг класс → предметы (кыргызская школьная программа).
 * Задел на будущее: показывает, какие предметы ДОЛЖНЫ появиться в каждом классе.
 * Фаза 1 реализует только те пары, где уже есть контент (см. subjectLandings).
 */
export const CURRICULUM: Partial<Record<Grade, Subject[]>> = {
  6: ["geography", "biology", "history"],
  7: ["geography", "biology", "physics", "history"],
  8: ["geography", "biology", "physics", "chemistry", "history"],
  9: ["geography", "biology", "physics", "chemistry", "history"],
  10: ["geography", "biology", "physics", "chemistry", "history"],
  11: ["geography", "biology", "physics", "chemistry", "history"],
};

export interface SubjectLanding {
  subject: Subject;
  grade: Grade;
  /** URL-сегмент: fizika-8-klass и т.п. */
  slug: string;
  /** Тема с заданиями, на которую опирается лендинг. */
  topicId: string;
  title: LocalizedText;
}

function isSenior(s: Subject): s is SeniorSubject {
  return (SENIOR_SUBJECTS as readonly Subject[]).includes(s);
}

/**
 * Лендинги «<предмет> N класс» — ОДИН на каждую пару предмет×класс, у которой
 * есть хотя бы одна тема с заданиями (у пары может быть несколько тем — лендинг
 * всё равно один). Заголовок — название предмета, а не темы. Порядок: по классу,
 * затем по предмету.
 */
export const subjectLandings: SubjectLanding[] = (() => {
  const seen = new Set<string>();
  return topics
    .filter((t) => isSenior(t.subject) && t.grade >= 6)
    .sort((a, b) => a.grade - b.grade || a.subject.localeCompare(b.subject))
    .filter((t) => {
      const key = `${t.subject}-${t.grade}`;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    })
    .map((t) => ({
      subject: t.subject,
      grade: t.grade,
      slug: `${subjectSlug[t.subject as SeniorSubject]}-${t.grade}-klass`,
      topicId: t.id,
      title: subjectLabels[t.subject],
    }));
})();

export function getSubjectLanding(slug: string): SubjectLanding | undefined {
  return subjectLandings.find((l) => l.slug === slug);
}
