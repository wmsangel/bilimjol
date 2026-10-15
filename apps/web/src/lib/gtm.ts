// Отправка событий в dataLayer для Google Tag Manager.
// Безопасно к SSR (проверяем window). dataLayer инициализируется GTM-сниппетом,
// но на всякий случай гарантируем массив.

type DataLayerValue = string | number | boolean | null | undefined;

// Сетевое соглашение: у каждого кастомного события обязателен параметр `item`
// (строка) — «что именно» произошло (слаг темы/игры/теста/оффера). По нему
// центральная система сети строит разбивку «событие × item». Если item не задан
// явно, берём первичный идентификатор события из этих ключей (по приоритету).
const ITEM_FROM: readonly string[] = [
  "topic",
  "game",
  "test",
  "hero",
  "subject",
  "code",
  "source",
  "plan",
  "to",
  "grade",
];

export function pushEvent(
  event: string,
  params: Record<string, DataLayerValue> = {},
): void {
  if (typeof window === "undefined") return;
  const out: Record<string, DataLayerValue> = { ...params };
  if (out.item == null) {
    for (const key of ITEM_FROM) {
      if (params[key] != null) {
        out.item = String(params[key]);
        break;
      }
    }
  }
  const w = window as unknown as { dataLayer?: Record<string, unknown>[] };
  w.dataLayer = w.dataLayer || [];
  w.dataLayer.push({ event, ...out });
}

// ISO-4217 валюта по коду страны — для value/currency в Meta Pixel и GA4.
export function currencyIso(country: string): string {
  return country.toUpperCase() === "KG" ? "KGS" : "RUB";
}
