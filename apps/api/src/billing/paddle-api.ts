// Серверный клиент Paddle Billing API (история/отмена/смена карты в кабинете).
// Включается ОДНОЙ переменной PADDLE_API_KEY: без неё управление подпиской в
// кабинете выключено (раздел показывает только статус и дату). База по умолчанию
// — live (api.paddle.com); для sandbox задать PADDLE_API_BASE=https://api.sandbox.paddle.com.

const API_BASE = (
  process.env.PADDLE_API_BASE ?? "https://api.paddle.com"
).replace(/\/$/, "");

function apiKey(): string {
  return process.env.PADDLE_API_KEY?.trim() ?? "";
}

/** true, если серверный Paddle API-ключ задан — тогда доступны история/отмена/карта. */
export function paddleConfigured(): boolean {
  return apiKey().length > 0;
}

async function paddleFetch(
  path: string,
  init?: { method?: string; body?: unknown },
): Promise<unknown> {
  const key = apiKey();
  if (!key) throw new Error("PADDLE_API_KEY не задан");
  const res = await fetch(`${API_BASE}${path}`, {
    method: init?.method ?? "GET",
    headers: {
      Authorization: `Bearer ${key}`,
      ...(init?.body ? { "Content-Type": "application/json" } : {}),
    },
    ...(init?.body ? { body: JSON.stringify(init.body) } : {}),
  });
  const text = await res.text();
  let json: unknown = null;
  try {
    json = text ? JSON.parse(text) : null;
  } catch {
    /* не-JSON ответ оставляем null */
  }
  if (!res.ok) {
    // В лог (сервер) кладём статус и тело — чтобы диагностировать причину
    // (403 = нет прав у ключа, 404 = не та среда/подписка, 400 = статус/payload).
    console.error(
      `[paddle] ${init?.method ?? "GET"} ${path} → ${res.status}: ${text.slice(0, 400)}`,
    );
    // Наружу тело не тащим — оно может содержать служебные детали.
    throw new Error(`Paddle API ${res.status} на ${path}`);
  }
  return json;
}

export interface PaddleTransaction {
  id: string;
  date: string | null;
  status: string;
  amount: string | null; // grand total, строкой из Paddle (в минимальных единицах)
  currency: string | null;
}

/** Список транзакций по конкретной подписке (история списаний). Read-only. */
export async function listTransactions(
  subscriptionId: string,
): Promise<PaddleTransaction[]> {
  const q = new URLSearchParams({
    subscription_id: subscriptionId,
    per_page: "30",
    order_by: "billed_at[DESC]",
  });
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const res = (await paddleFetch(`/transactions?${q.toString()}`)) as any;
  const data: any[] = Array.isArray(res?.data) ? res.data : [];
  return data.map((tx) => ({
    id: String(tx.id ?? ""),
    date: tx.billed_at ?? tx.created_at ?? null,
    status: String(tx.status ?? ""),
    amount: tx.details?.totals?.grand_total ?? null,
    currency: tx.details?.totals?.currency_code ?? tx.currency_code ?? null,
  }));
}

/** Отмена подписки в конце оплаченного периода (доступ доживает до currentPeriodEnd). */
export async function cancelSubscription(subscriptionId: string): Promise<void> {
  await paddleFetch(`/subscriptions/${subscriptionId}/cancel`, {
    method: "POST",
    body: { effective_from: "next_billing_period" },
  });
}

/**
 * Транзакция для смены способа оплаты. Возвращает transactionId, который веб
 * открывает в Paddle.js (Checkout.open({ transactionId })) — там покупатель
 * вводит новую карту. Деньги не списываются.
 */
export async function updatePaymentMethodTransaction(
  subscriptionId: string,
): Promise<string> {
  // Paddle: этот эндпоинт — GET (возвращает готовую транзакцию для смены карты),
  // а не POST. POST отдавал 405 method_not_allowed.
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const res = (await paddleFetch(
    `/subscriptions/${subscriptionId}/update-payment-method-transaction`,
  )) as any;
  const id = res?.data?.id;
  if (!id) throw new Error("Paddle не вернул transaction id");
  return String(id);
}
