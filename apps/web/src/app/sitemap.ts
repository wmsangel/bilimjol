import type { MetadataRoute } from "next";
import { articles, tests, GRADES } from "@izn-study/shared";
import { locales } from "@/i18n/config";

const BASE = process.env.NEXT_PUBLIC_SITE_URL ?? "https://bilimjol.com";

// hreflang-альтернаты: каждая запись объявляет свои ru/ky-двойники, чтобы Google
// обнаруживал KY-страницы через RU (и понимал, что это переводы, а не дубли).
function alts(path: string): { languages: Record<string, string> } {
  return {
    languages: {
      ru: `${BASE}/ru${path}`,
      ky: `${BASE}/ky${path}`,
      "x-default": `${BASE}/ru${path}`,
    },
  };
}

export default function sitemap(): MetadataRoute.Sitemap {
  const publicRoutes = ["", "/play", "/games", "/games/memory", "/games/build", "/games/sprint", "/games/bubbles", "/games/trace", "/games/pattern", "/games/word", "/games/groups", "/games/clock", "/games/compare", "/games/shadow", "/gotovnost-k-shkole", "/roditelyam", "/class", "/articles", "/tests", "/subscribe", "/about", "/privacy", "/terms"];
  const entries: MetadataRoute.Sitemap = [];

  for (const lang of locales) {
    for (const route of publicRoutes) {
      entries.push({
        url: `${BASE}/${lang}${route}`,
        changeFrequency: "weekly",
        priority: route === "" ? 1 : 0.7,
        alternates: alts(route),
      });
    }
    for (const article of articles) {
      const path = `/articles/${article.slug}`;
      entries.push({
        url: `${BASE}/${lang}${path}`,
        lastModified: new Date(article.updated ?? article.date),
        changeFrequency: "monthly",
        priority: 0.5,
        alternates: alts(path),
      });
    }
    for (const test of tests) {
      const path = `/tests/${test.id}`;
      entries.push({
        url: `${BASE}/${lang}${path}`,
        changeFrequency: "monthly",
        priority: 0.6,
        alternates: alts(path),
      });
    }
    for (const g of GRADES) {
      const path = `/class/${g}`;
      entries.push({
        url: `${BASE}/${lang}${path}`,
        changeFrequency: "monthly",
        priority: 0.7,
        alternates: alts(path),
      });
    }
  }

  return entries;
}
