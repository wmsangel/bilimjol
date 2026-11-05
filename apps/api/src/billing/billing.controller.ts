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

  @Get("subscription")
  subscription(@CurrentUser() userId: string) {
    return this.billing.subscription(userId);
  }

  @Get("transactions")
  transactions(@CurrentUser() userId: string) {
    return this.billing.transactions(userId);
  }

  @Post("cancel")
  cancel(@CurrentUser() userId: string) {
    return this.billing.cancel(userId);
  }

  @Post("payment-method")
  paymentMethod(@CurrentUser() userId: string) {
    return this.billing.paymentMethodUpdate(userId);
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
