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
import { MailService } from "../mail/mail.service";
import type { GuestDto, LoginDto, RegisterDto, SetPasswordDto } from "./dto";

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwt: JwtService,
    private readonly mail: MailService,
  ) {}

  private readonly accessSecret = process.env.JWT_ACCESS_SECRET ?? "dev-access";
  private readonly accessTtl = Number(process.env.JWT_ACCESS_TTL ?? 900);
  private readonly refreshTtl = Number(process.env.JWT_REFRESH_TTL ?? 2_592_000);
  // Токен set-password — подписанный JWT (без таблицы в БД). Отдельный секрет,
  // чтобы ссылка из письма не пересекалась с access-токенами; по умолчанию —
  // access-секрет, срок 7 дней.
  private readonly setpwSecret = process.env.JWT_SETPW_SECRET ?? this.accessSecret;
  private readonly setpwTtl = process.env.JWT_SETPW_TTL ?? "7d";

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
    // Welcome-письмо — fire-and-forget, не блокируем регистрацию.
    void this.mail.sendWelcome({ email: user.email, locale: user.locale });
    const tokens = await this.issueTokens(user.id, device);
    return { user: this.publicUser(user), ...tokens };
  }

  /**
   * Гостевой старт оплаты без обязательной регистрации: по одному email создаём
   * беспарольный аккаунт (passwordHash — случайный, войти паролем нельзя) и сразу
   * логиним, чтобы дальше открыть чекаут как залогиненный пользователь (вебхук
   * линкует подписку по userId — как у обычных юзеров). Ссылку «задать пароль»
   * шлём письмом, чтобы человек мог вернуться в аккаунт позже. Если email уже
   * занят — просим войти (не трогаем чужой аккаунт).
   */
  async guestStart(dto: GuestDto, device?: string) {
    const email = dto.email.trim();
    const exists = await this.prisma.user.findUnique({ where: { email } });
    if (exists) {
      throw new ConflictException("У этого email уже есть аккаунт — войдите");
    }
    // Случайный, заведомо неугадываемый пароль: вход паролем недоступен, пока
    // человек не задаст свой по ссылке из письма.
    const passwordHash = await bcrypt.hash(randomBytes(32).toString("hex"), 10);
    const user = await this.prisma.user.create({
      data: { email, passwordHash, locale: dto.locale ?? "ru" },
    });
    const setpwToken = await this.issueSetPasswordToken(user.id);
    const setpwUrl = this.setPasswordUrl(user.locale, setpwToken);
    void this.mail.sendSetPassword({ email: user.email, locale: user.locale }, setpwUrl);
    const tokens = await this.issueTokens(user.id, device);
    return { user: this.publicUser(user), ...tokens };
  }

  private issueSetPasswordToken(userId: string): Promise<string> {
    return this.jwt.signAsync(
      { sub: userId, purpose: "setpw" },
      { secret: this.setpwSecret, expiresIn: this.setpwTtl },
    );
  }

  private setPasswordUrl(locale: string, token: string): string {
    const site = (process.env.WEB_ORIGIN ?? "https://bilimjol.com")
      .split(",")[0]
      .trim()
      .replace(/\/$/, "");
    const l = locale === "ky" ? "ky" : "ru";
    return `${site}/${l}/set-password?token=${encodeURIComponent(token)}`;
  }

  /** Установка пароля по токену из письма: валидируем JWT, пишем хеш, логиним. */
  async setPassword(dto: SetPasswordDto, device?: string) {
    let payload: { sub?: string; purpose?: string };
    try {
      payload = await this.jwt.verifyAsync(dto.token, { secret: this.setpwSecret });
    } catch {
      throw new UnauthorizedException("Ссылка недействительна или устарела");
    }
    if (payload.purpose !== "setpw" || !payload.sub) {
      throw new UnauthorizedException("Ссылка недействительна");
    }
    const user = await this.prisma.user.findUnique({ where: { id: payload.sub } });
    if (!user) throw new UnauthorizedException("Пользователь не найден");
    const passwordHash = await bcrypt.hash(dto.password, 10);
    await this.prisma.user.update({ where: { id: user.id }, data: { passwordHash } });
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
