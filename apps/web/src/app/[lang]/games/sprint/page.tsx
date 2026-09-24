import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { isLocale } from "@/i18n/config";
import { SiteHeader } from "@/components/SiteHeader";
import { JsonLd } from "@/components/JsonLd";
import { localizedAlternates, breadcrumbJsonLd } from "@/lib/seo";
import { SprintGame } from "@/components/SprintGame";
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
    title: `${dict.games.sprint.title} — Bilimjol`,
    description: dict.games.sprint.description,
    alternates: localizedAlternates(lang, "/games/sprint"),
  };
}

export default async function SprintPage({
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
      <JsonLd data={breadcrumbJsonLd(lang, [[dict.games.title, "/games"], [dict.games.sprint.title, "/games/sprint"]])} />

      <main className="mx-auto w-full max-w-3xl flex-1 px-6 py-8">
        <div className="mb-6 text-center">
          <Link
            href={`/${lang}/games`}
            className="text-sm font-semibold text-[#6d5cf7] hover:underline"
          >
            {dict.games.sprint.back}
          </Link>
          <h1 className="mt-2 font-display text-3xl font-extrabold tracking-tight">
            ⚡ {dict.games.sprint.title}
          </h1>
        </div>
        <SprintGame labels={dict.games.sprint} homeHref={`/${lang}/games`} />
      </main>
    </div>
  );
}
