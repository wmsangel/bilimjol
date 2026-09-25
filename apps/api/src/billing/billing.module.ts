import { Module } from "@nestjs/common";
import { AuthModule } from "../auth/auth.module";
import { BillingController } from "./billing.controller";
import { PaddleWebhookController } from "./paddle-webhook.controller";
import { BillingService } from "./billing.service";

@Module({
  imports: [AuthModule],
  controllers: [BillingController, PaddleWebhookController],
  providers: [BillingService],
})
export class BillingModule {}
