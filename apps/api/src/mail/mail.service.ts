import { Injectable, Logger } from "@nestjs/common";

type Locale = "ru" | "ky";

/**
 * Тонкая обёртка над Resend REST API (без SDK-зависимости — обычный fetch).
 * Транзакционные письма: welcome при регистрации, «премиум активирован» после
 * оплаты. Отправка НЕблокирующая и НИКОГДА не бросает наверх: провал письма не
 * должен ронять регистрацию/обработку вебхука. Если ключа нет — тихо пропускаем
 * (локальная разработка), только пишем в лог.
 */
@Injectable()
export class MailService {
  private readonly logger = new Logger(MailService.name);
  private readonly apiKey = process.env.RESEND_API_KEY;
  private readonly from = process.env.MAIL_FROM ?? "Bilimjol <no-reply@bilimjol.com>";
  private readonly site = (process.env.WEB_ORIGIN ?? "https://bilimjol.com")
    .split(",")[0]
    .trim()
    .replace(/\/$/, "");

  private async send(to: string, subject: string, html: string): Promise<void> {
    if (!this.apiKey) {
      this.logger.warn(`RESEND_API_KEY не задан — письмо «${subject}» не отправлено (${to})`);
      return;
    }
    try {
      const res = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${this.apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ from: this.from, to, subject, html }),
      });
      if (!res.ok) {
        const body = await res.text().catch(() => "");
        this.logger.error(`Resend ${res.status} для «${subject}» (${to}): ${body.slice(0, 300)}`);
      }
    } catch (e) {
      this.logger.error(`Не удалось отправить «${subject}» (${to}): ${String(e)}`);
    }
  }

  // Fire-and-forget обёртки — вызывающий делает `void mail.sendWelcome(...)`.
  async sendWelcome(user: { email: string; locale: string }): Promise<void> {
    const l: Locale = user.locale === "ky" ? "ky" : "ru";
    const c = WELCOME[l];
    await this.send(user.email, c.subject, layout(l, c.heading, c.body, c.cta, `${this.site}/${l}/play`));
  }

  async sendPremiumActivated(
    user: { email: string; locale: string },
    until: Date,
  ): Promise<void> {
    const l: Locale = user.locale === "ky" ? "ky" : "ru";
    const c = PREMIUM[l];
    const dateStr = until.toLocaleDateString(l === "ky" ? "ky-KG" : "ru-RU", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
    const body = c.body.replace("{date}", `<b>${dateStr}</b>`);
    await this.send(user.email, c.subject, layout(l, c.heading, body, c.cta, `${this.site}/${l}/play`));
  }
}

// ─── Тексты писем (обе локали) ───────────────────────────────────────────────
const WELCOME: Record<Locale, { subject: string; heading: string; body: string; cta: string }> = {
  ru: {
    subject: "Добро пожаловать в Bilimjol 👋",
    heading: "Рады видеть вас в Bilimjol!",
    body: "Аккаунт создан. Здесь ребёнок занимается логикой, математикой, чтением и окружающим миром — с играми, тестами и объяснением к каждому заданию. Выбирайте класс и начинайте прямо сейчас.",
    cta: "Начать заниматься",
  },
  ky: {
    subject: "Bilimjol'га кош келиңиз 👋",
    heading: "Bilimjol'да сизди көргөнүбүзгө кубанычтабыз!",
    body: "Аккаунт түзүлдү. Бул жерде бала логика, математика, окуу жана айлана-чөйрө менен машыгат — оюндар, тесттер жана ар бир тапшырмага түшүндүрмө менен. Классты тандап, азыр эле баштаңыз.",
    cta: "Машыгууну баштоо",
  },
};

const PREMIUM: Record<Locale, { subject: string; heading: string; body: string; cta: string }> = {
  ru: {
    subject: "Премиум активирован 🎉",
    heading: "Премиум активирован 🎉",
    body: "Спасибо за подписку! Теперь открыты все предметы, классы и тысячи заданий без блокировок, тесты-тренажёры и отчёт для родителей. Подписка действует до {date}. Приятной учёбы!",
    cta: "Перейти к занятиям",
  },
  ky: {
    subject: "Премиум иштетилди 🎉",
    heading: "Премиум иштетилди 🎉",
    body: "Жазылганыңыз үчүн рахмат! Эми бардык предметтер, класстар жана миңдеген тапшырма бөгөттөөсүз, тесттер жана ата-энелер үчүн отчёт ачык. Жазылуу {date} чейин күчүндө. Жакшы окууларды!",
    cta: "Сабактарга өтүү",
  },
};

// ─── Брендовый HTML-каркас (inline-стили — для совместимости с почтовиками) ───
function layout(locale: Locale, heading: string, body: string, cta: string, ctaHref: string): string {
  const year = new Date().getFullYear();
  const footer =
    locale === "ky"
      ? `Сиз bilimjol.com'да катталгандыктан бул кат келди.`
      : `Вы получили это письмо, потому что зарегистрировались на bilimjol.com.`;
  return `<!doctype html>
<html lang="${locale}">
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:24px 12px;background:#f7f5ff;font-family:-apple-system,Segoe UI,Roboto,Arial,sans-serif;color:#191539;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:480px;margin:0 auto;background:#ffffff;border-radius:20px;overflow:hidden;box-shadow:0 12px 32px rgba(25,21,57,.08);">
    <tr><td style="background:#191539;padding:22px 28px;">
      <span style="font-size:22px;font-weight:800;color:#ffffff;">Bilim<span style="color:#e6c079;">jol</span></span>
    </td></tr>
    <tr><td style="padding:28px;">
      <h1 style="margin:0 0 12px;font-size:22px;line-height:1.25;color:#191539;">${heading}</h1>
      <p style="margin:0 0 24px;font-size:15px;line-height:1.6;color:#5c5880;">${body}</p>
      <a href="${ctaHref}" style="display:inline-block;background:#6d5cf7;color:#ffffff;text-decoration:none;font-weight:800;font-size:15px;padding:14px 26px;border-radius:999px;">${cta} →</a>
    </td></tr>
    <tr><td style="padding:18px 28px;border-top:1px solid #efedf9;">
      <p style="margin:0;font-size:12px;line-height:1.5;color:#9a96b8;">${footer}<br>© ${year} Bilimjol</p>
    </td></tr>
  </table>
</body></html>`;
}
