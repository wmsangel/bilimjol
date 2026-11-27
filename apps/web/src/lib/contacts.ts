// Контакт для ручных сценариев оплаты (QR, страны вне Paddle). Переопределяется env.
export const ADMIN_TG =
  process.env.NEXT_PUBLIC_ADMIN_TELEGRAM ?? "https://t.me/izagorodnyi";
