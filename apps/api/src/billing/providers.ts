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

/** Заглушка КР-провайдера FreedomPay — подключить с ключами мерчанта. */
class FreedomPayProvider implements PaymentProvider {
  readonly id = "freedompay";
  createCheckout(): Promise<CheckoutResult> {
    throw new Error("FreedomPay пока не подключён (нужны ключи мерчанта)");
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
