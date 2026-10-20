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

function withItem(
  params: Record<string, DataLayerValue>,
): Record<string, DataLayerValue> {
  const out: Record<string, DataLayerValue> = { ...params };
  if (out.item == null) {
    for (const key of ITEM_FROM) {
      if (params[key] != null) {
        out.item = String(params[key]);
        break;
      }
    }
  }
  return out;
}

export function pushEvent(
  event: string,
  params: Record<string, DataLayerValue> = {},
): void {
  if (typeof window === "undefined") return;
  const w = window as unknown as { dataLayer?: Record<string, unknown>[] };
  w.dataLayer = w.dataLayer || [];
  w.dataLayer.push({ event, ...withItem(params) });
}

// Отправка события НАПРЯМУЮ в GA4 через gtag. Нужна для событий, у которых нет
// отдельного тега в GTM-контейнере (grade_open, subject_open): `dataLayer.push(
// {event})` для них GTM в GA4 не форвардит. gtag('event', …) GA4-тег обрабатывает
// сам. ВАЖНО: НЕ заводить в GTM отдельный GA4-тег на эти события — будет дубль.
export function sendGa4Event(
  event: string,
  params: Record<string, DataLayerValue> = {},
): void {
  if (typeof window === "undefined") return;
  const w = window as unknown as { gtag?: (...a: unknown[]) => void };
  if (typeof w.gtag !== "function") return;
  w.gtag("event", event, withItem(params));
}

// ISO-4217 валюта по коду страны — для value/currency в Meta Pixel и GA4.
export function currencyIso(country: string): string {
  return country.toUpperCase() === "KG" ? "KGS" : "RUB";
}
