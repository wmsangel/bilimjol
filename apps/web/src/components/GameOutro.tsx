import Link from "next/link";
import type { Locale } from "@izn-study/shared";
import { GAME_META } from "@/lib/classGames";
import { SiteFooter } from "./SiteFooter";

// Низ страницы игры: сиблинг-ссылки на другие игры (каждая игра получает
// входящие со всех остальных — уплотняет внутренний граф, помогает discovery
// KY-страниц) + общий футер.
export function GameOutro({
  lang,
  currentSlug,
}: {
  lang: Locale;
  currentSlug: string;
}) {
  const others = Object.values(GAME_META).filter((g) => g.slug !== currentSlug);
  const title = lang === "ky" ? "Башка оюндар" : "Другие игры";

  return (
    <>
      <section className="mx-auto w-full max-w-3xl px-6 pb-12">
        <h2 className="mb-4 font-display text-xl font-bold text-[#191539]">{title}</h2>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          {others.map((g) => (
            <Link
              key={g.id}
              href={`/${lang}${g.slug}`}
              className="flex items-center gap-2.5 rounded-2xl bg-white p-3 shadow-[0_6px_18px_rgba(25,21,57,.05)] transition hover:-translate-y-0.5 hover:shadow-[0_12px_28px_rgba(25,21,57,.1)]"
            >
              <span className="flex-none text-2xl">{g.icon}</span>
              <span className="min-w-0 truncate text-sm font-bold text-[#191539]">
                {g.title[lang]}
              </span>
            </Link>
          ))}
        </div>
      </section>
      <SiteFooter lang={lang} />
    </>
  );
}
