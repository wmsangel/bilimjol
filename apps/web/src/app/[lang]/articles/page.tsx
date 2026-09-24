import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { articles } from "@izn-study/shared";
import { isLocale } from "@/i18n/config";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
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
    title: `${dict.articles.title} — Bilimjol`,
    description: dict.articles.subtitle,
    alternates: localizedAlternates(lang, "/articles"),
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
    <div className="flex flex-1 flex-col bg-[#f7f5ff]">
      <SiteHeader lang={lang} dict={dict} />

      <main className="mx-auto w-full max-w-4xl flex-1 px-6 py-8 font-sans text-[#191539]">
        <h1 className="font-display text-4xl font-bold tracking-tight">
          {dict.articles.title}
        </h1>
        <p className="mt-3 text-lg text-[#5c5880]">{dict.articles.subtitle}</p>

        {/* Промо теста готовности */}
        <Link
          href={`/${lang}/gotovnost-k-shkole`}
          className="mt-8 flex items-center gap-4 overflow-hidden rounded-[26px] bg-[#191539] p-6 text-white transition hover:-translate-y-0.5"
        >
          <span className="flex h-14 w-14 flex-none items-center justify-center rounded-2xl bg-white/15 text-3xl">
            🎒
          </span>
          <span className="min-w-0 flex-1">
            <span className="block font-display text-xl font-bold">
              {dict.readiness.title}
            </span>
            <span className="mt-1 block text-sm text-[#d9d5f5]">
              {dict.readiness.intro}
            </span>
          </span>
          <span className="hidden flex-none rounded-full bg-[#6d5cf7] px-5 py-2.5 font-extrabold text-white shadow-[0_0_0_3px_#e6c079] sm:block">
            {dict.readiness.start} →
          </span>
        </Link>

        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          {articles.map((a) => (
            <Link
              key={a.slug}
              href={`/${lang}/articles/${a.slug}`}
              className="flex flex-col rounded-[26px] bg-white p-6 shadow-[0_8px_24px_rgba(25,21,57,.06)] transition hover:-translate-y-1 hover:shadow-[0_16px_36px_rgba(25,21,57,.1)]"
            >
              <span className="mb-3 flex h-14 w-14 items-center justify-center rounded-[20px] bg-[#efecff] text-3xl">
                {a.emoji}
              </span>
              <h2 className="font-display text-xl font-bold leading-tight">
                {a.title[lang]}
              </h2>
              <p className="mt-2 flex-1 leading-7 text-[#5c5880]">
                {a.excerpt[lang]}
              </p>
              <span className="mt-4 font-extrabold text-[#6d5cf7]">
                {dict.articles.readMore} →
              </span>
            </Link>
          ))}
        </div>
      </main>

      <SiteFooter lang={lang} />
    </div>
  );
}
