// Цена подписки по стране пользователя. Числа — плейсхолдеры, легко поменять.
// Определяем страну из профиля (user.country), для гостя — по языку.

export interface PlanPrice {
  amount: number;
  /** Символ/слово валюты после суммы: "199 сом", "199 ₽". */
  currency: string;
}

export const PLAN_PRICES: Record<string, PlanPrice> = {
  KG: { amount: 199, currency: "сом" },
  RU: { amount: 199, currency: "₽" },
};

const DEFAULT_PRICE = PLAN_PRICES.KG;

/** Цена по коду страны (ISO-2). Неизвестная страна → цена по умолчанию (КР). */
export function priceForCountry(country?: string | null): PlanPrice {
  if (!country) return DEFAULT_PRICE;
  return PLAN_PRICES[country.toUpperCase()] ?? DEFAULT_PRICE;
}

/** Гостю страну не знаем — угадываем по языку интерфейса. */
export function countryForLocale(locale: string): string {
  return locale === "ky" ? "KG" : "RU";
}

export function formatPrice(p: PlanPrice): string {
  return `${p.amount} ${p.currency}`;
}
