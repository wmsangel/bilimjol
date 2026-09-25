import { Module } from "@nestjs/common";
import { MailService } from "./mail.service";

// Общий почтовый модуль. Импортируется там, где нужны письма (auth, billing).
@Module({
  providers: [MailService],
  exports: [MailService],
})
export class MailModule {}
