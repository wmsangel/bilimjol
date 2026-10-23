import { Body, Controller, Get, Post, UseGuards } from "@nestjs/common";
import { Throttle, ThrottlerGuard } from "@nestjs/throttler";
import { ZodValidationPipe } from "../common/zod-validation.pipe";
import { AuthService } from "./auth.service";
import { CurrentUser } from "./current-user.decorator";
import { JwtAuthGuard } from "./jwt-auth.guard";
import {
  guestSchema,
  loginSchema,
  refreshSchema,
  registerSchema,
  setPasswordSchema,
  type GuestDto,
  type LoginDto,
  type RefreshDto,
  type RegisterDto,
  type SetPasswordDto,
} from "./dto";

// Rate-limit на всю группу auth (защита от брутфорса/спама).
@UseGuards(ThrottlerGuard)
@Controller("auth")
export class AuthController {
  constructor(private readonly auth: AuthService) {}

  @Throttle({ default: { limit: 5, ttl: 60000 } })
  @Post("register")
  register(@Body(new ZodValidationPipe(registerSchema)) dto: RegisterDto) {
    return this.auth.register(dto);
  }

  @Throttle({ default: { limit: 8, ttl: 60000 } })
  @Post("login")
  login(@Body(new ZodValidationPipe(loginSchema)) dto: LoginDto) {
    return this.auth.login(dto);
  }

  // Гостевой старт оплаты: создаёт беспарольный аккаунт по email и логинит.
  @Throttle({ default: { limit: 5, ttl: 60000 } })
  @Post("guest")
  guest(@Body(new ZodValidationPipe(guestSchema)) dto: GuestDto) {
    return this.auth.guestStart(dto);
  }

  // Установка пароля по ссылке из письма.
  @Throttle({ default: { limit: 5, ttl: 60000 } })
  @Post("set-password")
  setPassword(@Body(new ZodValidationPipe(setPasswordSchema)) dto: SetPasswordDto) {
    return this.auth.setPassword(dto);
  }

  @Post("refresh")
  refresh(@Body(new ZodValidationPipe(refreshSchema)) dto: RefreshDto) {
    return this.auth.refresh(dto.refreshToken);
  }

  @Post("logout")
  logout(@Body(new ZodValidationPipe(refreshSchema)) dto: RefreshDto) {
    return this.auth.logout(dto.refreshToken);
  }

  @UseGuards(JwtAuthGuard)
  @Get("me")
  me(@CurrentUser() userId: string) {
    return this.auth.me(userId);
  }
}
