import {
  BadRequestException,
  ForbiddenException,
  Injectable,
} from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { MailService } from "../mail/mail.service";
import { providers } from "./providers";

const PLAN_DAYS: Record<string, number> = { monthly: 30 };

// Dev-провайдер выдаёт премиум мгновенно — в проде это дыра (любой залогиненный
// мог бы дёрнуть /billing/checkout напрямую). Разрешаем только с явным флагом.
const DEV_CHECKOUT_ALLOWED = process.env.ALLOW_DEV_CHECKOUT === "1";

@Injectable()
export class BillingService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly mail: MailService,
  ) {}

  private activeSub(userId: string) {
    return this.prisma.subscription.findFirst({
      where: { userId, status: "active", currentPeriodEnd: { gt: new Date() } },
      orderBy: { currentPeriodEnd: "desc" },
    });
  }

  async entitlement(userId: string) {
    const sub = await this.activeSub(userId);
    return {
      premium: !!sub,
      until: sub?.currentPeriodEnd ?? null,
      plan: sub?.plan ?? null,
    };
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
      status: active ? "active" : "canceled",
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
        }
      }
    }
  }
}
