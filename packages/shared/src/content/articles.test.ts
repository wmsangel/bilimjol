import { describe, expect, it } from "vitest";
import { articles, getRelatedArticles } from "./articles";

describe("getRelatedArticles", () => {
  it("возвращает ровно 3 другие статьи и не оставляет сирот", () => {
    const incoming = new Map<string, number>(articles.map((a) => [a.slug, 0]));

    for (const article of articles) {
      const related = getRelatedArticles(article.slug);
      const slugs = related.map((a) => a.slug);

      expect(related, article.slug).toHaveLength(3);
      expect(slugs, article.slug).not.toContain(article.slug);
      expect(new Set(slugs).size, article.slug).toBe(3);

      for (const slug of slugs) {
        incoming.set(slug, (incoming.get(slug) ?? 0) + 1);
      }
    }

    const orphans = [...incoming.entries()]
      .filter(([, n]) => n === 0)
      .map(([slug]) => slug);
    expect(orphans).toEqual([]);
  });
});
