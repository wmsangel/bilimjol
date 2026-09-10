import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { isLocale } from "@/i18n/config";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { ReadinessTest } from "@/components/ReadinessTest";
import { localizedAlternates } from "@/lib/seo";
import { getDictionary } from "../dictionaries";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string }>;
}): Promise<Metadata> {
  const { lang } = await params;
  if (!isLocale(lang)) return {};
  const dict = await getDictionary(lang);
  return {
    title: `${dict.readiness.title} — Bilimjol`,
    description: dict.readiness.intro,
    alternates: localizedAlternates(lang, "/gotovnost-k-shkole"),
  };
}

export default async function ReadinessPage({
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

      <main className="mx-auto w-full max-w-2xl flex-1 px-6 py-8">
        <div className="mb-8 text-center">
          <div className="text-6xl">🎒</div>
          <h1 className="mt-3 font-display text-4xl font-extrabold tracking-tight">
            {dict.readiness.title}
          </h1>
        </div>
        <ReadinessTest labels={dict.readiness} playHref={`/${lang}/play`} />
      </main>

      <SiteFooter lang={lang} />
    </div>
  );
}
