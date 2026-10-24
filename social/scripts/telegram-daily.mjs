/**
 * Дневная рассылка контента в Telegram: присылает ГОТОВЫЙ пост на сегодня —
 * само медиа (картинка / карусель / видео) + отдельным сообщением подпись с
 * хэштегами, чтобы просто скопировать и выложить. Реклама не маркируется (органика).
 *
 * Источник плана — posts.js (по дню недели). Картинки берутся из out/ (сгенерить:
 * node scripts/social-slides.mjs). Видео — опциональное поле `video` у поста
 * (путь относительно social/, напр. "../research/ig-stories/w1-vt.mp4").
 *
 * Конфиг — social/.telegram.json (НЕ коммитить; см. .telegram.json.example):
 *   { "bot_token": "...", "chat_id": "-100...", "lang": "ru" }
 * или env TG_BOT_TOKEN / TG_CHAT_ID / TG_LANG.
 *   lang: "ru" (по умолч.) | "ky" | "both" — какие слайды слать; текст подписи
 *   в обоих языках идёт всегда (KY — для копипаста под кыргызскую аудиторию).
 *
 * Запуск:  node scripts/telegram-daily.mjs            # пост на сегодня
 *          node scripts/telegram-daily.mjs delenie    # конкретный пост по id (тест)
 * Автозапуск раз в день — launchd/cron (см. social/README.md).
 */
import { readFileSync, readdirSync, existsSync } from "node:fs";
import { join, dirname, basename } from "node:path";
import { fileURLToPath } from "node:url";
import { POSTS } from "../posts.js";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const OUT = join(ROOT, "out");
const HUB_URL = "https://claude.ai/artifact/QwGJEyVayjhTPxMx4Drc84";
const DOW = ["Вс", "Пн", "Вт", "Ср", "Чт", "Пт", "Сб"];

function config() {
  let c = {};
  try { c = JSON.parse(readFileSync(join(ROOT, ".telegram.json"), "utf8")); } catch {}
  const bot = process.env.TG_BOT_TOKEN || c.bot_token;
  const chat = process.env.TG_CHAT_ID || c.chat_id;
  const lang = (process.env.TG_LANG || c.lang || "ru").toLowerCase();
  if (!bot || !chat) {
    console.error("Нет bot_token/chat_id. Заполни social/.telegram.json (см. .telegram.json.example) или TG_BOT_TOKEN/TG_CHAT_ID.");
    process.exit(1);
  }
  return { bot, chat, lang };
}

// Слайды поста для языка: out/<id>-<lang>-NN-(square|story).png, по порядку.
function slidesFor(id, lang) {
  if (!existsSync(OUT)) return [];
  const re = new RegExp(`^${id}-${lang}-\\d+-(square|story)\\.png$`);
  return readdirSync(OUT).filter((f) => re.test(f)).sort().map((f) => join(OUT, f));
}

const fmtName = (f) => (f === "carousel" ? "карусель" : f === "story" ? "сторис" : "пост");

function captionBlock(post, lang) {
  const line = (l) => {
    const cap = post.caption?.[l] ?? "";
    const tags = post.hashtags?.[l] ?? "";
    return [cap, tags].filter(Boolean).join("\n\n");
  };
  const parts = [];
  parts.push(`📅 ${post.day} · ${post.rubric} · ${fmtName(post.format)}`);
  parts.push(`🔗 Ведёт на: bilimjol.com/ru${post.page}`);
  if (post.sticker?.ru) parts.push(`🎯 Стикер (добавить в IG): ${post.sticker[lang] || post.sticker.ru}`);
  parts.push("— — — ПОДПИСЬ RU (скопировать) — — —");
  parts.push(line("ru"));
  const ky = line("ky");
  if (ky) {
    parts.push("— — — ПОДПИСЬ KY — — —");
    parts.push(ky);
  }
  parts.push(`Хаб со всеми слайдами: ${HUB_URL}`);
  return parts.filter(Boolean).join("\n\n");
}

async function tg(bot, method, form) {
  const res = await fetch(`https://api.telegram.org/bot${bot}/${method}`, { method: "POST", body: form });
  const data = await res.json();
  if (!data.ok) throw new Error(`${method}: ${data.description}`);
  return data;
}

function fileBlob(path) {
  return new Blob([readFileSync(path)]);
}

async function sendPhoto(bot, chat, path, caption) {
  const form = new FormData();
  form.append("chat_id", chat);
  form.append("photo", fileBlob(path), basename(path));
  if (caption) form.append("caption", caption);
  await tg(bot, "sendPhoto", form);
}

async function sendVideo(bot, chat, path, caption) {
  const form = new FormData();
  form.append("chat_id", chat);
  form.append("video", fileBlob(path), basename(path));
  if (caption) form.append("caption", caption);
  await tg(bot, "sendVideo", form);
}

// Карусель → один альбом (до 10 фото). Подпись к альбому короткая (лимит 1024) —
// полный текст уходит отдельным сообщением.
async function sendAlbum(bot, chat, paths, caption) {
  const chunk = paths.slice(0, 10);
  const form = new FormData();
  form.append("chat_id", chat);
  const media = chunk.map((p, i) => ({ type: "photo", media: `attach://p${i}`, ...(i === 0 && caption ? { caption } : {}) }));
  form.append("media", JSON.stringify(media));
  chunk.forEach((p, i) => form.append(`p${i}`, fileBlob(p), basename(p)));
  await tg(bot, "sendMediaGroup", form);
}

async function sendText(bot, chat, text) {
  const form = new FormData();
  form.append("chat_id", chat);
  form.append("text", text);
  form.append("disable_web_page_preview", "true");
  await tg(bot, "sendMessage", form);
}

// ─── main ───
const { bot, chat, lang } = config();
const arg = process.argv[2];
const today = DOW[new Date().getDay()];
const post = arg
  ? POSTS.find((p) => p.id === arg)
  : POSTS.find((p) => p.day === today);

if (!post) {
  console.log(arg ? `Пост «${arg}» не найден.` : `На ${today} поста в плане нет — выходной.`);
  process.exit(0);
}

const mediaLangs = lang === "both" ? ["ru", "ky"] : [lang === "ky" ? "ky" : "ru"];
const header = `📅 ${post.day} · ${post.rubric} · ${fmtName(post.format)}`;
const video = post.video ? join(ROOT, post.video) : null;

try {
  // 1) Медиа (короткая подпись-заголовок).
  if (video && existsSync(video)) {
    await sendVideo(bot, chat, video, header);
  }
  for (const l of mediaLangs) {
    const slides = slidesFor(post.id, l);
    if (!slides.length) continue;
    const head = mediaLangs.length > 1 ? `${header} · ${l.toUpperCase()}` : header;
    if (slides.length > 1) await sendAlbum(bot, chat, slides, head);
    else await sendPhoto(bot, chat, slides[0], head);
  }
  // 2) Полный текст подписи с тегами — отдельным сообщением (копипаст).
  await sendText(bot, chat, captionBlock(post, lang === "ky" ? "ky" : "ru"));
  console.log(`Отправлено в Telegram: ${today} · ${post.rubric} (${post.id})`);
} catch (e) {
  console.error("Telegram ошибка:", e.message);
  process.exit(1);
}
