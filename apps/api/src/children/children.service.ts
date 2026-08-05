import { Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import type { CreateChildDto } from "./dto";

@Injectable()
export class ChildrenService {
  constructor(private readonly prisma: PrismaService) {}

  list(userId: string) {
    return this.prisma.childProfile.findMany({
      where: { userId },
      orderBy: { createdAt: "asc" },
    });
  }

  create(userId: string, dto: CreateChildDto) {
    return this.prisma.childProfile.create({
      data: { userId, ...dto },
    });
  }

  async remove(userId: string, id: string) {
    const child = await this.prisma.childProfile.findUnique({ where: { id } });
    if (!child || child.userId !== userId) {
      throw new NotFoundException("Профиль не найден");
    }
    await this.prisma.childProfile.delete({ where: { id } });
    return { ok: true };
  }
}
