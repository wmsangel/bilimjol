import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { isLocale } from "@/i18n/config";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { localizedAlternates } from "@/lib/seo";
import { getDictionary } from "../dictionaries";

// Раз в сутки перегенерируем страницу — тогда «Игра дня» реально меняется.
export const revalidate = 86400;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string }>;
}): Promise<Metadata> {
  const { lang } = await params;
  if (!isLocale(lang)) return {};
  const dict = await getDictionary(lang);
  return {
    title: `${dict.games.title} — Bilimjol`,
    description: dict.games.subtitle,
    alternates: localizedAlternates(lang, "/games"),
  };
}

export default async function GamesPage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();
  const dict = await getDictionary(lang);

  const games = [
    {
      href: `/${lang}/games/memory`,
      icon: "🧠",
      title: dict.games.memory.title,
      description: dict.games.memory.description,
    },
    {
      href: `/${lang}/games/build`,
      icon: "🧮",
      title: dict.games.build.title,
      description: dict.games.build.description,
    },
    {
      href: `/${lang}/games/sprint`,
      icon: "⚡",
      title: dict.games.sprint.title,
      description: dict.games.sprint.description,
    },
    {
      href: `/${lang}/games/bubbles`,
      icon: "🎈",
      title: dict.games.bubbles.title,
      description: dict.games.bubbles.description,
    },
    {
      href: `/${lang}/games/trace`,
      icon: "✏️",
      title: dict.games.trace.title,
      description: dict.games.trace.description,
    },
  ];

  // Игра дня — детерминированно по дню (страница ревалидируется раз в сутки).
  const dayIndex = Math.floor(Date.now() / 86_400_000);
  const featured = games[dayIndex % games.length];
  const rest = games.filter((g) => g.href !== featured.href);

  const featuredLabel = lang === "ky" ? "Күндүн оюну" : "Игра дня";
  const playLabel = lang === "ky" ? "▶ Ойноо" : "▶ Играть";
  const iconBg = ["bg-[#efecff]", "bg-[#fbf3e3]"];

  return (
    <div className="flex flex-1 flex-col bg-[#f7f5ff] font-sans text-[#191539]">
      <SiteHeader lang={lang} dict={dict} />

      <main className="mx-auto w-full max-w-5xl flex-1 px-6 py-8">
        <h1 className="font-display text-[32px] font-bold tracking-tight sm:text-4xl">
          {dict.games.title}
        </h1>
        <p className="mt-2 text-lg text-[#5c5880]">{dict.games.subtitle}</p>

        <div className="mt-8 grid gap-4 lg:grid-cols-3 lg:grid-rows-2">
          {/* Игра дня */}
          <Link
            href={featured.href}
            className="group relative flex gap-5 overflow-hidden rounded-[28px] bg-[#191539] p-7 text-white transition hover:-translate-y-1 sm:items-center lg:col-span-1 lg:row-span-2 lg:flex-col lg:items-start lg:justify-between"
          >
            <div className="pointer-events-none absolute -right-16 -top-16 h-64 w-64 rounded-full bg-[#6d5cf7] opacity-40 blur-[60px]" />
            <div className="relative text-[72px] leading-none sm:text-[88px] lg:mt-2">
              {featured.icon}
            </div>
            <div className="relative flex-1">
              <span className="inline-block rounded-full bg-[#e6c079] px-3 py-1 text-[13px] font-extrabold text-[#191539]">
                {featuredLabel}
              </span>
              <h2 className="mt-3 font-display text-2xl font-bold sm:text-[28px]">
                {featured.title}
              </h2>
              <p className="mt-2 text-[15px] leading-relaxed text-[#d9d5f5] sm:text-[17px]">
                {featured.description}
              </p>
              <span className="mt-5 inline-flex rounded-full bg-[#6d5cf7] px-6 py-3 text-[15px] font-extrabold text-white shadow-[0_0_0_3px_#e6c079] transition group-hover:-translate-y-0.5 sm:px-7 sm:py-4 sm:text-[17px]">
                {playLabel}
              </span>
            </div>
          </Link>

          {/* Остальные игры */}
          {rest.map((g, i) => (
            <Link
              key={g.href}
              href={g.href}
              className="flex items-center gap-4 rounded-[26px] bg-white p-5 shadow-[0_8px_24px_rgba(25,21,57,.06)] transition hover:-translate-y-1 hover:shadow-[0_16px_36px_rgba(25,21,57,.1)] lg:flex-col lg:items-start lg:gap-0 lg:p-6"
            >
              <span
                className={
                  "flex h-14 w-14 flex-none items-center justify-center rounded-[18px] text-3xl lg:mb-3.5 lg:h-16 lg:w-16 lg:rounded-[20px] " +
                  iconBg[i % 2]
                }
              >
                {g.icon}
              </span>
              <div className="min-w-0">
                <h2 className="font-display text-lg font-bold sm:text-xl">
                  {g.title}
                </h2>
                <p className="mt-1 text-sm leading-snug text-[#5c5880] sm:text-[15px]">
                  {g.description}
                </p>
              </div>
            </Link>
          ))}
        </div>
      </main>

      <SiteFooter lang={lang} />
    </div>
  );
}
