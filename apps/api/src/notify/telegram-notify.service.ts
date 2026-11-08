import { Injectable, Logger } from "@nestjs/common";

/**
 * Оповещения владельцу в Telegram (регистрации, оплаты и т. п.).
 * Тонкая обёртка над Bot API через fetch, без зависимостей. Включается двумя
 * переменными окружения; без них — no-op (как MailService без RESEND_API_KEY):
 *   TELEGRAM_BOT_TOKEN       — токен бота (@bilimjol_bot)
 *   TELEGRAM_ADMIN_CHAT_ID   — chat_id владельца (куда слать)
 * Отправка fire-and-forget: не блокирует запрос и не роняет его при ошибке.
 */
@Injectable()
export class TelegramNotifyService {
  private readonly logger = new Logger(TelegramNotifyService.name);
  private readonly token = process.env.TELEGRAM_BOT_TOKEN?.trim();
  private readonly chatId = process.env.TELEGRAM_ADMIN_CHAT_ID?.trim();

  configured(): boolean {
    return !!this.token && !!this.chatId;
  }

  async notify(text: string): Promise<void> {
    if (!this.configured()) {
      this.logger.warn(
        `Telegram не настроен — уведомление не отправлено: ${text.slice(0, 60)}`,
      );
      return;
    }
    try {
      const res = await fetch(
        `https://api.telegram.org/bot${this.token}/sendMessage`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            chat_id: this.chatId,
            text,
            parse_mode: "HTML",
            disable_web_page_preview: true,
          }),
        },
      );
      if (!res.ok) {
        const body = await res.text();
        this.logger.error(`Telegram ${res.status}: ${body.slice(0, 200)}`);
      }
    } catch (e) {
      this.logger.error(`Telegram notify failed: ${String(e)}`);
    }
  }
}
