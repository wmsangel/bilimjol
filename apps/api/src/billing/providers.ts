// Абстракция платёжного провайдера. Реальные (FreedomPay/Paybox) подключим
// с боевыми ключами; dev — мгновенная активация для локальной проверки.

export interface CheckoutContext {
  userId: string;
  plan: string;
}

export interface CheckoutResult {
  /** Если задано — подписка активируется сразу (dev/успешная оплата). */
  activatedUntil?: Date;
  /** Иначе — ссылка на оплату у провайдера (pending). */
  redirectUrl?: string;
  externalId?: string;
}

export interface PaymentProvider {
  readonly id: string;
  createCheckout(ctx: CheckoutContext): Promise<CheckoutResult>;
}

/** Dev-провайдер: сразу активирует подписку (без реальной оплаты). */
class DevProvider implements PaymentProvider {
  readonly id = "dev";
  async createCheckout(): Promise<CheckoutResult> {
    return {
      activatedUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      externalId: `dev_${Date.now()}`,
    };
  }
}

/**
 * FreedomPay (ex-PayBox) — КР-провайдер. Готов к подключению: задать ключи в env
 * (FREEDOMPAY_MERCHANT_ID, FREEDOMPAY_SECRET, FREEDOMPAY_TESTING) и дореализовать
 * HTTP-вызов по актуальному merchant-мануалу FreedomPay.
 *
 * ЧЕРТЁЖ ИНТЕГРАЦИИ (схема PayBox pg_*):
 *  1) createCheckout: POST на init-URL (напр. https://api.freedompay.kg/init_payment.php)
 *     с параметрами: pg_merchant_id, pg_amount, pg_currency=KGS, pg_description,
 *     pg_order_id (наш subscriptionId/paymentId), pg_salt (случайная строка),
 *     pg_result_url (наш webhook), pg_success_url, pg_failure_url, pg_testing_mode,
 *     pg_sig (подпись). Ответ — XML с pg_redirect_url → возвращаем как redirectUrl.
 *  2) Подпись pg_sig = md5( script_name ";" + значения_параметров_по_алфавиту_ключей(";") ";" secret ).
 *  3) Webhook (POST /billing/webhook/freedompay, БЕЗ JwtAuthGuard): FreedomPay шлёт
 *     результат c pg_sig. Проверить подпись, при pg_result=1 (оплачено) — активировать
 *     подписку по pg_order_id (BillingService уже умеет активировать). Ответить XML
 *     { pg_status: ok, pg_sig }.
 * Что нужно от юзера: merchant_id, secret_key и актуальный PDF мерчанта (точные поля/URL).
 */
class FreedomPayProvider implements PaymentProvider {
  readonly id = "freedompay";
  private readonly merchantId = process.env.FREEDOMPAY_MERCHANT_ID ?? "";
  private readonly secret = process.env.FREEDOMPAY_SECRET ?? "";

  private configured(): boolean {
    return this.merchantId.length > 0 && this.secret.length > 0;
  }

  createCheckout(): Promise<CheckoutResult> {
    if (!this.configured()) {
      throw new Error(
        "FreedomPay не настроен: задайте FREEDOMPAY_MERCHANT_ID и FREEDOMPAY_SECRET",
      );
    }
    // TODO: реализовать init_payment по чертёжу выше (нужен merchant-мануал FreedomPay).
    throw new Error("FreedomPay: init_payment ещё не реализован — см. чертёж в providers.ts");
  }
}

/** Заглушка КР-провайдера Paybox. */
class PayboxProvider implements PaymentProvider {
  readonly id = "paybox";
  createCheckout(): Promise<CheckoutResult> {
    throw new Error("Paybox пока не подключён (нужны ключи мерчанта)");
  }
}

export const providers: Record<string, PaymentProvider> = {
  dev: new DevProvider(),
  freedompay: new FreedomPayProvider(),
  paybox: new PayboxProvider(),
};
