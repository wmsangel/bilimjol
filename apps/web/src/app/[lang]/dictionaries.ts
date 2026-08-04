import "server-only";
import type { Locale } from "@/i18n/config";
import ru from "@/dictionaries/ru.json";

// Тип словаря выводим из русского словаря (эталон структуры).
export type Dictionary = typeof ru;

// Словари грузятся динамически и только на сервере — не попадают в клиентский бандл.
const dictionaries: Record<Locale, () => Promise<Dictionary>> = {
  ru: () => import("@/dictionaries/ru.json").then((m) => m.default),
  ky: () =>
    import("@/dictionaries/ky.json").then((m) => m.default as unknown as Dictionary),
};

export const getDictionary = (locale: Locale): Promise<Dictionary> =>
  dictionaries[locale]();
