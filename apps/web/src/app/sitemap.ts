import type { MetadataRoute } from "next";
import { articles, tests } from "@izn-study/shared";
import { locales } from "@/i18n/config";

const BASE = process.env.NEXT_PUBLIC_SITE_URL ?? "https://bilimjol.com";

export default function sitemap(): MetadataRoute.Sitemap {
  const publicRoutes = ["", "/play", "/games", "/games/memory", "/games/build", "/games/sprint", "/games/bubbles", "/games/trace", "/gotovnost-k-shkole", "/roditelyam", "/articles", "/tests", "/subscribe", "/about", "/privacy", "/terms"];
  const entries: MetadataRoute.Sitemap = [];

  for (const lang of locales) {
    for (const route of publicRoutes) {
      entries.push({
        url: `${BASE}/${lang}${route}`,
        changeFrequency: "weekly",
        priority: route === "" ? 1 : 0.7,
      });
    }
    for (const article of articles) {
      entries.push({
        url: `${BASE}/${lang}/articles/${article.slug}`,
        lastModified: new Date(article.date),
        changeFrequency: "monthly",
        priority: 0.5,
      });
    }
    for (const test of tests) {
      entries.push({
        url: `${BASE}/${lang}/tests/${test.id}`,
        changeFrequency: "monthly",
        priority: 0.6,
      });
    }
  }

  return entries;
}
