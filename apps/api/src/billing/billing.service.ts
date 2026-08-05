import { BadRequestException, Injectable } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { providers } from "./providers";

const PLAN_DAYS: Record<string, number> = { monthly: 30 };

@Injectable()
export class BillingService {
  constructor(private readonly prisma: PrismaService) {}

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
}
