import {
  BadRequestException,
  Controller,
  Headers,
  HttpCode,
  Post,
  Req,
  type RawBodyRequest,
} from "@nestjs/common";
import type { IncomingMessage } from "node:http";
import { createHmac, timingSafeEqual } from "node:crypto";
import { BillingService } from "./billing.service";

/**
 * Вебхук Paddle (Billing). БЕЗ JwtAuthGuard — Paddle шлёт сюда события напрямую.
 * Подпись: заголовок Paddle-Signature "ts=<unix>;h1=<hex>", подписывается
 * строка "<ts>:<сырое тело>" секретом destination (PADDLE_WEBHOOK_SECRET).
 */
@Controller("billing")
export class PaddleWebhookController {
  constructor(private readonly billing: BillingService) {}

  @Post("webhook/paddle")
  @HttpCode(200)
  async handle(
    @Req() req: RawBodyRequest<IncomingMessage>,
    @Headers("paddle-signature") signature: string,
  ) {
    const secret = process.env.PADDLE_WEBHOOK_SECRET;
    const raw = req.rawBody?.toString("utf8") ?? "";
    if (!secret || !verifySignature(signature, raw, secret)) {
      throw new BadRequestException("bad signature");
    }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let event: any;
    try {
      event = JSON.parse(raw);
    } catch {
      throw new BadRequestException("bad body");
    }
    await this.billing.handlePaddleEvent(event);
    return { ok: true };
  }
}

function verifySignature(header: string, body: string, secret: string): boolean {
  if (!header) return false;
  const parts: Record<string, string> = {};
  for (const p of header.split(";")) {
    const i = p.indexOf("=");
    if (i > 0) parts[p.slice(0, i).trim()] = p.slice(i + 1).trim();
  }
  const ts = parts.ts;
  const h1 = parts.h1;
  if (!ts || !h1) return false;
  const digest = createHmac("sha256", secret).update(`${ts}:${body}`).digest("hex");
  try {
    return timingSafeEqual(Buffer.from(digest), Buffer.from(h1));
  } catch {
    return false;
  }
}
