import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { articles, getArticle } from "@izn-study/shared";
import { isLocale } from "@/i18n/config";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { JsonLd } from "@/components/JsonLd";
import { getDictionary } from "../../dictionaries";

const SITE = process.env.NEXT_PUBLIC_SITE_URL ?? "https://bilimjol.com";

export function generateStaticParams() {
  return articles.map((a) => ({ slug: a.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string; slug: string }>;
}): Promise<Metadata> {
  const { lang, slug } = await params;
  const article = getArticle(slug);
  if (!isLocale(lang) || !article) return {};
  return {
    title: `${article.title[lang]} — Bilimjol`,
    description: article.excerpt[lang],
  };
}

export default async function ArticlePage({
  params,
}: {
  params: Promise<{ lang: string; slug: string }>;
}) {
  const { lang, slug } = await params;
  if (!isLocale(lang)) notFound();
  const article = getArticle(slug);
  if (!article) notFound();
  const dict = await getDictionary(lang);
  const related = articles.filter((a) => a.slug !== slug).slice(0, 3);
  const url = `${SITE}/${lang}/articles/${slug}`;

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: article.title[lang],
    description: article.excerpt[lang],
    inLanguage: lang,
    datePublished: article.date,
    dateModified: article.date,
    mainEntityOfPage: url,
    author: { "@type": "Organization", name: "Bilimjol", url: SITE },
    publisher: { "@type": "Organization", name: "Bilimjol", url: SITE },
  };

  return (
    <div className="flex flex-1 flex-col bg-gradient-to-b from-indigo-50 via-white to-amber-50 dark:from-zinc-950 dark:via-zinc-950 dark:to-zinc-900">
      <JsonLd data={jsonLd} />
      <SiteHeader lang={lang} dict={dict} />

      <main className="mx-auto w-full max-w-2xl flex-1 px-6 py-8">
        <Link
          href={`/${lang}/articles`}
          className="text-sm font-semibold text-indigo-600 hover:underline dark:text-indigo-400"
        >
          {dict.articles.back}
        </Link>

        <article className="mt-6">
          <div className="text-6xl">{article.emoji}</div>
          <h1 className="mt-4 font-display text-4xl font-extrabold leading-tight tracking-tight">
            {article.title[lang]}
          </h1>
          <time className="mt-2 block text-sm text-zinc-400">
            {new Date(article.date).toLocaleDateString(
              lang === "ky" ? "ky-KG" : "ru-RU",
            )}
          </time>

          {article.sections.map((s, i) => (
            <section key={i} className="mt-8">
              <h2 className="font-display text-2xl font-bold">
                {s.heading[lang]}
              </h2>
              {s.body.map((p, j) => (
                <p
                  key={j}
                  className="mt-3 text-lg leading-8 text-zinc-700 dark:text-zinc-300"
                >
                  {p[lang]}
                </p>
              ))}
            </section>
          ))}
        </article>

        <div className="mt-12 rounded-[2rem] bg-gradient-to-br from-indigo-500 to-violet-600 px-6 py-8 text-center text-white shadow-xl">
          <p className="font-display text-xl font-bold">{dict.cta.title}</p>
          <Link
            href={`/${lang}/play`}
            className="mt-4 inline-block rounded-full bg-white px-6 py-3 font-bold text-indigo-600 shadow-lg transition hover:brightness-95"
          >
            {dict.cta.button}
          </Link>
        </div>

        {related.length > 0 && (
          <section className="mt-12">
            <h2 className="font-display text-lg font-bold text-zinc-500 dark:text-zinc-400">
              {lang === "ky" ? "Дагы окуңуз" : "Читайте также"}
            </h2>
            <ul className="mt-4 space-y-3">
              {related.map((a) => (
                <li key={a.slug}>
                  <Link
                    href={`/${lang}/articles/${a.slug}`}
                    className="group flex items-center gap-3 rounded-2xl border border-black/[.06] bg-white p-4 transition hover:-translate-y-0.5 hover:border-indigo-300 dark:border-white/10 dark:bg-zinc-900"
                  >
                    <span className="text-2xl">{a.emoji}</span>
                    <span className="font-display font-bold transition group-hover:text-indigo-600 dark:group-hover:text-indigo-400">
                      {a.title[lang]}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        )}
      </main>

      <SiteFooter lang={lang} />
    </div>
  );
}
