import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Query,
  UseGuards,
} from "@nestjs/common";
import { ZodValidationPipe } from "../common/zod-validation.pipe";
import { CurrentUser } from "../auth/current-user.decorator";
import { JwtAuthGuard } from "../auth/jwt-auth.guard";
import { AdminGuard } from "./admin.guard";
import { AdminService } from "./admin.service";
import {
  grantPremiumSchema,
  resetPasswordSchema,
  type GrantPremiumDto,
  type ResetPasswordDto,
} from "./dto";

@UseGuards(JwtAuthGuard, AdminGuard)
@Controller("admin")
export class AdminController {
  constructor(private readonly admin: AdminService) {}

  @Get("stats")
  stats() {
    return this.admin.stats();
  }

  @Get("users")
  users(@Query("limit") limit?: string, @Query("offset") offset?: string) {
    const take = Math.min(Math.max(Number(limit) || 50, 1), 200);
    const skip = Math.max(Number(offset) || 0, 0);
    return this.admin.users(take, skip);
  }

  @Get("users/:id/detail")
  userDetail(@Param("id") id: string) {
    return this.admin.userDetail(id);
  }

  @Post("users/:id/grant-premium")
  grantPremium(
    @Param("id") id: string,
    @Body(new ZodValidationPipe(grantPremiumSchema)) dto: GrantPremiumDto,
  ) {
    return this.admin.grantPremium(id, dto.days ?? 30);
  }

  @Post("users/:id/reset-password")
  resetPassword(
    @Param("id") id: string,
    @Body(new ZodValidationPipe(resetPasswordSchema)) dto: ResetPasswordDto,
  ) {
    return this.admin.resetPassword(id, dto.password);
  }

  @Delete("users/:id")
  deleteUser(@Param("id") id: string, @CurrentUser() actingUserId: string) {
    return this.admin.deleteUser(id, actingUserId);
  }
}
