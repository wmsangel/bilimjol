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

// Чистая подпись для копипаста: ТОЛЬКО текст поста + хэштеги, без служебного.
// Это сообщение копируешь целиком и вставляешь в Instagram.
function cleanCaption(post, lang) {
  const cap = (post.caption?.[lang] ?? "").trim();
  const tags = (post.hashtags?.[lang] ?? "").trim();
  return [cap, tags].filter(Boolean).join("\n\n");
}

// Служебная подпись к МЕДИА (день, формат, ссылка, стикер) — она под фото/видео,
// в копипаст-сообщение НЕ попадает.
function mediaInfo(post, lang) {
  const parts = [`📅 ${post.day} · ${fmtName(post.format)} → bilimjol.com/ru${post.page}`];
  if (post.sticker) parts.push(`🎯 Стикер в IG: ${post.sticker[lang] || post.sticker.ru}`);
  return parts.join("\n\n");
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

async function sendDocument(bot, chat, path, caption) {
  const form = new FormData();
  form.append("chat_id", chat);
  form.append("document", fileBlob(path), basename(path));
  if (caption) form.append("caption", caption);
  await tg(bot, "sendDocument", form);
}

// Полное оформление профиля Instagram (флаг --profile) — каждый пункт отдельным
// сообщением: аватар (документ без сжатия + превью), имя/username, bio RU/KY,
// ссылка с UTM, тип/категория, обложки «Актуального» (файлы + названия),
// контакты, что закрепить, чек-лист. Источник — social/profile/profile.json + PNG.
async function sendProfile(bot, chat) {
  const dir = join(ROOT, "profile");
  const d = JSON.parse(readFileSync(join(dir, "profile.json"), "utf8"));
  const f = (name) => join(dir, name);

  await sendText(bot, chat, "📸 Оформление профиля Instagram — bilimjol\nКаждое ниже — отдельным сообщением: файлы скачиваешь, тексты копируешь.");

  await sendText(bot, chat, "1️⃣ Аватар — 1080×1080, маскот в центре. Ниже оригинал (без сжатия) и превью.");
  await sendDocument(bot, chat, f("avatar.png"), "avatar.png — поставь как фото профиля");
  await sendPhoto(bot, chat, f("avatar.png"), "");

  await sendText(bot, chat, `2️⃣ Имя профиля (≤30, с ключевым словом):\n${d.name}\n\nВарианты @username (возьми свободный):\n${d.usernames.join("   ")}`);

  await sendText(bot, chat, `3️⃣ Bio (≤150) — RU:\n${d.bio.ru}`);
  await sendText(bot, chat, `Bio (≤150) — KY:\n${d.bio.ky}`);

  await sendText(bot, chat, `4️⃣ Ссылка в профиле (с UTM):\n${d.link}`);

  await sendText(bot, chat, `5️⃣ Тип аккаунта: ${d.account.type}\n${d.account.typeNote}\nКатегория: ${d.account.category}`);

  await sendText(bot, chat, `6️⃣ Обложки «Актуального» — ${d.covers.length} шт, 1080×1920, БЕЗ текста (круг обрежет). Ниже файлы, в подписи — название темы.`);
  for (const c of d.covers) {
    await sendDocument(bot, chat, f(c.file), `Актуальное: ${c.name}`);
  }

  await sendText(bot, chat, `7️⃣ Контакты:\n${d.contacts}`);

  await sendText(bot, chat, `8️⃣ Закрепить 3 поста (⋯ → «Закрепить в профиле»):\n— ${d.pins.join("\n— ")}`);

  await sendText(bot, chat, `9️⃣ Чек-лист «что нажать»:\n${d.checklist.join("\n")}`);

  console.log(`Профиль отправлен в Telegram: аватар + ${d.covers.length} обложек + текстовый комплект.`);
}

// ─── main ───
const { bot, chat, lang } = config();
if (process.argv.includes("--profile")) {
  await sendProfile(bot, chat);
  process.exit(0);
}
const arg = process.argv[2];
const today = DOW[new Date().getDay()];
const post = arg
  ? POSTS.find((p) => p.id === arg)
  : POSTS.find((p) => p.day === today);

if (!post) {
  console.log(arg ? `Пост «${arg}» не найден.` : `На ${today} поста в плане нет — выходной.`);
  process.exit(0);
}

// На автозапуске (без явного id) в бот шлём ТОЛЬКО сторис: посты/карусели/видео
// публикуются автопостером через Chrome, а сторис владелец грузит руками (через
// веб их не загрузить). Ручной запуск с id — шлёт любой формат (для теста).
if (!arg && post.format !== "story") {
  console.log(`Сегодня формат «${post.format}» — в бот идут только сторис, пропуск.`);
  process.exit(0);
}

const primary = lang === "ky" ? "ky" : "ru";
const mediaLangs = lang === "both" ? ["ru", "ky"] : [primary];
const info = mediaInfo(post, primary);
const video = post.video ? join(ROOT, post.video) : null;
// Служебную инфу вешаем ТОЛЬКО на первое вложение; остальные — без подписи.
let infoUsed = false;
const nextCaption = () => (infoUsed ? "" : ((infoUsed = true), info));

try {
  // 1) Медиа. Контекст (день/ссылка/стикер) — подписью под первым вложением.
  if (video && existsSync(video)) {
    await sendVideo(bot, chat, video, nextCaption());
  }
  for (const l of mediaLangs) {
    const slides = slidesFor(post.id, l);
    if (!slides.length) continue;
    if (slides.length > 1) await sendAlbum(bot, chat, slides, nextCaption());
    else await sendPhoto(bot, chat, slides[0], nextCaption());
  }
  // 2) ОТДЕЛЬНОЕ сообщение — только текст поста + хэштеги. Копируешь целиком.
  const caption = cleanCaption(post, primary);
  if (caption) await sendText(bot, chat, caption);
  console.log(`Отправлено в Telegram: ${today} · ${post.rubric} (${post.id})`);
} catch (e) {
  console.error("Telegram ошибка:", e.message);
  process.exit(1);
}
