// Отправка событий в dataLayer для Google Tag Manager.
// Безопасно к SSR (проверяем window). dataLayer инициализируется GTM-сниппетом,
// но на всякий случай гарантируем массив.

type DataLayerValue = string | number | boolean | null | undefined;

export function pushEvent(
  event: string,
  params: Record<string, DataLayerValue> = {},
): void {
  if (typeof window === "undefined") return;
  const w = window as unknown as { dataLayer?: Record<string, unknown>[] };
  w.dataLayer = w.dataLayer || [];
  w.dataLayer.push({ event, ...params });
}

// ISO-4217 валюта по коду страны — для value/currency в Meta Pixel и GA4.
export function currencyIso(country: string): string {
  return country.toUpperCase() === "KG" ? "KGS" : "RUB";
}
