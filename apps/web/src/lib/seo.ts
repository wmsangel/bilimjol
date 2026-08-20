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
