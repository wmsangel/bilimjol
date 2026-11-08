import { Module } from "@nestjs/common";
import { AuthModule } from "../auth/auth.module";
import { BillingController } from "./billing.controller";
import { PaddleWebhookController } from "./paddle-webhook.controller";
import { BillingService } from "./billing.service";
import { MailModule } from "../mail/mail.module";
import { NotifyModule } from "../notify/notify.module";

@Module({
  imports: [AuthModule, MailModule, NotifyModule],
  controllers: [BillingController, PaddleWebhookController],
  providers: [BillingService],
})
export class BillingModule {}
