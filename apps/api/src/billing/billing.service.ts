import {
  BadRequestException,
  ForbiddenException,
  Injectable,
} from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { MailService } from "../mail/mail.service";
import { TelegramNotifyService } from "../notify/telegram-notify.service";
import { providers } from "./providers";
import {
  paddleConfigured,
  listTransactions,
  cancelSubscription,
  updatePaymentMethodTransaction,
  type PaddleTransaction,
} from "./paddle-api";

const PLAN_DAYS: Record<string, number> = { monthly: 30 };

// Dev-провайдер выдаёт премиум мгновенно — в проде это дыра (любой залогиненный
// мог бы дёрнуть /billing/checkout напрямую). Разрешаем только с явным флагом.
const DEV_CHECKOUT_ALLOWED = process.env.ALLOW_DEV_CHECKOUT === "1";

@Injectable()
export class BillingService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly mail: MailService,
    private readonly notify: TelegramNotifyService,
  ) {}

  private activeSub(userId: string) {
    // «canceled» с будущей датой — это отмена в конце периода: доступ ещё
    // действует (не продлевается). Поэтому премиум сохраняется до конца срока.
    return this.prisma.subscription.findFirst({
      where: {
        userId,
        status: { in: ["active", "canceled"] },
        currentPeriodEnd: { gt: new Date() },
      },
      orderBy: { currentPeriodEnd: "desc" },
    });
  }

  async entitlement(userId: string) {
    // Админам (сотрудникам) премиум доступен всегда — их нельзя упирать в пейвол,
    // даже если платной подписки нет или она истекла.
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { role: true },
    });
    if (user?.role === "admin") {
      return { premium: true, until: null, plan: "admin" };
    }
    const sub = await this.activeSub(userId);
    return {
      premium: !!sub,
      until: sub?.currentPeriodEnd ?? null,
      plan: sub?.plan ?? null,
    };
  }

  /**
   * Сводка подписки для кабинета (/me). Берём самую свежую строку пользователя
   * (активную или нет), чтобы показать статус и дату продления/окончания.
   * Запрос всегда ограничен userId — чужую подписку увидеть нельзя.
   */
  async subscription(userId: string) {
    const sub = await this.prisma.subscription.findFirst({
      where: { userId },
      orderBy: { currentPeriodEnd: "desc" },
    });
    // Доступ действует, пока не вышел оплаченный период — и для «active», и для
    // «canceled» (отмена в конце периода: доступ доживает до currentPeriodEnd).
    const withinPeriod = sub ? sub.currentPeriodEnd > new Date() : false;
    const active =
      withinPeriod &&
      (sub!.status === "active" || sub!.status === "canceled");
    const cancelAtPeriodEnd = !!sub && sub.status === "canceled" && withinPeriod;

    // Если действующей подписки нет, но пользователь — админ, кабинет не должен
    // противоречить реальному доступу: entitlement() выдаёт админам премиум всегда,
    // поэтому показываем служебный доступ как активный и бессрочный. Если же у
    // админа есть реальная активная подписка (напр. Paddle), ниже покажем именно её
    // — чтобы можно было тестировать управление (история/отмена/карта).
    if (!active) {
      const user = await this.prisma.user.findUnique({
        where: { id: userId },
        select: { role: true },
      });
      if (user?.role === "admin") {
        return {
          hasSubscription: true as const,
          status: "active",
          active: true,
          plan: "admin",
          provider: "admin",
          currentPeriodEnd: null,
          cancelAtPeriodEnd: false,
          managementEnabled: false,
        };
      }
    }

    if (!sub) {
      return { hasSubscription: false as const, managementEnabled: false };
    }
    return {
      hasSubscription: true as const,
      status: cancelAtPeriodEnd ? "canceled" : active ? "active" : sub.status,
      active,
      plan: sub.plan,
      provider: sub.provider,
      currentPeriodEnd: sub.currentPeriodEnd,
      // true, если подписка отменена и доработает до конца оплаченного периода.
      cancelAtPeriodEnd,
      // Управление (история/отмена/карта) доступно, только когда задан серверный
      // Paddle API-ключ И это paddle-подписка с внешним id.
      managementEnabled:
        paddleConfigured() &&
        sub.provider === "paddle" &&
        !!sub.externalId,
    };
  }

  /** Paddle-подписка пользователя с внешним id (самая свежая). Всегда по userId. */
  private async paddleSub(userId: string) {
    return this.prisma.subscription.findFirst({
      where: { userId, provider: "paddle", externalId: { not: null } },
      orderBy: { currentPeriodEnd: "desc" },
    });
  }

  /** История списаний по подписке пользователя (read-only). */
  async transactions(
    userId: string,
  ): Promise<{ enabled: boolean; items: PaddleTransaction[] }> {
    if (!paddleConfigured()) return { enabled: false, items: [] };
    const sub = await this.paddleSub(userId);
    if (!sub?.externalId) return { enabled: true, items: [] };
    const items = await listTransactions(sub.externalId);
    return { enabled: true, items };
  }

  /** Отмена подписки пользователя (в конце оплаченного периода). */
  async cancel(userId: string) {
    if (!paddleConfigured()) {
      throw new BadRequestException("Управление подпиской недоступно");
    }
    const sub = await this.paddleSub(userId);
    if (!sub?.externalId) {
      throw new BadRequestException("Активная подписка не найдена");
    }
    await cancelSubscription(sub.externalId);
    // Локально помечаем отменённой; вебхук subscription.canceled подтвердит.
    await this.prisma.subscription.update({
      where: { id: sub.id },
      data: { status: "canceled" },
    });
    return { ok: true, cancelAtPeriodEnd: true, until: sub.currentPeriodEnd };
  }

  /** Транзакция смены способа оплаты (веб завершает её в Paddle.js). */
  async paymentMethodUpdate(userId: string): Promise<{ transactionId: string }> {
    if (!paddleConfigured()) {
      throw new BadRequestException("Управление подпиской недоступно");
    }
    const sub = await this.paddleSub(userId);
    if (!sub?.externalId) {
      throw new BadRequestException("Активная подписка не найдена");
    }
    const transactionId = await updatePaymentMethodTransaction(sub.externalId);
    return { transactionId };
  }

  async checkout(userId: string, plan: string, providerId: string) {
    const provider = providers[providerId];
    if (!provider) throw new BadRequestException("Неизвестный провайдер");
    // В проде самоактивация через dev запрещена — доступ выдаёт админ вручную.
    if (providerId === "dev" && !DEV_CHECKOUT_ALLOWED) {
      throw new ForbiddenException(
        "Самостоятельная оплата пока недоступна — обратитесь к администратору",
      );
    }

    const result = await provider.createCheckout({ userId, plan });

    // Мгновенная активация (dev / успешная оплата).
    if (result.activatedUntil) {
      const existing = await this.activeSub(userId);
      const base =
        existing && existing.currentPeriodEnd > new Date()
          ? existing.currentPeriodEnd
          : new Date();
      const days = PLAN_DAYS[plan] ?? 30;
      const until = new Date(base.getTime() + days * 24 * 60 * 60 * 1000);

      await this.prisma.subscription.create({
        data: {
          userId,
          plan,
          provider: provider.id,
          externalId: result.externalId ?? null,
          status: "active",
          currentPeriodEnd: until,
        },
      });
      return { premium: true, until, redirectUrl: null };
    }

    // Ожидание оплаты у провайдера.
    return { premium: false, until: null, redirectUrl: result.redirectUrl ?? null };
  }

  /**
   * Обработка события вебхука Paddle. Нас интересуют subscription.* — по ним
   * ведём строку Subscription (provider="paddle"), из которой считается премиум.
   * Пользователь ищется по custom_data.userId, переданному при чекауте.
   */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  async handlePaddleEvent(event: any): Promise<void> {
    const type: string = event?.event_type ?? "";
    if (!type.startsWith("subscription.")) return;

    const data = event.data ?? {};
    const userId: string | undefined = data.custom_data?.userId;
    const externalId: string | undefined = data.id;
    if (!userId || !externalId) return;

    const status: string = data.status ?? "";
    const active = status === "active" || status === "trialing";
    // Отмена в конце периода: Paddle держит статус active, но ставит
    // scheduled_change.action="cancel". Это НЕ должно затирать отметку отмены —
    // иначе кабинет снова покажет «Активна», хотя подписка уже отменяется.
    const scheduledCancel = data.scheduled_change?.action === "cancel";
    const endsAt: string | undefined =
      data.current_billing_period?.ends_at ?? data.next_billed_at ?? undefined;
    const currentPeriodEnd = endsAt
      ? new Date(endsAt)
      : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);

    const item = Array.isArray(data.items) ? data.items[0] : undefined;
    const plan: string =
      item?.price?.custom_data?.plan ??
      (item?.price?.billing_cycle?.interval === "year" ? "annual" : "monthly");

    const existing = await this.prisma.subscription.findFirst({
      where: { provider: "paddle", externalId },
    });
    const values = {
      status: scheduledCancel ? "canceled" : active ? "active" : "canceled",
      currentPeriodEnd,
      plan,
    };
    if (existing) {
      await this.prisma.subscription.update({ where: { id: existing.id }, data: values });
    } else {
      await this.prisma.subscription.create({
        data: { userId, provider: "paddle", externalId, ...values },
      });
      // Первая активация подписки → письмо «премиум активирован» (fire-and-forget).
      // Только для новой активной подписки, чтобы не слать при апдейтах/отмене.
      if (active) {
        const user = await this.prisma.user.findUnique({
          where: { id: userId },
          select: { email: true, locale: true },
        });
        if (user) {
          void this.mail.sendPremiumActivated(user, currentPeriodEnd);
          void this.notify.notify(
            `💳 Оплата подписки\n${user.email}\n${plan}, до ${currentPeriodEnd.toLocaleDateString("ru-RU")}`,
          );
        }
      }
    }

    // Отмена подписки → оповещение владельцу (по событию subscription.canceled).
    if (type === "subscription.canceled") {
      const user = await this.prisma.user.findUnique({
        where: { id: userId },
        select: { email: true },
      });
      void this.notify.notify(
        `⚠️ Отмена подписки\n${user?.email ?? userId}`,
      );
    }
  }
}
