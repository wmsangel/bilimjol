import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { articles } from "@izn-study/shared";
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
    title: `${dict.articles.title} — Bilimjol`,
    description: dict.articles.subtitle,
  };
}

export default async function ArticlesPage({
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

      <main className="mx-auto w-full max-w-4xl flex-1 px-6 py-8">
        <h1 className="font-display text-4xl font-extrabold tracking-tight">
          {dict.articles.title}
        </h1>
        <p className="mt-3 text-lg text-zinc-600 dark:text-zinc-400">
          {dict.articles.subtitle}
        </p>

        <div className="mt-8 grid gap-5 sm:grid-cols-2">
          {articles.map((a) => (
            <Link
              key={a.slug}
              href={`/${lang}/articles/${a.slug}`}
              className="flex flex-col rounded-3xl border border-black/[.06] bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-md dark:border-white/10 dark:bg-zinc-900"
            >
              <span className="mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-100 to-violet-100 text-3xl dark:from-indigo-500/15 dark:to-violet-500/15">
                {a.emoji}
              </span>
              <h2 className="font-display text-xl font-bold leading-tight">
                {a.title[lang]}
              </h2>
              <p className="mt-2 flex-1 leading-7 text-zinc-600 dark:text-zinc-400">
                {a.excerpt[lang]}
              </p>
              <span className="mt-4 font-bold text-indigo-600 dark:text-indigo-400">
                {dict.articles.readMore} →
              </span>
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
