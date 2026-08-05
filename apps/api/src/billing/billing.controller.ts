import { Body, Controller, Get, Post, UseGuards } from "@nestjs/common";
import { ZodValidationPipe } from "../common/zod-validation.pipe";
import { CurrentUser } from "../auth/current-user.decorator";
import { JwtAuthGuard } from "../auth/jwt-auth.guard";
import { BillingService } from "./billing.service";
import { checkoutSchema, type CheckoutDto } from "./dto";

@UseGuards(JwtAuthGuard)
@Controller("billing")
export class BillingController {
  constructor(private readonly billing: BillingService) {}

  @Get("entitlement")
  entitlement(@CurrentUser() userId: string) {
    return this.billing.entitlement(userId);
  }

  @Post("checkout")
  checkout(
    @CurrentUser() userId: string,
    @Body(new ZodValidationPipe(checkoutSchema)) dto: CheckoutDto,
  ) {
    return this.billing.checkout(
      userId,
      dto.plan ?? "monthly",
      dto.provider ?? "dev",
    );
  }
}
