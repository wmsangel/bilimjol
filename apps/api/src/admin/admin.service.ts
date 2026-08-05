import { Injectable, NotFoundException } from "@nestjs/common";
import * as bcrypt from "bcryptjs";
import { randomBytes } from "node:crypto";
import { PrismaService } from "../prisma/prisma.service";

@Injectable()
export class AdminService {
  constructor(private readonly prisma: PrismaService) {}

  private activeWhere() {
    return { status: "active", currentPeriodEnd: { gt: new Date() } };
  }

  private async assertUser(userId: string) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new NotFoundException("Пользователь не найден");
    return user;
  }

  async stats() {
    const [users, children, activeSubscriptions, premium] = await Promise.all([
      this.prisma.user.count(),
      this.prisma.childProfile.count(),
      this.prisma.subscription.count({ where: this.activeWhere() }),
      this.prisma.subscription.findMany({
        where: this.activeWhere(),
        select: { userId: true },
        distinct: ["userId"],
      }),
    ]);
    return { users, children, activeSubscriptions, premiumUsers: premium.length };
  }

  async users(limit: number, offset: number) {
    const rows = await this.prisma.user.findMany({
      orderBy: { createdAt: "desc" },
      take: limit,
      skip: offset,
      select: {
        id: true,
        email: true,
        country: true,
        role: true,
        createdAt: true,
        _count: { select: { children: true } },
        subscriptions: {
          where: this.activeWhere(),
          select: { id: true },
          take: 1,
        },
      },
    });
    return rows.map((u) => ({
      id: u.id,
      email: u.email,
      country: u.country,
      role: u.role,
      createdAt: u.createdAt,
      children: u._count.children,
      premium: u.subscriptions.length > 0,
    }));
  }

  /** Выдать/продлить премиум вручную (провайдер "admin"). */
  async grantPremium(userId: string, days = 30) {
    await this.assertUser(userId);
    const existing = await this.prisma.subscription.findFirst({
      where: { userId, ...this.activeWhere() },
      orderBy: { currentPeriodEnd: "desc" },
    });
    const base =
      existing && existing.currentPeriodEnd > new Date()
        ? existing.currentPeriodEnd
        : new Date();
    const until = new Date(base.getTime() + days * 24 * 60 * 60 * 1000);
    await this.prisma.subscription.create({
      data: {
        userId,
        plan: "monthly",
        provider: "admin",
        status: "active",
        currentPeriodEnd: until,
      },
    });
    return { premium: true, until };
  }

  /** Сбросить пароль: задать новый (или сгенерировать) и отозвать сессии. */
  async resetPassword(userId: string, password?: string) {
    await this.assertUser(userId);
    const newPassword = password ?? randomBytes(6).toString("base64url").slice(0, 10);
    const passwordHash = await bcrypt.hash(newPassword, 10);
    await this.prisma.user.update({
      where: { id: userId },
      data: { passwordHash },
    });
    // Отзываем все refresh-токены — пользователь должен войти заново.
    await this.prisma.refreshToken.updateMany({
      where: { userId, revokedAt: null },
      data: { revokedAt: new Date() },
    });
    return { password: newPassword };
  }
}
