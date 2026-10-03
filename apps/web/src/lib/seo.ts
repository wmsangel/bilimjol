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

/** ItemList JSON-LD для списочных страниц (статьи, тесты, игры, классы). */
export function itemListJsonLd(
  lang: Locale,
  items: [name: string, path: string][],
): Record<string, unknown> {
  return {
    "@context": "https://schema.org",
    "@type": "ItemList",
    itemListElement: items.map(([name, path], i) => ({
      "@type": "ListItem",
      position: i + 1,
      name,
      url: `${SITE}/${lang}${path}`,
    })),
  };
}

/** Course JSON-LD для страницы класса (образовательная разметка). */
export function courseJsonLd(
  lang: Locale,
  opts: { name: string; description: string; path: string; level: string },
): Record<string, unknown> {
  return {
    "@context": "https://schema.org",
    "@type": "Course",
    name: opts.name,
    description: opts.description,
    url: `${SITE}/${lang}${opts.path}`,
    inLanguage: lang,
    educationalLevel: opts.level,
    isAccessibleForFree: true,
    provider: {
      "@type": "EducationalOrganization",
      "@id": `${SITE}/#org`,
      name: "Bilimjol",
    },
    hasCourseInstance: {
      "@type": "CourseInstance",
      courseMode: "online",
      courseWorkload: "PT15M",
      inLanguage: lang,
    },
    offers: [
      { "@type": "Offer", category: "Free", price: "0", priceCurrency: "USD", availability: "https://schema.org/InStock" },
      { "@type": "Offer", category: "Premium", price: "1.99", priceCurrency: "USD", availability: "https://schema.org/InStock" },
    ],
  };
}

/** Product JSON-LD для премиум-подписки (страница /subscribe). */
export function productJsonLd(
  lang: Locale,
  opts: { name: string; description: string },
): Record<string, unknown> {
  const sub = `${SITE}/${lang}/subscribe`;
  return {
    "@context": "https://schema.org",
    "@type": "Product",
    name: opts.name,
    description: opts.description,
    brand: { "@type": "Brand", name: "Bilimjol" },
    offers: [
      { "@type": "Offer", name: lang === "ky" ? "Айлык" : "Месяц", price: "1.99", priceCurrency: "USD", availability: "https://schema.org/InStock", url: sub },
      { "@type": "Offer", name: lang === "ky" ? "Жылдык" : "Год", price: "15.99", priceCurrency: "USD", availability: "https://schema.org/InStock", url: sub },
    ],
  };
}
