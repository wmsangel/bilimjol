// Каноническая цена подписки — в USD: именно её списывает Paddle
// (см. apps/web/src/lib/paddle.ts, PADDLE_PLANS). Показывать нужно ровно это,
// иначе рассинхрон с чеком. Местные суммы ниже — ПРИБЛИЗИТЕЛЬНЫЕ ориентиры
// (курс плавает), поэтому всегда с пометкой «примерно».

export const PRICE = {
  monthly: { usd: 1.99, display: "$1.99" },
  annual: { usd: 15.99, display: "$15.99" },
} as const;

/**
 * Приблизительный местный эквивалент цены — чтобы доллар не пугал.
 * По умолчанию (и для гостя) — сомы (основная аудитория КГ); для страны RU — рубли.
 * Суммы округлены и всегда идут с пометкой «примерно» (курс плавает).
 * TODO: когда в Paddle заведём RUB-оверрайд — синхронизировать суммы.
 */
export function approxLocal(plan: "monthly" | "annual", country?: string | null): string {
  const rub = country?.toUpperCase() === "RU";
  if (plan === "annual") return rub ? "≈ 1500 ₽" : "≈ 1400 сом";
  return rub ? "≈ 190 ₽" : "≈ 175 сом";
}

/** Короткий алиас для месячной цены (лендинг). */
export function approxLocalMonthly(country?: string | null): string {
  return approxLocal("monthly", country);
}

/** Гостю страну не знаем — угадываем по языку интерфейса (ky → КГ). */
export function countryForLocale(locale: string): string {
  return locale === "ky" ? "KG" : "KG";
}
