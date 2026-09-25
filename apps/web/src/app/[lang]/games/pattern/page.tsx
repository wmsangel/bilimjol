import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { isLocale } from "@/i18n/config";
import { SiteHeader } from "@/components/SiteHeader";
import { JsonLd } from "@/components/JsonLd";
import { localizedAlternates, breadcrumbJsonLd } from "@/lib/seo";
import { PatternGame } from "@/components/PatternGame";
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
    title: `${dict.games.pattern.title} — Bilimjol`,
    description: dict.games.pattern.description,
    alternates: localizedAlternates(lang, "/games/pattern"),
  };
}

export default async function PatternPage({
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
      <JsonLd
        data={breadcrumbJsonLd(lang, [
          [dict.games.title, "/games"],
          [dict.games.pattern.title, "/games/pattern"],
        ])}
      />

      <main className="mx-auto w-full max-w-3xl flex-1 px-6 py-8">
        <div className="mb-6 text-center">
          <Link
            href={`/${lang}/games`}
            className="text-sm font-semibold text-[#6d5cf7] hover:underline"
          >
            {dict.games.pattern.back}
          </Link>
          <h1 className="mt-2 font-display text-3xl font-extrabold tracking-tight">
            🔁 {dict.games.pattern.title}
          </h1>
        </div>
        <PatternGame labels={dict.games.pattern} homeHref={`/${lang}/games`} />
      </main>
    </div>
  );
}
