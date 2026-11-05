/**
 * Выбор «поста на сегодня», когда в posts.js несколько недель.
 *
 * Правило одно для автопостера, Telegram-рассылки и хаба:
 *   активная неделя = самая ранняя неделя, где есть НЕопубликованный пост ленты
 *   (журнал — ig-posted.json); пост дня = пост активной недели на этот день.
 *
 * Следствия: пропущенный день (ABORT, выключенный Mac) не теряется — неделя
 * остаётся активной, пока все её посты ленты не выйдут; дублей нет. Когда всё
 * опубликовано, лента простаивает, а сторис берутся из последней недели.
 */
import { readFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { POSTS } from "./posts.js";

const ROOT = dirname(fileURLToPath(import.meta.url));
export const DOW = ["Вс", "Пн", "Вт", "Ср", "Чт", "Пт", "Сб"];
export const isFeed = (post) => post.format !== "story";

/** Журнал опубликованного в ленту: { id: "дата · кто" }. Нет файла → пусто. */
export function readPosted() {
  try {
    return JSON.parse(readFileSync(join(ROOT, "ig-posted.json"), "utf8")).posted ?? {};
  } catch {
    return {};
  }
}

const weeks = (posts) => [...new Set(posts.map((p) => p.week))].sort((a, b) => a - b);

/** Самая ранняя неделя с неопубликованным постом ленты; всё вышло → null. */
export function activeWeek(posted = {}, posts = POSTS) {
  return weeks(posts).find((w) => posts.some((p) => p.week === w && isFeed(p) && !(p.id in posted))) ?? null;
}

/**
 * Пост на день недели `day` ("Пн".."Вс").
 * Возвращает { post, week, action, reason }:
 *   action "publish" — пост ленты, ещё не в журнале → публиковать;
 *   action "story"   — сторис (грузит владелец, в бот уходит рассылкой);
 *   action "skip"    — публиковать нечего (reason объясняет почему).
 */
export function postForDay(day, posted = {}, posts = POSTS) {
  const active = activeWeek(posted, posts);
  const week = active ?? weeks(posts).at(-1) ?? null;
  const post = posts.find((p) => p.week === week && p.day === day) ?? null;
  if (!post) return { post: null, week, action: "skip", reason: `на ${day} в неделе ${week} поста нет` };
  if (!isFeed(post)) return { post, week, action: "story", reason: "сторис — грузит владелец" };
  if (post.id in posted) {
    const why = active === null ? "все посты ленты опубликованы — нужны новые недели в posts.js" : "уже в ig-posted.json";
    return { post, week, action: "skip", reason: why };
  }
  return { post, week, action: "publish", reason: "пост ленты активной недели, в журнале его нет" };
}
