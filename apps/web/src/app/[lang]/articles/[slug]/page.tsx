import type { Metadata } from "next";
import { Fragment } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { articles, getArticle } from "@izn-study/shared";
import { isLocale } from "@/i18n/config";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { JsonLd } from "@/components/JsonLd";
import { localizedAlternates } from "@/lib/seo";
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
    alternates: localizedAlternates(lang, `/articles/${slug}`),
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
    dateModified: article.updated ?? article.date,
    mainEntityOfPage: url,
    author: { "@type": "Organization", name: "Bilimjol", url: SITE },
    publisher: { "@type": "Organization", name: "Bilimjol", url: SITE },
  };

  const breadcrumb = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: dict.articles.title,
        item: `${SITE}/${lang}/articles`,
      },
      { "@type": "ListItem", position: 2, name: article.title[lang], item: url },
    ],
  };

  return (
    <div className="flex flex-1 flex-col bg-[#f7f5ff]">
      <JsonLd data={jsonLd} />
      <JsonLd data={breadcrumb} />
      <SiteHeader lang={lang} dict={dict} />

      <main className="mx-auto w-full max-w-2xl flex-1 px-6 py-8 font-sans text-[#191539]">
        <Link
          href={`/${lang}/articles`}
          className="text-sm font-extrabold text-[#6d5cf7] hover:underline"
        >
          {dict.articles.back}
        </Link>

        <article className="mt-6">
          <div className="text-6xl">{article.emoji}</div>
          <h1 className="mt-4 font-display text-4xl font-bold leading-tight tracking-tight">
            {article.title[lang]}
          </h1>
          <time className="mt-2 block text-sm font-semibold text-[#5c5880]">
            {new Date(article.date).toLocaleDateString(
              lang === "ky" ? "ky-KG" : "ru-RU",
            )}
          </time>

          {article.sections.map((s, i) => (
            <Fragment key={i}>
              <section className="mt-8">
                <h2 className="font-display text-2xl font-bold">
                  {s.heading[lang]}
                </h2>
                {s.body.map((p, j) => (
                  <p
                    key={j}
                    className="mt-3 text-lg leading-8 text-[#2d2950]"
                  >
                    {p[lang]}
                  </p>
                ))}
              </section>
              {i === 0 && article.sections.length >= 2 && (
                <aside className="mt-8 flex flex-col items-start gap-3 rounded-2xl border-2 border-[#e6c079] bg-[#fbf3e3] p-5 sm:flex-row sm:items-center sm:justify-between sm:gap-5">
                  <p className="text-sm font-bold text-[#7a5a1e]">
                    💡 {dict.cta.inline}
                  </p>
                  <Link
                    href={`/${lang}/play`}
                    className="flex-none rounded-full bg-[#191539] px-5 py-2.5 text-sm font-extrabold text-white shadow transition hover:brightness-125"
                  >
                    {dict.cta.button} →
                  </Link>
                </aside>
              )}
            </Fragment>
          ))}
        </article>

        <div className="mt-12 overflow-hidden rounded-[28px] bg-[#191539] px-6 py-8 text-center text-white">
          <p className="font-display text-xl font-bold">{dict.cta.title}</p>
          <p className="mt-1.5 text-sm text-[#d9d5f5]">{dict.cta.subtitle}</p>
          <Link
            href={`/${lang}/play`}
            className="mt-4 inline-block rounded-full bg-[#6d5cf7] px-6 py-3 font-extrabold text-white shadow-[0_0_0_3px_#e6c079] transition hover:-translate-y-0.5"
          >
            {dict.cta.button}
          </Link>
        </div>

        {related.length > 0 && (
          <section className="mt-12">
            <h2 className="font-display text-lg font-bold text-[#5c5880]">
              {lang === "ky" ? "Дагы окуңуз" : "Читайте также"}
            </h2>
            <ul className="mt-4 space-y-3">
              {related.map((a) => (
                <li key={a.slug}>
                  <Link
                    href={`/${lang}/articles/${a.slug}`}
                    className="group flex items-center gap-3 rounded-2xl bg-white p-4 shadow-[0_6px_18px_rgba(25,21,57,.05)] transition hover:-translate-y-0.5 hover:shadow-[0_0_0_2px_#b9b3e6]"
                  >
                    <span className="text-2xl">{a.emoji}</span>
                    <span className="font-display font-bold transition group-hover:text-[#6d5cf7]">
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
