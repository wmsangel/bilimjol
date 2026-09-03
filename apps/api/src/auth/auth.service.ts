import {
  ConflictException,
  Injectable,
  UnauthorizedException,
} from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import * as bcrypt from "bcryptjs";
import { createHash, randomBytes } from "node:crypto";
import type { User } from "@prisma/client";
import { PrismaService } from "../prisma/prisma.service";
import type { LoginDto, RegisterDto } from "./dto";

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwt: JwtService,
  ) {}

  private readonly accessSecret = process.env.JWT_ACCESS_SECRET ?? "dev-access";
  private readonly accessTtl = Number(process.env.JWT_ACCESS_TTL ?? 900);
  private readonly refreshTtl = Number(process.env.JWT_REFRESH_TTL ?? 2_592_000);

  private sha(value: string): string {
    return createHash("sha256").update(value).digest("hex");
  }

  private publicUser(user: User) {
    return {
      id: user.id,
      email: user.email,
      locale: user.locale,
      country: user.country,
      role: user.role,
    };
  }

  private async issueTokens(userId: string, device?: string) {
    const accessToken = await this.jwt.signAsync(
      { sub: userId },
      { secret: this.accessSecret, expiresIn: this.accessTtl },
    );
    const refreshToken = randomBytes(48).toString("hex");
    await this.prisma.refreshToken.create({
      data: {
        userId,
        tokenHash: this.sha(refreshToken),
        device: device ?? null,
        expiresAt: new Date(Date.now() + this.refreshTtl * 1000),
      },
    });
    return { accessToken, refreshToken };
  }

  async register(dto: RegisterDto, device?: string) {
    const exists = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });
    if (exists) throw new ConflictException("Email уже зарегистрирован");

    const passwordHash = await bcrypt.hash(dto.password, 10);
    const user = await this.prisma.user.create({
      data: {
        email: dto.email,
        passwordHash,
        locale: dto.locale ?? "ru",
        country: dto.country ?? null,
      },
    });
    const tokens = await this.issueTokens(user.id, device);
    return { user: this.publicUser(user), ...tokens };
  }

  async login(dto: LoginDto, device?: string) {
    const user = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });
    const ok = user && (await bcrypt.compare(dto.password, user.passwordHash));
    if (!user || !ok) {
      throw new UnauthorizedException("Неверный email или пароль");
    }
    const tokens = await this.issueTokens(user.id, device);
    return { user: this.publicUser(user), ...tokens };
  }

  async refresh(refreshToken: string, device?: string) {
    const token = await this.prisma.refreshToken.findUnique({
      where: { tokenHash: this.sha(refreshToken) },
    });
    if (!token || token.revokedAt || token.expiresAt < new Date()) {
      throw new UnauthorizedException("Refresh-токен недействителен");
    }
    // Ротация: гасим старый, выдаём новый.
    await this.prisma.refreshToken.update({
      where: { id: token.id },
      data: { revokedAt: new Date() },
    });
    return this.issueTokens(token.userId, device);
  }

  async logout(refreshToken: string) {
    await this.prisma.refreshToken.updateMany({
      where: { tokenHash: this.sha(refreshToken), revokedAt: null },
      data: { revokedAt: new Date() },
    });
    return { ok: true };
  }

  async me(userId: string) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new UnauthorizedException();
    return this.publicUser(user);
  }
}
