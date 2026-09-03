import type { LocalizedText } from "./types";

/** Запись в ленте «Что нового» (показывается в кабинете). Новые — сверху. */
export interface NewsItem {
  date: string; // ISO, для сортировки и отметки «непрочитано»
  emoji: string;
  title: LocalizedText;
  href?: string; // необязательная ссылка (относительная, без локали)
}

// Добавляй новые записи СВЕРХУ. Дата — когда фича появилась.
export const news: NewsItem[] = [
  {
    date: "2026-09-03",
    emoji: "🎮",
    title: {
      ru: "Новая игра «Мемори: пары» — тренируй память и счёт",
      ky: "Жаңы оюн «Мемори: жуптар» — эс менен эсептөөнү машыктыр",
    },
    href: "/games/memory",
  },
  {
    date: "2026-09-03",
    emoji: "👑",
    title: {
      ru: "Новая одежда: корона и медаль за звёзды",
      ky: "Жаңы кийим: жылдыздар үчүн таажы жана медаль",
    },
    href: "/wardrobe",
  },
  {
    date: "2026-09-02",
    emoji: "📊",
    title: {
      ru: "Статистика занятий в кабинете: точность и время",
      ky: "Кабинетте сабак статистикасы: тактык жана убакыт",
    },
  },
  {
    date: "2026-09-01",
    emoji: "✏️",
    title: {
      ru: "Новые статьи для родителей: письмо и память",
      ky: "Ата-энелер үчүн жаңы макалалар: жазуу жана эс",
    },
    href: "/articles",
  },
];

/** Сколько записей новее указанной даты (для бейджа «непрочитано»). */
export function unseenNewsCount(lastSeen: string | null): number {
  if (!lastSeen) return news.length;
  return news.filter((n) => n.date > lastSeen).length;
}
