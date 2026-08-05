import { Injectable } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";

@Injectable()
export class AdminService {
  constructor(private readonly prisma: PrismaService) {}

  private activeWhere() {
    return { status: "active", currentPeriodEnd: { gt: new Date() } };
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
}
