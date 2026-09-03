import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { isLocale } from "@/i18n/config";
import { SiteHeader } from "@/components/SiteHeader";
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
    title: `${dict.games.title} — Bilimjol`,
    description: dict.games.subtitle,
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
  ];

  return (
    <div className="flex flex-1 flex-col bg-gradient-to-b from-indigo-50 via-white to-amber-50 dark:from-zinc-950 dark:via-zinc-950 dark:to-zinc-900">
      <SiteHeader lang={lang} dict={dict} />

      <main className="mx-auto w-full max-w-4xl flex-1 px-6 py-8">
        <h1 className="font-display text-4xl font-extrabold tracking-tight">
          {dict.games.title}
        </h1>
        <p className="mt-3 text-lg text-zinc-600 dark:text-zinc-400">
          {dict.games.subtitle}
        </p>

        <div className="mt-8 grid gap-5 sm:grid-cols-2">
          {games.map((g) => (
            <Link
              key={g.href}
              href={g.href}
              className="flex items-center gap-4 rounded-3xl border border-black/[.06] bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-md dark:border-white/10 dark:bg-zinc-900"
            >
              <span className="flex h-16 w-16 flex-shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-100 to-violet-100 text-3xl dark:from-indigo-500/15 dark:to-violet-500/15">
                {g.icon}
              </span>
              <div className="min-w-0">
                <h2 className="font-display text-xl font-bold">{g.title}</h2>
                <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
                  {g.description}
                </p>
              </div>
            </Link>
          ))}
        </div>
      </main>

      <footer className="mx-auto w-full max-w-4xl px-6 py-10 text-sm text-zinc-500">
        © {new Date().getFullYear()} Bilimjol
      </footer>
    </div>
  );
}
