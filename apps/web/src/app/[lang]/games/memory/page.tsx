import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { isLocale } from "@/i18n/config";
import { SiteHeader } from "@/components/SiteHeader";
import { JsonLd } from "@/components/JsonLd";
import { localizedAlternates, breadcrumbJsonLd } from "@/lib/seo";
import { MemoryGame } from "@/components/MemoryGame";
import { PremiumGate } from "@/components/PremiumGate";
import { getDictionary } from "../../dictionaries";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string }>;
}): Promise<Metadata> {
  const { lang } = await params;
  if (!isLocale(lang)) return {};
  const dict = await getDictionary(lang);
  return {
    title: `${dict.games.memory.title} — Bilimjol`,
    description: dict.games.memory.description,
    alternates: localizedAlternates(lang, "/games/memory"),
  };
}

export default async function MemoryPage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();
  const dict = await getDictionary(lang);

  return (
    <div className="flex flex-1 flex-col bg-[#f7f5ff]">
      <SiteHeader lang={lang} dict={dict} />
      <JsonLd data={breadcrumbJsonLd(lang, [[dict.games.title, "/games"], [dict.games.memory.title, "/games/memory"]])} />

      <main className="mx-auto w-full max-w-3xl flex-1 px-6 py-8">
        <div className="mb-6 text-center">
          <Link
            href={`/${lang}/games`}
            className="text-sm font-semibold text-[#6d5cf7] hover:underline"
          >
            {dict.games.memory.back}
          </Link>
          <h1 className="mt-2 font-display text-3xl font-extrabold tracking-tight">
            🧠 {dict.games.memory.title}
          </h1>
        </div>
        <PremiumGate
          locale={lang}
          subscribeHref={`/${lang}/subscribe`}
          gameTitle={dict.games.memory.title}
          source="game_memory"
        >
          <MemoryGame labels={dict.games.memory} homeHref={`/${lang}/games`} />
        </PremiumGate>
      </main>
    </div>
  );
}
