import type { Metadata } from "next";
import type { Locale } from "@/i18n/config";

const SITE = process.env.NEXT_PUBLIC_SITE_URL ?? "https://bilimjol.com";

/**
 * canonical + hreflang для локализованной страницы.
 * Убирает «страница является копией, канонический вариант не выбран»:
 * Google понимает, что ru/ky — языковые версии одной страницы, а не дубли.
 * @param path путь без языкового префикса, напр. "" (главная) или "/play".
 */
export function localizedAlternates(
  lang: Locale,
  path = "",
): Metadata["alternates"] {
  return {
    canonical: `${SITE}/${lang}${path}`,
    languages: {
      ru: `${SITE}/ru${path}`,
      ky: `${SITE}/ky${path}`,
      "x-default": `${SITE}/ru${path}`,
    },
  };
}

/** BreadcrumbList JSON-LD. `items`: [name, path-without-locale] in order. */
export function breadcrumbJsonLd(
  lang: Locale,
  items: [name: string, path: string][],
): Record<string, unknown> {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map(([name, path], i) => ({
      "@type": "ListItem",
      position: i + 1,
      name,
      item: `${SITE}/${lang}${path}`,
    })),
  };
}

/** FAQPage JSON-LD from question/answer pairs. */
export function faqJsonLd(
  items: { q: string; a: string }[],
): Record<string, unknown> {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: items.map((it) => ({
      "@type": "Question",
      name: it.q,
      acceptedAnswer: { "@type": "Answer", text: it.a },
    })),
  };
}
