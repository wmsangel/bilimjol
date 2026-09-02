import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { ThrottlerModule } from "@nestjs/throttler";
import { PrismaModule } from "./prisma/prisma.module";
import { AuthModule } from "./auth/auth.module";
import { ChildrenModule } from "./children/children.module";
import { ProgressModule } from "./progress/progress.module";
import { BillingModule } from "./billing/billing.module";
import { AdminModule } from "./admin/admin.module";
import { HealthController } from "./health.controller";

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    // Базовый лимит на IP (60с). Строгий лимит на /auth/* — в AuthController.
    ThrottlerModule.forRoot([{ ttl: 60000, limit: 60 }]),
    PrismaModule,
    AuthModule,
    ChildrenModule,
    ProgressModule,
    BillingModule,
    AdminModule,
  ],
  controllers: [HealthController],
})
export class AppModule {}
