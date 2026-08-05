import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";

@Injectable()
export class AdminGuard implements CanActivate {
  constructor(private readonly prisma: PrismaService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req = context.switchToHttp().getRequest<{ userId?: string }>();
    if (!req.userId) throw new ForbiddenException();
    const user = await this.prisma.user.findUnique({
      where: { id: req.userId },
      select: { role: true },
    });
    if (user?.role !== "admin") throw new ForbiddenException("Нужны права администратора");
    return true;
  }
}
