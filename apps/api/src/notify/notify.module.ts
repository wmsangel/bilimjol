import { Module } from "@nestjs/common";
import { TelegramNotifyService } from "./telegram-notify.service";

// Общий модуль оповещений владельцу. Импортируется там, где есть события
// (auth — регистрации, billing — оплаты/отмены).
@Module({
  providers: [TelegramNotifyService],
  exports: [TelegramNotifyService],
})
export class NotifyModule {}
