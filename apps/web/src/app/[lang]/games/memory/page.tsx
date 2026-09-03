import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { isLocale } from "@/i18n/config";
import { SiteHeader } from "@/components/SiteHeader";
import { MemoryGame } from "@/components/MemoryGame";
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
    <div className="flex flex-1 flex-col bg-gradient-to-b from-indigo-50 via-white to-amber-50 dark:from-zinc-950 dark:via-zinc-950 dark:to-zinc-900">
      <SiteHeader lang={lang} dict={dict} />

      <main className="mx-auto w-full max-w-3xl flex-1 px-6 py-8">
        <div className="mb-6 text-center">
          <Link
            href={`/${lang}/games`}
            className="text-sm font-semibold text-indigo-600 hover:underline dark:text-indigo-400"
          >
            {dict.games.memory.back}
          </Link>
          <h1 className="mt-2 font-display text-3xl font-extrabold tracking-tight">
            🧠 {dict.games.memory.title}
          </h1>
        </div>
        <MemoryGame labels={dict.games.memory} homeHref={`/${lang}/games`} />
      </main>
    </div>
  );
}
