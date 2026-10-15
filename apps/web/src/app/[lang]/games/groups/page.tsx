import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { isLocale } from "@/i18n/config";
import { SiteHeader } from "@/components/SiteHeader";
import { Track } from "@/components/Track";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { localizedAlternates } from "@/lib/seo";
import { GroupGame } from "@/components/GroupGame";
import { PremiumGate } from "@/components/PremiumGate";
import { getDictionary } from "../../dictionaries";
import { GameOutro } from "@/components/GameOutro";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string }>;
}): Promise<Metadata> {
  const { lang } = await params;
  if (!isLocale(lang)) return {};
  const dict = await getDictionary(lang);
  return {
    title: `${dict.games.groups.title} — Bilimjol`,
    description: dict.games.groups.description,
    alternates: localizedAlternates(lang, "/games/groups"),
  };
}

export default async function GroupsPage({
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
      <Track event="game_open" params={{ game: "groups", lang }} />
      <main className="mx-auto w-full max-w-3xl flex-1 px-6 py-8">
        <Breadcrumbs
          lang={lang}
          items={[
            [dict.account.play, "/play"],
            [dict.games.groups.title, "/games/groups"],
          ]}
        />
        <div className="mb-6 text-center">
          <Link
            href={`/${lang}/games`}
            className="text-sm font-semibold text-[#6d5cf7] hover:underline"
          >
            {dict.games.groups.back}
          </Link>
          <h1 className="mt-2 font-display text-3xl font-extrabold tracking-tight">
            <span aria-hidden="true">🧺</span> {dict.games.groups.title}
          </h1>
        </div>
        <PremiumGate
          locale={lang}
          subscribeHref={`/${lang}/subscribe`}
          gameTitle={dict.games.groups.title}
          source="game_groups"
        >
          <GroupGame
            labels={dict.games.groups}
            locale={lang}
            homeHref={`/${lang}/games`}
          />
        </PremiumGate>
      </main>
      <GameOutro lang={lang} currentSlug="/games/groups" />
    </div>
  );
}
