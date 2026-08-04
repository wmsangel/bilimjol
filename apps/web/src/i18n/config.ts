// Единый источник правды по локалям — используется и в proxy, и в словарях.
export const locales = ["ru", "ky"] as const;

export type Locale = (typeof locales)[number];

export const defaultLocale: Locale = "ru";

export function isLocale(value: string): value is Locale {
  return (locales as readonly string[]).includes(value);
}

// Человекочитаемые названия для переключателя языка.
export const localeNames: Record<Locale, string> = {
  ru: "Русский",
  ky: "Кыргызча",
};
