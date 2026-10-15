/**
 * Дневное напоминание в Telegram: «сегодня по плану: …».
 *
 * Шлёт в приватный ops-канал пост дня из posts.js (по дню недели) со ссылкой
 * на контент-хаб — чтобы не забыть выложить. Реклама не маркируется (органика).
 *
 * Конфиг — social/.telegram.json (НЕ коммитить; см. .telegram.json.example):
 *   { "bot_token": "...", "chat_id": "-100..." }
 * или переменные окружения TG_BOT_TOKEN / TG_CHAT_ID.
 *
 * Запуск:  node scripts/telegram-daily.mjs
 * Автозапуск раз в день — launchd/cron (см. social/README.md).
 */
import { readFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { POSTS } from "../posts.js";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const HUB_URL = "https://claude.ai/artifact/QwGJEyVayjhTPxMx4Drc84";

function config() {
  let c = {};
  try { c = JSON.parse(readFileSync(join(ROOT, ".telegram.json"), "utf8")); } catch {}
  const bot = process.env.TG_BOT_TOKEN || c.bot_token;
  const chat = process.env.TG_CHAT_ID || c.chat_id;
  if (!bot || !chat) {
    console.error("Нет bot_token/chat_id. Заполни social/.telegram.json (см. .telegram.json.example) или TG_BOT_TOKEN/TG_CHAT_ID.");
    process.exit(1);
  }
  return { bot, chat };
}

const DOW = ["Вс", "Пн", "Вт", "Ср", "Чт", "Пт", "Сб"];
const today = DOW[new Date().getDay()];
const post = POSTS.find((p) => p.day === today);

if (!post) {
  console.log(`На ${today} поста в плане нет — выходной.`);
  process.exit(0);
}

const fmt = post.format === "carousel" ? "карусель" : post.format === "story" ? "сторис" : "пост";
const text =
  `📅 Сегодня по плану (${today})\n\n` +
  `• Рубрика: ${post.rubric}\n` +
  `• Формат: ${fmt}\n` +
  `• Ведёт на: bilimjol.com/ru${post.page}\n\n` +
  `Слайды и готовый текст (RU/KY) — в хабе:\n${HUB_URL}`;

const { bot, chat } = config();
const res = await fetch(`https://api.telegram.org/bot${bot}/sendMessage`, {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ chat_id: chat, text, disable_web_page_preview: true }),
});
const data = await res.json();
if (!data.ok) {
  console.error("Telegram ошибка:", data.description);
  process.exit(1);
}
console.log(`Отправлено в Telegram: ${today} · ${post.rubric}`);
