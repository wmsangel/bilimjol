import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { isLocale } from "@/i18n/config";
import { SiteHeader } from "@/components/SiteHeader";
import { JsonLd } from "@/components/JsonLd";
import { TraceGame } from "@/components/TraceGame";
import { localizedAlternates, breadcrumbJsonLd } from "@/lib/seo";
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
    title: `${dict.games.trace.title} — Bilimjol`,
    description: dict.games.trace.description,
    alternates: localizedAlternates(lang, "/games/trace"),
  };
}

export default async function TracePage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();
  const dict = await getDictionary(lang);

  return (
    <div className="flex flex-1 flex-col bg-gradient-to-b from-indigo-50 via-white to-amber-50 dark:from-zinc-950 dark:via-zinc-950 dark:to-zinc-900">
      <SiteHeader lang={lang} dict={dict} />
      <JsonLd data={breadcrumbJsonLd(lang, [[dict.games.title, "/games"], [dict.games.trace.title, "/games/trace"]])} />

      <main className="mx-auto w-full max-w-3xl flex-1 px-6 py-8">
        <div className="mb-6 text-center">
          <Link
            href={`/${lang}/games`}
            className="text-sm font-semibold text-indigo-600 hover:underline dark:text-indigo-400"
          >
            {dict.games.trace.back}
          </Link>
          <h1 className="mt-2 font-display text-3xl font-extrabold tracking-tight">
            ✏️ {dict.games.trace.title}
          </h1>
        </div>
        <TraceGame labels={dict.games.trace} homeHref={`/${lang}/games`} />
      </main>
    </div>
  );
}
