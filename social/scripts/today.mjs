/**
 * «Что публикуем сегодня» — единая точка решения для автопостера (AUTOPOST.md).
 * Печатает JSON: действие, id, файлы слайдов (RU) по порядку и готовую подпись.
 *
 *   node scripts/today.mjs            сегодня
 *   node scripts/today.mjs --day Пт   другой день недели (проверка)
 *   node scripts/today.mjs --week     расклад активной недели по дням
 *
 * action: "publish" — публиковать; "story" / "skip" — не публиковать (см. reason).
 */
import { readdirSync, existsSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { DOW, readPosted, postForDay, activeWeek } from "../plan.js";

const OUT = join(dirname(fileURLToPath(import.meta.url)), "..", "out");
const args = process.argv.slice(2);
const posted = readPosted();

if (args.includes("--week")) {
  console.log(`активная неделя: ${activeWeek(posted) ?? "нет (всё опубликовано)"}`);
  for (const day of ["Пн", "Вт", "Ср", "Чт", "Пт", "Сб", "Вс"]) {
    const r = postForDay(day, posted);
    console.log(`  ${day}  ${(r.post?.id ?? "—").padEnd(20)} ${r.action.padEnd(8)} ${r.reason}`);
  }
  process.exit(0);
}

const day = args.includes("--day") ? args[args.indexOf("--day") + 1] : DOW[new Date().getDay()];
if (!DOW.includes(day)) {
  console.error(`Неизвестный день «${day}». Допустимо: ${DOW.join(", ")}`);
  process.exit(1);
}

const { post, week, action, reason } = postForDay(day, posted);
const result = { day, week, action, reason, id: post?.id ?? null, format: post?.format ?? null };

if (post && action === "publish") {
  const re = new RegExp(`^${post.id}-ru-\\d+-square\\.png$`);
  const files = existsSync(OUT) ? readdirSync(OUT).filter((f) => re.test(f)).sort() : [];
  result.files = files.map((f) => join(OUT, f));
  // Слайдов на диске меньше, чем в плане → сначала `node scripts/social-slides.mjs`.
  result.filesReady = files.length === post.slides.length;
  result.caption = [post.caption.ru, post.hashtags.ru].filter(Boolean).join("\n\n");
}

console.log(JSON.stringify(result, null, 2));
