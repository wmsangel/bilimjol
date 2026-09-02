import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
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
    const [users, children, activeSubscriptions, premium, totals] =
      await Promise.all([
        this.prisma.user.count(),
        this.prisma.childProfile.count(),
        this.prisma.subscription.count({ where: this.activeWhere() }),
        this.prisma.subscription.findMany({
          where: this.activeWhere(),
          select: { userId: true },
          distinct: ["userId"],
        }),
        this.prisma.childStats.aggregate({
          _sum: {
            totalAnswered: true,
            totalCorrect: true,
            timeSpentSec: true,
          },
        }),
      ]);
    return {
      users,
      children,
      activeSubscriptions,
      premiumUsers: premium.length,
      totalAnswered: totals._sum.totalAnswered ?? 0,
      totalCorrect: totals._sum.totalCorrect ?? 0,
      timeSpentSec: totals._sum.timeSpentSec ?? 0,
    };
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
        children: {
          select: {
            stats: {
              select: {
                totalAnswered: true,
                totalCorrect: true,
                timeSpentSec: true,
              },
            },
          },
        },
        subscriptions: {
          where: this.activeWhere(),
          select: { id: true },
          take: 1,
        },
      },
    });
    return rows.map((u) => {
      const agg = u.children.reduce(
        (a, c) => {
          a.answered += c.stats?.totalAnswered ?? 0;
          a.correct += c.stats?.totalCorrect ?? 0;
          a.time += c.stats?.timeSpentSec ?? 0;
          return a;
        },
        { answered: 0, correct: 0, time: 0 },
      );
      return {
        id: u.id,
        email: u.email,
        country: u.country,
        role: u.role,
        createdAt: u.createdAt,
        children: u._count.children,
        premium: u.subscriptions.length > 0,
        totalAnswered: agg.answered,
        totalCorrect: agg.correct,
        timeSpentSec: agg.time,
      };
    });
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

  /** Удалить пользователя (каскадно: дети, прогресс, статистика, подписки, токены). */
  async deleteUser(userId: string, actingUserId: string) {
    const target = await this.assertUser(userId);
    if (userId === actingUserId) {
      throw new BadRequestException("Нельзя удалить собственный аккаунт");
    }
    // Нельзя снести последнего админа — иначе управление платформой потеряно.
    if (target.role === "admin") {
      const admins = await this.prisma.user.count({ where: { role: "admin" } });
      if (admins <= 1) {
        throw new BadRequestException("Нельзя удалить последнего администратора");
      }
    }
    await this.prisma.user.delete({ where: { id: userId } });
    return { deleted: true };
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
