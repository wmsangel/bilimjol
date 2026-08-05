import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
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
