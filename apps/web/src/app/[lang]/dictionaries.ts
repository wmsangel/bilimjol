import "server-only";
import type { Locale } from "@/i18n/config";

// Словари грузятся динамически и только на сервере — не попадают в клиентский бандл.
const dictionaries = {
  ru: () => import("@/dictionaries/ru.json").then((m) => m.default),
  ky: () => import("@/dictionaries/ky.json").then((m) => m.default),
} satisfies Record<Locale, () => Promise<unknown>>;

export const getDictionary = (locale: Locale) => dictionaries[locale]();

export type Dictionary = Awaited<ReturnType<typeof getDictionary>>;
